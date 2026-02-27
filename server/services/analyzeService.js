const User = require('../models/User');
const Job = require('../models/Job');
const { extractText, extractEntities } = require('./parsingService');
const { calculateATSScore } = require('./atsService');
const { fetchAndCacheJobs } = require('./jobFetchService');
const {
  calculateHybridScoreWithPrecomputed,
  analyzeSkillGap,
  buildTfIdfVector,
  computeCorpusStats,
} = require('./matchingService');
const { getIndustryTemplate } = require('./industryTemplateService');
const { computeIndustryReadiness } = require('./industryReadinessService');
const { metricsStore } = require('../middleware/metricsMiddleware');
const logger = require('../config/logger');

// ─── Utility ──────────────────────────────────────────────────────────────────

const withTimeout = async (promise, timeoutMs, timeoutMessage) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
};

// ─── Main Orchestrator ────────────────────────────────────────────────────────

/**
 * Full analysis pipeline:
 *   1. Parse resume + fetch jobs in PARALLEL (Promise.all)
 *   2. Compute corpus-level TF-IDF stats
 *   3. Rank jobs using precomputed vectors + user vector
 *   4. Calculate industry readiness
 *   5. Store analysis snapshot in history
 *
 * Each stage is instrumented with timing logs.
 */
const analyzeResume = async ({
  fileBuffer,
  fileMimetype,
  keyword,
  location = 'us',
  industry,
  userId,
}) => {
  const totalStart = Date.now();

  // ── Stage 1: Parse resume + Fetch jobs in PARALLEL ──────────────────────
  const parseStart = Date.now();

  const parsePromise = (async () => {
    const text = await extractText(fileBuffer, fileMimetype);
    const extractedData = extractEntities(text);
    return { text, extractedData };
  })();

  // Build the search keyword early from a quick parse if possible,
  // but since we need skills first, we resolve parse first then fetch.
  // However we CAN start the fetch with the user-supplied keyword.
  const earlyKeyword = keyword && String(keyword).trim();

  // If user gave a keyword, start fetch immediately in parallel with parsing.
  // Otherwise, we'll need the parsed skills first.
  let fetchPromise = null;
  if (earlyKeyword) {
    fetchPromise = withTimeout(
      fetchAndCacheJobs(earlyKeyword, location, 1),
      2500,
      'Adzuna API timeout'
    ).catch((err) => {
      logger.warn({ err: err.message }, 'Adzuna fetch skipped/timed out during parallel stage');
    });
  }

  // Await parsing (always needed)
  const [parseResult] = await Promise.all([
    parsePromise,
    fetchPromise, // may be null — that's fine
  ]);

  const { text, extractedData } = parseResult;
  const userSkills = extractedData.skills;
  const parseDuration = Date.now() - parseStart;
  logger.info({ parseDuration: `${parseDuration}ms`, skillCount: userSkills.length }, 'Resume parsed');

  if (!userSkills || userSkills.length === 0) {
    const error = new Error('Could not extract sufficient skills from the resume.');
    error.statusCode = 400;
    throw error;
  }

  // ── Stage 2: ATS Score ──────────────────────────────────────────────────
  const atsStart = Date.now();
  const { score, suggestions } = calculateATSScore(extractedData, text);
  logger.info({ atsDuration: `${Date.now() - atsStart}ms`, overall: score.overall }, 'ATS score computed');

  // ── Stage 3: Fetch jobs if not already started (no user keyword) ────────
  const searchKeyword = earlyKeyword || userSkills.slice(0, 3).join(' ');

  if (!earlyKeyword) {
    const fetchStart = Date.now();
    try {
      await withTimeout(
        fetchAndCacheJobs(searchKeyword, location, 1),
        2500,
        'Adzuna API timeout'
      );
    } catch (apiError) {
      logger.warn({ err: apiError.message, fetchDuration: `${Date.now() - fetchStart}ms` },
        'Adzuna fetch skipped/timed out, using cached DB jobs');
    }
  }

  // ── Stage 4: Update user resume data (fire-and-forget) ─────────────────
  if (userId) {
    User.findByIdAndUpdate(userId, {
      'resumeData.text': text,
      'resumeData.skills': userSkills,
      'resumeData.experience': extractedData.experience,
      'resumeData.education': extractedData.education,
      'resumeData.atsScore': score,
      'resumeData.suggestions': suggestions,
    }).catch((err) => logger.error({ err: err.message }, 'Error updating user resume data'));
  }

  // ── Stage 5: Retrieve + Rank jobs using precomputed TF-IDF vectors ─────
  const matchStart = Date.now();

  // 5a. Compute corpus-level document frequency
  const { df: corpusDocFreq, corpusSize } = await computeCorpusStats();

  // 5b. Build user's TF-IDF vector once (runtime cost)
  // The job vectors are PRECOMPUTED and stored in DB — no recomputation needed

  // 5c. Query matching jobs
  const dbJobs = await Job.find({
    $or: [
      { title: { $regex: searchKeyword, $options: 'i' } },
      { description: { $regex: searchKeyword, $options: 'i' } },
    ],
  });

  const jobsToRank = dbJobs.length > 0 ? dbJobs : await Job.find().limit(50);

  // 5d. Rank using precomputed vectors (70% cosine + 30% overlap)
  const rankedJobs = jobsToRank
    .map((job) => {
      // Use precomputed vector from DB if available
      const jobVector = job.vector && (job.vector instanceof Map ? job.vector : job.vector.toJSON?.() || job.vector);
      const hasPrecomputed = jobVector && Object.keys(jobVector).length > 0;

      const matchScore = hasPrecomputed
        ? calculateHybridScoreWithPrecomputed(userSkills, job.requiredSkills, jobVector, corpusDocFreq, corpusSize)
        : (() => {
          // Fallback: compute inline (for legacy/seeded jobs without vectors)
          const { calculateHybridScore } = require('./matchingService');
          return calculateHybridScore(userSkills, job.requiredSkills, corpusDocFreq, corpusSize);
        })();

      const gapAnalysis = analyzeSkillGap(userSkills, job.requiredSkills);

      return {
        title: job.title,
        company: job.company,
        matchScore,
        missingSkills: gapAnalysis.missingSkills,
        coverage: gapAnalysis.matchPercentage,
        redirect_url: job.redirect_url,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  const matchDuration = Date.now() - matchStart;
  logger.info(
    { matchDuration: `${matchDuration}ms`, jobsEvaluated: jobsToRank.length, topScore: rankedJobs[0]?.matchScore },
    'Job matching completed'
  );

  // ── Stage 6: Job Market Readiness ──────────────────────────────────────
  const jobMarketReadiness =
    rankedJobs.length > 0
      ? Math.round(rankedJobs.reduce((acc, job) => acc + job.matchScore, 0) / rankedJobs.length)
      : 0;

  const allMissingSkills = [...new Set(rankedJobs.flatMap((j) => j.missingSkills))].slice(0, 8);

  // ── Stage 7: Industry Readiness ────────────────────────────────────────
  const template = getIndustryTemplate(industry);
  const industryResult = template ? computeIndustryReadiness(userSkills, template) : null;

  // ── Stage 8: Store analysis snapshot in history ─────────────────────────
  if (userId) {
    const snapshot = {
      atsScore: score.overall,
      industryReadiness: industryResult ? industryResult.score : jobMarketReadiness,
      jobMarketReadiness,
      skillCount: userSkills.length,
      topMatchScore: rankedJobs[0]?.matchScore || 0,
      missingSkillCount: allMissingSkills.length,
      industry: industry || 'General',
    };

    User.findByIdAndUpdate(
      userId,
      { $push: { analysisHistory: { $each: [snapshot], $slice: -20 } } }
    ).catch((err) => logger.error({ err: err.message }, 'Error storing analysis history'));
  }

  // ── Metrics ─────────────────────────────────────────────────────────────
  const totalDuration = Date.now() - totalStart;
  metricsStore.analyzeTimes.push(totalDuration);
  metricsStore.totalAnalyzes++;

  logger.info(
    { totalDuration: `${totalDuration}ms`, parseDuration: `${parseDuration}ms`, matchDuration: `${matchDuration}ms` },
    'Full analysis pipeline completed'
  );

  // ── Return ──────────────────────────────────────────────────────────────
  return {
    atsScore: {
      overallScore: score.overall,
      breakdown: score.breakdown,
      suggestions,
    },
    extractedSkills: userSkills,
    industryReadiness: industryResult ? industryResult.score : jobMarketReadiness,
    industrySkillGap: industryResult
      ? {
        missing: industryResult.missing.slice(0, 8),
        coverage: industryResult.coverage,
        industry: template.name,
        matched: industryResult.matched.slice(0, 12),
      }
      : null,
    jobMarketReadiness,
    skillGap: {
      missing: allMissingSkills,
      coverage: jobMarketReadiness,
    },
    recommendedJobs: rankedJobs,
    performance: {
      totalMs: totalDuration,
      parseMs: parseDuration,
      matchMs: matchDuration,
    },
  };
};

module.exports = {
  analyzeResume,
};

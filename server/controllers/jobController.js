const Job = require('../models/Job');
const User = require('../models/User');
const { calculateHybridScore, calculateHybridScoreWithPrecomputed, analyzeSkillGap, computeCorpusStats } = require('../services/matchingService');
const { fetchAndCacheJobs } = require('../services/jobFetchService');
const logger = require('../config/logger');

// @desc    Search and rank jobs dynamically from Adzuna API
// @route   GET /api/jobs/search
// @access  Private
const searchJobs = async (req, res, next) => {
  try {
    const { keyword, location = 'us', page = 1 } = req.query;

    if (!keyword) {
      res.status(400);
      throw new Error('Please provide a keyword to search for jobs.');
    }

    // 1. Fetch from Adzuna and cache in DB (if necessary)
    await fetchAndCacheJobs(keyword, location, parseInt(page));

    // 2. Retrieve user skills for matching
    const user = await User.findById(req.user._id);
    if (!user || !user.resumeData || user.resumeData.skills.length === 0) {
      res.status(400);
      throw new Error('Please upload and parse a resume first to get match scores.');
    }
    const userSkills = user.resumeData.skills;

    // 3. Compute corpus-level TF-IDF stats
    const { df: corpusDocFreq, corpusSize } = await computeCorpusStats();

    // 4. Fetch jobs from DB matching the search criteria
    const dbJobs = await Job.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    });

    // 5. Rank jobs using precomputed vectors + corpus TF-IDF
    const rankedJobs = dbJobs.map(job => {
      const jobVector = job.vector && (job.vector instanceof Map ? job.vector : job.vector.toJSON?.() || job.vector);
      const hasPrecomputed = jobVector && Object.keys(jobVector).length > 0;

      const matchScore = hasPrecomputed
        ? calculateHybridScoreWithPrecomputed(userSkills, job.requiredSkills, jobVector, corpusDocFreq, corpusSize)
        : calculateHybridScore(userSkills, job.requiredSkills, corpusDocFreq, corpusSize);

      const gapAnalysis = analyzeSkillGap(userSkills, job.requiredSkills);

      return {
        title: job.title,
        company: job.company,
        location: job.location,
        matchScore,
        skillGap: `${gapAnalysis.matchPercentage}% Coverage`,
        missingSkills: gapAnalysis.missingSkills,
        redirect_url: job.redirect_url
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    // Apply basic algorithmic pagination locally on the sorted ranked list
    const limit = 20;
    const startIndex = (parseInt(page) - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRankedJobs = rankedJobs.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      count: paginatedRankedJobs.length,
      jobs: paginatedRankedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended jobs based on user resume (Legacy DB only)
// @route   GET /api/jobs/recommendations
// @access  Private
const getRecommendedJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.resumeData.skills.length === 0) {
      res.status(400);
      throw new Error('Please upload and parse a resume first to get recommendations.');
    }

    const { skills } = user.resumeData;

    // Compute corpus-level TF-IDF stats
    const { df: corpusDocFreq, corpusSize } = await computeCorpusStats();

    const jobs = await Job.find({});

    const rankedJobs = jobs.map(job => {
      const jobVector = job.vector && (job.vector instanceof Map ? job.vector : job.vector.toJSON?.() || job.vector);
      const hasPrecomputed = jobVector && Object.keys(jobVector).length > 0;

      const matchScore = hasPrecomputed
        ? calculateHybridScoreWithPrecomputed(skills, job.requiredSkills, jobVector, corpusDocFreq, corpusSize)
        : calculateHybridScore(skills, job.requiredSkills, corpusDocFreq, corpusSize);

      const gapAnalysis = analyzeSkillGap(skills, job.requiredSkills);

      return {
        job,
        matchScore,
        gapAnalysis
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.json(rankedJobs.slice(0, 5));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchJobs,
  getRecommendedJobs,
  getJobs
};

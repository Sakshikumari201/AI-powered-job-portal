const axios = require('axios');
const Job = require('../models/Job');
const { extractEntities } = require('./parsingService'); // Reusing NLP logic to extract skills
const { buildTfIdfVector } = require('./matchingService');
const { appStats } = require('../middleware/metricsMiddleware');
const logger = require('../config/logger');

/**
 * Computes document frequency map for TF-IDF across all job skill sets.
 */
const computeCorpusDocFreq = async () => {
  const jobs = await Job.find({}, 'requiredSkills').lean();
  const df = new Map();
  for (const job of jobs) {
    const uniqueSkills = new Set((job.requiredSkills || []).map(s => s.toLowerCase().trim()));
    for (const skill of uniqueSkills) {
      df.set(skill, (df.get(skill) || 0) + 1);
    }
  }
  return df;
};

/**
 * Normalizes Adzuna job response to our database schema format.
 */
const normalizeJob = (job) => {
  const extractedSkills = extractEntities(job.description || '').skills;

  return {
    title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // strip HTML
    company: job.company?.display_name || 'Unknown',
    description: job.description,
    location: job.location?.display_name || 'Remote',
    salary_min: job.salary_min || null,
    salary_max: job.salary_max || null,
    redirect_url: String(job.redirect_url),
    created: job.created,
    requiredSkills: extractedSkills
  };
};

/**
 * Fetches jobs dynamically from Adzuna API, caches them in MongoDB if needed.
 * Uses a 6-hour cache expiration window.
 * 
 * @param {String} keyword 
 * @param {String} location 
 * @param {Number} page 
 * @returns {Array} Array of job documents
 */
const fetchAndCacheJobs = async (keyword, location = 'us', page = 1) => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      throw new Error('Adzuna API credentials missing.');
    }

    const query = encodeURIComponent(keyword);
    // Since Adzuna requires a country code in URL (e.g., /in/ for India, /us/ for USA)
    // Map full location names to ISO-2 code if needed, but for simplicity, default 'in' or 'us'
    const countryCode = location.toLowerCase().includes('india') ? 'in' : 'us';
    const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=${query}`;

    // Check if we need to fetch from API. 
    // We'll search the DB for jobs containing the keyword in the title/desc that are newer than 6 hours.
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const cachedJobsCount = await Job.countDocuments({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ],
      updatedAt: { $gte: sixHoursAgo }
    });

    // If we have enough cached jobs globally for this keyword, just return the db call instead of hitting API
    if (cachedJobsCount >= 10 && page === 1) {
      appStats.cacheHits++;
      logger.info({ keyword, cachedJobsCount }, 'Cache hit for keyword; using DB jobs');
      // We don't return them here, the controller will run the matching engine against ALL db jobs.
      return true;
    }

    appStats.cacheMisses++;
    logger.info({ keyword, page }, 'Fetching from Adzuna API');
    const response = await axios.get(url);
    const results = response.data.results;

    if (!results || results.length === 0) {
      return true; // No jobs found, move on
    }

    // Normalize and Filter
    const jobDocs = results.map(normalizeJob);

    // Compute corpus doc frequencies for TF-IDF (including new jobs)
    const existingJobs = await Job.find({}, 'requiredSkills').lean();
    const allSkillSets = [
      ...existingJobs.map(j => j.requiredSkills || []),
      ...jobDocs.map(j => j.requiredSkills || [])
    ];
    const df = new Map();
    for (const skills of allSkillSets) {
      const uniqueSkills = new Set(skills.map(s => s.toLowerCase().trim()));
      for (const skill of uniqueSkills) {
        df.set(skill, (df.get(skill) || 0) + 1);
      }
    }
    const corpusSize = allSkillSets.length;

    // Precompute TF-IDF vectors and embed in job docs
    for (const doc of jobDocs) {
      doc.vector = buildTfIdfVector(doc.requiredSkills, df, corpusSize);
    }

    // Upsert into MongoDB to cache (avoid duplicates using redirect_url)
    const bulkOps = jobDocs.map(doc => ({
      updateOne: {
        filter: { redirect_url: doc.redirect_url },
        update: { $set: doc },
        upsert: true
      }
    }));

    await Job.bulkWrite(bulkOps);
    logger.info({ cachedJobs: bulkOps.length }, 'Cached normalized jobs in DB');

    return true;
  } catch (error) {
    logger.error({ err: error.message }, 'Error fetching jobs from Adzuna');
    throw new Error('Failed to fetch from external job API.');
  }
};

module.exports = {
  fetchAndCacheJobs
};

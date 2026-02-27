const cron = require('node-cron');
const { fetchAndCacheJobs } = require('../services/jobFetchService');
const logger = require('../config/logger');

// ── Industry keyword pools for pre-fetching ──────────────────────────────────
const INDUSTRY_KEYWORDS = [
  // Software Development
  'javascript developer',
  'react developer',
  'node.js developer',
  'full stack developer',
  'python developer',
  // Data Science
  'data scientist',
  'machine learning engineer',
  'data analyst',
  // DevOps
  'devops engineer',
  'cloud engineer',
  'kubernetes engineer',
  'site reliability engineer',
];

/**
 * Pre-fetches jobs for all industry keywords.
 * Runs sequentially with a small delay between requests to be respectful to the API.
 */
const prefetchJobs = async () => {
  logger.info({ keywords: INDUSTRY_KEYWORDS.length }, '🔄 [CRON] Starting scheduled job pre-fetch');
  const start = Date.now();
  let successCount = 0;
  let failCount = 0;

  for (const keyword of INDUSTRY_KEYWORDS) {
    try {
      await fetchAndCacheJobs(keyword, 'us', 1);
      successCount++;
      logger.debug({ keyword }, '[CRON] Pre-fetched jobs for keyword');
      // Small delay to avoid rate-limiting on external API
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      failCount++;
      logger.warn({ keyword, err: err.message }, '[CRON] Failed to pre-fetch keyword');
    }
  }

  const duration = Date.now() - start;
  logger.info(
    { duration: `${duration}ms`, successCount, failCount },
    '✅ [CRON] Scheduled job pre-fetch completed'
  );
};

/**
 * Starts the background cron worker.
 * Schedule: Every 6 hours (matches the MongoDB TTL index).
 * Cron expression: At minute 0 past every 6th hour.
 */
const startJobCron = () => {
  // Run every 6 hours: 0 */6 * * *
  cron.schedule('0 */6 * * *', async () => {
    logger.info('[CRON] Triggered scheduled job pre-fetch (every 6h)');
    await prefetchJobs();
  });

  logger.info('🕐 Background job cron worker started (every 6 hours)');

  // Also run once on startup after a short delay (let the server fully start)
  setTimeout(() => {
    logger.info('[CRON] Running initial job pre-fetch on startup');
    prefetchJobs().catch((err) =>
      logger.error({ err: err.message }, '[CRON] Initial pre-fetch failed')
    );
  }, 10000); // 10 second delay
};

module.exports = { startJobCron, prefetchJobs };

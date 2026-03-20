const { schedule } = require('@netlify/functions');
const connectDB = require('../config/db');
const { prefetchJobs } = require('../workers/jobCron');

const handler = async (event, context) => {
  try {
    console.log('[JOBS-CRON] Starting pre-fetch job...');
    await connectDB();
    await prefetchJobs();
    console.log('[JOBS-CRON] Successfully completed pre-fetch job');
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error('[JOBS-CRON] Unhandled error in scheduled function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Schedule it for every 6 hours: 0 */6 * * *
// In Netlify, this ensures the function is triggered by Netlify's cron service.
module.exports.handler = schedule('0 */6 * * *', handler);

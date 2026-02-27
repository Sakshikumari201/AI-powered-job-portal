const { getMetricsSnapshot } = require('../middleware/metricsMiddleware');
const Job = require('../models/Job');
const User = require('../models/User');
const logger = require('../config/logger');

// @desc    Get system health and performance metrics
// @route   GET /api/system/metrics
// @access  Public (could be protected in production)
const getSystemMetrics = async (req, res, next) => {
  try {
    const start = Date.now();

    // Get in-memory metrics snapshot
    const metrics = getMetricsSnapshot();

    // Add live DB stats
    const [totalJobs, totalUsers, cachedJobsLast6h] = await Promise.all([
      Job.countDocuments(),
      User.countDocuments(),
      Job.countDocuments({ createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } }),
    ]);

    const response = {
      status: 'healthy',
      ...metrics,
      database: {
        totalJobs,
        totalUsers,
        cachedJobsLast6h,
      },
      queryTimeMs: Date.now() - start,
    };

    logger.info({ queryTimeMs: response.queryTimeMs }, 'System metrics requested');
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSystemMetrics };

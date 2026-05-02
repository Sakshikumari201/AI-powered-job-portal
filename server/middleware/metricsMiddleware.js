const logger = require('../config/logger');

/**
 * Simple in-memory store for tracking app performance.
 * TODO: Move this to Redis or a database if we scale to multiple instances.
 */
const appStats = {
  cacheHits: 0,
  cacheMisses: 0,
  requestCounts: new Map(),
  responseTimes: [],
  // Tracking resume analysis specifically
  totalAnalyzes: 0,
  analyzeTimes: [],
  serverStartedAt: new Date(),
};

// Helper to log the current state of metrics
const logMetrics = () => {
  const totalRequests = Array.from(appStats.requestCounts.values()).reduce((a, b) => a + b, 0);
  const cacheTotal = appStats.cacheHits + appStats.cacheMisses;
  const cacheHitRate = cacheTotal > 0
    ? (appStats.cacheHits / cacheTotal * 100).toFixed(2)
    : '0.00';
  const avgResponseTime = appStats.responseTimes.length > 0
    ? (appStats.responseTimes.reduce((a, b) => a + b, 0) / appStats.responseTimes.length).toFixed(2)
    : '0.00';
  const avgAnalyzeTime = appStats.analyzeTimes.length > 0
    ? (appStats.analyzeTimes.reduce((a, b) => a + b, 0) / appStats.analyzeTimes.length).toFixed(2)
    : '0.00';

  logger.info({
    cacheHits: appStats.cacheHits,
    cacheMisses: appStats.cacheMisses,
    cacheHitRate: `${cacheHitRate}%`,
    totalRequests,
    avgResponseTime: `${avgResponseTime}ms`,
    totalAnalyzes: appStats.totalAnalyzes,
    avgAnalyzeTime: `${avgAnalyzeTime}ms`,
    endpointCounts: Object.fromEntries(appStats.requestCounts)
  }, 'Performance metrics snapshot');
};

/**
 * Returns a serializable snapshot of current metrics.
 * Useful for the dashboard or health checks.
 */
const getMetricsSnapshot = () => {
  const cacheTotal = appStats.cacheHits + appStats.cacheMisses;

  return {
    uptime: Math.round((Date.now() - appStats.serverStartedAt.getTime()) / 1000),
    cache: {
      hits: appStats.cacheHits,
      misses: appStats.cacheMisses,
      hitRate: cacheTotal > 0
        ? `${(appStats.cacheHits / cacheTotal * 100).toFixed(2)}%`
        : '0.00%',
    },
    analyze: {
      totalResumesAnalyzed: appStats.totalAnalyzes,
      avgAnalyzeTimeMs: appStats.analyzeTimes.length > 0
        ? Math.round(appStats.analyzeTimes.reduce((a, b) => a + b, 0) / appStats.analyzeTimes.length)
        : 0,
      lastAnalyzeTimeMs: appStats.analyzeTimes.length > 0
        ? appStats.analyzeTimes[appStats.analyzeTimes.length - 1]
        : 0,
      p95AnalyzeTimeMs: (() => {
        if (appStats.analyzeTimes.length === 0) return 0;
        const sorted = [...appStats.analyzeTimes].sort((a, b) => a - b);
        const idx = Math.floor(sorted.length * 0.95);
        return sorted[Math.min(idx, sorted.length - 1)];
      })(),
    },
    requests: {
      totalRequests: Array.from(appStats.requestCounts.values()).reduce((a, b) => a + b, 0),
      avgResponseTimeMs: appStats.responseTimes.length > 0
        ? Math.round(appStats.responseTimes.reduce((a, b) => a + b, 0) / appStats.responseTimes.length)
        : 0,
      endpointCounts: Object.fromEntries(appStats.requestCounts),
    },
    serverStartedAt: appStats.serverStartedAt.toISOString(),
  };
};

// Log and reset rolling window metrics every 5 minutes
setInterval(() => {
  logMetrics();
  appStats.requestCounts.clear();
  appStats.responseTimes = [];
}, 5 * 60 * 1000);

// Middleware to record how long each request takes
const recordResponseTime = (req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    appStats.responseTimes.push(duration);
    const route = req.route?.path || req.path;
    appStats.requestCounts.set(route, (appStats.requestCounts.get(route) || 0) + 1);
    
    // Debug log for every request
    logger.debug({ 
      method: req.method, 
      route, 
      duration, 
      status: res.statusCode 
    }, 'Request tracking');
  });
  next();
};

module.exports = { recordResponseTime, appStats, getMetricsSnapshot };

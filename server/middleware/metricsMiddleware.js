const logger = require('../config/logger');

const metricsStore = {
  cacheHits: 0,
  cacheMisses: 0,
  requestCounts: new Map(),
  responseTimes: [],
  // ── Analyze-specific metrics ──────────────────────────────────────────
  totalAnalyzes: 0,
  analyzeTimes: [],
  serverStartedAt: new Date(),
};

const logMetrics = () => {
  const totalRequests = Array.from(metricsStore.requestCounts.values()).reduce((a, b) => a + b, 0);
  const cacheTotal = metricsStore.cacheHits + metricsStore.cacheMisses;
  const cacheHitRate = cacheTotal > 0
    ? (metricsStore.cacheHits / cacheTotal * 100).toFixed(2)
    : '0.00';
  const avgResponseTime = metricsStore.responseTimes.length > 0
    ? (metricsStore.responseTimes.reduce((a, b) => a + b, 0) / metricsStore.responseTimes.length).toFixed(2)
    : '0.00';
  const avgAnalyzeTime = metricsStore.analyzeTimes.length > 0
    ? (metricsStore.analyzeTimes.reduce((a, b) => a + b, 0) / metricsStore.analyzeTimes.length).toFixed(2)
    : '0.00';

  logger.info({
    cacheHits: metricsStore.cacheHits,
    cacheMisses: metricsStore.cacheMisses,
    cacheHitRate: `${cacheHitRate}%`,
    totalRequests,
    avgResponseTime: `${avgResponseTime}ms`,
    totalAnalyzes: metricsStore.totalAnalyzes,
    avgAnalyzeTime: `${avgAnalyzeTime}ms`,
    endpointCounts: Object.fromEntries(metricsStore.requestCounts)
  }, 'Performance metrics snapshot');
};

/**
 * Returns a serializable snapshot of current metrics.
 * Used by the /api/system/metrics endpoint.
 */
const getMetricsSnapshot = () => {
  const cacheTotal = metricsStore.cacheHits + metricsStore.cacheMisses;

  return {
    uptime: Math.round((Date.now() - metricsStore.serverStartedAt.getTime()) / 1000),
    cache: {
      hits: metricsStore.cacheHits,
      misses: metricsStore.cacheMisses,
      hitRate: cacheTotal > 0
        ? `${(metricsStore.cacheHits / cacheTotal * 100).toFixed(2)}%`
        : '0.00%',
    },
    analyze: {
      totalResumesAnalyzed: metricsStore.totalAnalyzes,
      avgAnalyzeTimeMs: metricsStore.analyzeTimes.length > 0
        ? Math.round(metricsStore.analyzeTimes.reduce((a, b) => a + b, 0) / metricsStore.analyzeTimes.length)
        : 0,
      lastAnalyzeTimeMs: metricsStore.analyzeTimes.length > 0
        ? metricsStore.analyzeTimes[metricsStore.analyzeTimes.length - 1]
        : 0,
      p95AnalyzeTimeMs: (() => {
        if (metricsStore.analyzeTimes.length === 0) return 0;
        const sorted = [...metricsStore.analyzeTimes].sort((a, b) => a - b);
        const idx = Math.floor(sorted.length * 0.95);
        return sorted[Math.min(idx, sorted.length - 1)];
      })(),
    },
    requests: {
      totalRequests: Array.from(metricsStore.requestCounts.values()).reduce((a, b) => a + b, 0),
      avgResponseTimeMs: metricsStore.responseTimes.length > 0
        ? Math.round(metricsStore.responseTimes.reduce((a, b) => a + b, 0) / metricsStore.responseTimes.length)
        : 0,
      endpointCounts: Object.fromEntries(metricsStore.requestCounts),
    },
    serverStartedAt: metricsStore.serverStartedAt.toISOString(),
  };
};

// Log metrics every 5 minutes (aggregate window)
setInterval(() => {
  logMetrics();
  // Only reset rolling windows, keep cumulative counters
  metricsStore.requestCounts.clear();
  metricsStore.responseTimes = [];
}, 5 * 60 * 1000);

const recordResponseTime = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metricsStore.responseTimes.push(duration);
    const route = req.route?.path || req.path;
    metricsStore.requestCounts.set(route, (metricsStore.requestCounts.get(route) || 0) + 1);
    logger.debug({ method: req.method, route, duration, statusCode: res.statusCode }, 'Request completed');
  });
  next();
};

module.exports = { recordResponseTime, metricsStore, getMetricsSnapshot };

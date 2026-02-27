const rateLimit = require('express-rate-limit');

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

module.exports = {
  analyzeLimiter,
};

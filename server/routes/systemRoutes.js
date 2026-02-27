const express = require('express');
const router = express.Router();
const { getSystemMetrics } = require('../controllers/systemController');

// GET /api/system/metrics
router.get('/metrics', getSystemMetrics);

module.exports = router;

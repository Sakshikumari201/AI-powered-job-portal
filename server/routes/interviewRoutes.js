const express = require('express');
const router = express.Router();
const { simulateInterview } = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/simulate', protect, simulateInterview);

module.exports = router;

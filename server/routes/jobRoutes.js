const express = require('express');
const router = express.Router();
const { searchJobs, getRecommendedJobs, getJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchJobs);
router.get('/recommendations', protect, getRecommendedJobs);
router.get('/', getJobs);

module.exports = router;

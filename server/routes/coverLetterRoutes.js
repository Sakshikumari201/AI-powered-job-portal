const express = require('express');
const router = express.Router();
const { getCoverLetter } = require('../controllers/coverLetterController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, getCoverLetter);

module.exports = router;

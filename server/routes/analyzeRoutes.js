const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { analyzeLimiter } = require('../middleware/rateLimitMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { analyzeResume } = require('../controllers/analyzeController');
const { analyzeSchema, validate } = require('../middleware/validationMiddleware');

router.post('/', protect, analyzeLimiter, upload.single('resume'), validate(analyzeSchema), analyzeResume);

module.exports = router;

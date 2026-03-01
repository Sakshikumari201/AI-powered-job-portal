const asyncHandler = require('express-async-handler');
const { generateCoverLetter } = require('../services/coverLetterService');
const logger = require('../config/logger');

const getCoverLetter = asyncHandler(async (req, res) => {
  const { resumeData, jobData } = req.body;

  if (!resumeData || !jobData) {
    res.status(400);
    throw new Error('Please provide both resumeData and jobData');
  }

  try {
    const coverLetter = await generateCoverLetter(resumeData, jobData);
    res.status(200).json({
      success: true,
      data: coverLetter
    });
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = {
  getCoverLetter
};

const { analyzeResume: analyzeResumeService } = require('../services/analyzeService');

// @desc    Real-time AI analyze endpoint merging parsing, scoring, fetching, and matching
// @route   POST /api/analyze
// @access  Private
const analyzeResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file (PDF, DOC, DOCX)');
    }

    const { keyword, location = 'us', industry } = req.validatedBody || req.body;

    const result = await analyzeResumeService({
      fileBuffer: req.file.buffer,
      fileMimetype: req.file.mimetype,
      keyword,
      location,
      industry,
      userId: req.user?._id,
    });

    res.status(200).json(result);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume
};

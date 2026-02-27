const User = require('../models/User');
const { extractText, extractEntities } = require('../services/parsingService');
const { calculateATSScore } = require('../services/atsService');

// @desc    Upload resume and parse data
// @route   POST /api/resumes/upload
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const fileBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;

    // 1. Extract Text
    const text = await extractText(fileBuffer, mimetype);

    // 2. Extract Entities
    const extractedData = extractEntities(text);

    // 3. Calculate ATS Score
    const { score, suggestions } = calculateATSScore(extractedData, text);

    // 4. Update User with Resume Data
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        'resumeData.text': text,
        'resumeData.skills': extractedData.skills,
        'resumeData.experience': extractedData.experience,
        'resumeData.education': extractedData.education,
        'resumeData.atsScore': score,
        'resumeData.suggestions': suggestions
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Resume parsed and analyzed successfully. You can now search for jobs.',
      resumeData: updatedUser.resumeData
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user resume analysis
// @route   GET /api/resumes/analysis
// @access  Private
const getResumeAnalysis = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || (!user.resumeData.text && !user.resumeData.skills.length)) {
      res.status(404);
      throw new Error('No resume data found for this user. Please upload a resume first.');
    }

    res.status(200).json(user.resumeData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumeAnalysis
};

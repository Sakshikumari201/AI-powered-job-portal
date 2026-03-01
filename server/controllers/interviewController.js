const asyncHandler = require('express-async-handler');
const { conductMockInterview } = require('../services/interviewService');

const simulateInterview = asyncHandler(async (req, res) => {
  const { jobTitle, skills, history } = req.body;

  if (!jobTitle || !skills) {
    res.status(400);
    throw new Error('Please provide jobTitle and skills');
  }

  try {
    const feedbackAndNextQ = await conductMockInterview(jobTitle, skills, history || []);
    res.status(200).json({ success: true, aiResponse: feedbackAndNextQ });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { simulateInterview };

const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');

// @desc    Get user applications
// @route   GET /api/applications
// @access  Private
const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.status(200).json(applications);
});

// @desc    Create new application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const { company, title, url, location, status, notes } = req.body;

  if (!company || !title) {
    res.status(400);
    throw new Error('Please add a company and a job title');
  }

  const application = await Application.create({
    user: req.user.id,
    company,
    title,
    url,
    location,
    status: status || 'Saved',
    notes
  });

  res.status(201).json(application);
});

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check for user
  if (application.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const updatedApplication = await Application.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedApplication);
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check for user
  if (application.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  await application.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
};

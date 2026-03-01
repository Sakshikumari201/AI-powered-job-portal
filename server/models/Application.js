const mongoose = require('mongoose');

const applicationSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  company: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Interviewing', 'Offers', 'Rejected'],
    default: 'Saved'
  },
  url: {
    type: String
  },
  location: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a job description']
    },
    location: {
      type: String,
      default: 'Remote'
    },
    salary_min: Number,
    salary_max: Number,
    redirect_url: {
      type: String,
      unique: true,
      sparse: true
    },
    created: String,
    industry: {
      type: String,
      default: 'General'
    },
    requiredSkills: {
      type: [String],
      default: []
    },
    vector: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  {
    timestamps: true,
  }
);

// TTL index: automatically delete documents 6 hours after createdAt
jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 21600 });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;

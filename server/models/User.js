const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const analysisSnapshotSchema = new mongoose.Schema(
  {
    atsScore: { type: Number, default: 0 },
    industryReadiness: { type: Number, default: 0 },
    jobMarketReadiness: { type: Number, default: 0 },
    skillCount: { type: Number, default: 0 },
    topMatchScore: { type: Number, default: 0 },
    missingSkillCount: { type: Number, default: 0 },
    industry: { type: String, default: 'General' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      minlength: 6,
      select: false, // Don't return password by default
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    industry: {
      type: String,
      default: 'General',
    },
    resumeData: {
      text: { type: String },
      skills: [{ type: String }],
      experience: [{ type: String }],
      education: [{ type: String }],
      atsScore: {
        overall: { type: Number, default: 0 },
        breakdown: {
          skills: { type: Number, default: 0 },
          keywords: { type: Number, default: 0 },
          experience: { type: Number, default: 0 },
          education: { type: Number, default: 0 },
          structure: { type: Number, default: 0 },
          grammar: { type: Number, default: 0 }
        }
      },
      suggestions: [{ type: String }]
    },
    // ── Resume Version History ──────────────────────────────────────────
    // Stores the last 20 analysis snapshots for trend tracking.
    // Each snapshot captures key metrics at the time of analysis.
    analysisHistory: {
      type: [analysisSnapshotSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handles new user signup
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, industry } = req.body;

    // quick check if user is already in the db
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }

    const newUser = await User.create({
      name,
      email,
      password,
      industry: industry || 'General',
    });

    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        industry: newUser.industry,
        token: generateToken(newUser._id),
      });
    } else {
      res.status(400);
      throw new Error('Something went wrong during registration');
    }
  } catch (err) {
    next(err);
  }
};

// Standard login logic
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const userRecord = await User.findOne({ email }).select('+password');

    if (userRecord && (await userRecord.matchPassword(password))) {
      res.json({
        _id: userRecord._id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        industry: userRecord.industry,
        avatar: userRecord.avatar,
        token: generateToken(userRecord._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (err) {
    next(err);
  }
};

// Google OAuth integration
const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('No google credential found');
    }

    // Verify token with google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // Sync google info if missing
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Auto-create account for new google users
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture,
        industry: 'General',
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      industry: user.industry,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// Fetches current user info for dashboard
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        industry: user.industry,
        avatar: user.avatar,
        resumeData: user.resumeData,
        analysisHistory: user.analysisHistory || [],
      });
    } else {
      res.status(404);
      throw new Error('User not found in system');
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  getUserProfile,
};


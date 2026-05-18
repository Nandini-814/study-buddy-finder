const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, college, skillsKnown, skillsWanted, availability } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      college: college || '',
      skillsKnown: skillsKnown || [],
      skillsWanted: skillsWanted || [],
      availability: availability || [],
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          skillsKnown: user.skillsKnown,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          skillsKnown: user.skillsKnown,
          skillsWanted: user.skillsWanted,
          availability: user.availability,
          bio: user.bio,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };

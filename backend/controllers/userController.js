const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, college, bio, skillsKnown, skillsWanted, availability } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.college = college !== undefined ? college : user.college;
    user.bio = bio !== undefined ? bio : user.bio;
    user.skillsKnown = skillsKnown || user.skillsKnown;
    user.skillsWanted = skillsWanted || user.skillsWanted;
    user.availability = availability || user.availability;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        skillsKnown: updatedUser.skillsKnown,
        skillsWanted: updatedUser.skillsWanted,
        availability: updatedUser.availability,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users (for search/browse)
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const { subject } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (subject) {
      query.$or = [
        { skillsKnown: { $regex: subject, $options: 'i' } },
        { skillsWanted: { $regex: subject, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').lean();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, getUserById };

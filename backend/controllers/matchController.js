const User = require('../models/User');
const Match = require('../models/Match');

// Calculate match score between two users
const calculateMatchScore = (currentUser, otherUser) => {
  let score = 0;
  const commonSubjects = [];

  // Teaching-learning match (what I know vs what they want)
  currentUser.skillsKnown.forEach((skill) => {
    if (
      otherUser.skillsWanted.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      )
    ) {
      score += 3;
      if (!commonSubjects.includes(skill)) commonSubjects.push(skill);
    }
  });

  // Learning-teaching match (what I want vs what they know)
  currentUser.skillsWanted.forEach((skill) => {
    if (
      otherUser.skillsKnown.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      )
    ) {
      score += 3;
      if (!commonSubjects.includes(skill)) commonSubjects.push(skill);
    }
  });

  // Common subjects (both know or both want to learn)
  currentUser.skillsKnown.forEach((skill) => {
    if (
      otherUser.skillsKnown.some(
        (s) => s.toLowerCase() === skill.toLowerCase()
      )
    ) {
      score += 1;
      if (!commonSubjects.includes(skill)) commonSubjects.push(skill);
    }
  });

  // Availability overlap
  const availabilityOverlap = currentUser.availability.filter((a) =>
    otherUser.availability.includes(a)
  );
  score += availabilityOverlap.length * 2;

  return { score, commonSubjects };
};

// @desc    Get suggested matches
// @route   GET /api/match/find
// @access  Private
const findMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get all users except current
    const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('-password');

    // Get existing matches
    const existingMatches = await Match.find({ userId: req.user._id });
    const matchedIds = existingMatches.map((m) => m.matchedUserId.toString());

    const suggestions = allUsers
      .map((user) => {
        const { score, commonSubjects } = calculateMatchScore(currentUser, user);
        return {
          user,
          score,
          commonSubjects,
          isMatched: matchedIds.includes(user._id.toString()),
          matchStatus: existingMatches.find(
            (m) => m.matchedUserId.toString() === user._id.toString()
          )?.status || null,
        };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send connect request
// @route   POST /api/match/connect/:userId
// @access  Private
const sendConnectRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot connect with yourself' });
    }

    // Check if match already exists
    const existingMatch = await Match.findOne({
      userId: req.user._id,
      matchedUserId: userId,
    });

    if (existingMatch) {
      return res.status(400).json({ success: false, message: 'Connection request already sent' });
    }

    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(userId);
    const { commonSubjects } = calculateMatchScore(currentUser, otherUser);

    const match = await Match.create({
      userId: req.user._id,
      matchedUserId: userId,
      status: 'pending',
      commonSubjects,
    });

    res.status(201).json({ success: true, message: 'Connection request sent', data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept/Reject match request
// @route   PUT /api/match/:matchId
// @access  Private
const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const match = await Match.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.matchedUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    match.status = status;
    await match.save();

    // If accepted, create reverse match too
    if (status === 'accepted') {
      const reverseExists = await Match.findOne({
        userId: match.matchedUserId,
        matchedUserId: match.userId,
      });

      if (!reverseExists) {
        await Match.create({
          userId: match.matchedUserId,
          matchedUserId: match.userId,
          status: 'accepted',
          commonSubjects: match.commonSubjects,
        });
      }
    }

    res.json({ success: true, message: `Request ${status}`, data: match });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's connections (accepted matches)
// @route   GET /api/match/connections
// @access  Private
const getConnections = async (req, res) => {
  try {
    const matches = await Match.find({
      userId: req.user._id,
      status: 'accepted',
    }).populate('matchedUserId', '-password');

    res.json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get incoming requests
// @route   GET /api/match/requests
// @access  Private
const getRequests = async (req, res) => {
  try {
    const requests = await Match.find({
      matchedUserId: req.user._id,
      status: 'pending',
    }).populate('userId', '-password');

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { findMatches, sendConnectRequest, updateMatchStatus, getConnections, getRequests };

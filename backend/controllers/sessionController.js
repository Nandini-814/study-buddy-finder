const Session = require('../models/Session');

// @desc    Create a study session
// @route   POST /api/sessions/create
// @access  Private
const createSession = async (req, res) => {
  try {
    const { title, subject, description, date, time, duration, participants, meetingLink } = req.body;

    const session = await Session.create({
      creatorId: req.user._id,
      title,
      subject,
      description: description || '',
      date,
      time,
      duration: duration || 60,
      participants: participants || [],
      meetingLink: meetingLink || '',
    });

    const populated = await session.populate([
      { path: 'creatorId', select: 'name email avatar' },
      { path: 'participants', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, message: 'Study session created', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sessions for current user
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { creatorId: req.user._id },
        { participants: req.user._id },
      ],
    })
      .populate('creatorId', 'name email avatar')
      .populate('participants', 'name email avatar')
      .sort({ date: 1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('creatorId', 'name email avatar')
      .populate('participants', 'name email avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a session
// @route   PUT /api/sessions/:id/join
// @access  Private
const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.participants.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already joined this session' });
    }

    session.participants.push(req.user._id);
    await session.save();

    res.json({ success: true, message: 'Joined session successfully', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this session' });
    }

    await session.deleteOne();
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSession, getSessions, getSessionById, joinSession, deleteSession };

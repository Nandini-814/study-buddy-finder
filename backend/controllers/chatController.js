const Message = require('../models/Message');
const Match = require('../models/Match');

// @desc    Get chat messages between two users
// @route   GET /api/chat/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userId },
        { senderId: userId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar');

    // Mark received messages as read
    await Message.updateMany(
      { senderId: userId, receiverId: myId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    const newMessage = await Message.create({
      senderId: req.user._id,
      receiverId,
      message,
    });

    const populated = await newMessage.populate('senderId', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all conversations for the user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id;

    // Get all unique users the current user has chatted with
    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    }).sort({ createdAt: -1 });

    const conversationMap = new Map();
    messages.forEach((msg) => {
      const otherId =
        msg.senderId.toString() === myId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!conversationMap.has(otherId)) {
        conversationMap.set(otherId, msg);
      }
    });

    const Message2 = require('../models/Message');
    const User = require('../models/User');
    const conversationList = await Promise.all(
      Array.from(conversationMap.entries()).map(async ([userId, lastMsg]) => {
        const user = await User.findById(userId).select('name avatar email isOnline');
        const unreadCount = await Message2.countDocuments({
          senderId: userId,
          receiverId: myId,
          isRead: false,
        });
        return { user, lastMessage: lastMsg, unreadCount };
      })
    );

    res.json({ success: true, data: conversationList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations };

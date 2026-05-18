const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, getConversations } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chat/conversations
router.get('/conversations', protect, getConversations);

// GET /api/chat/messages/:userId
router.get('/messages/:userId', protect, getMessages);

// POST /api/chat/messages
router.post('/messages', protect, sendMessage);

module.exports = router;

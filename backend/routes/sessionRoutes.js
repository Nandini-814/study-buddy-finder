const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessions,
  getSessionById,
  joinSession,
  deleteSession,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/sessions
router.get('/', protect, getSessions);

// POST /api/sessions/create
router.post('/create', protect, createSession);

// GET /api/sessions/:id
router.get('/:id', protect, getSessionById);

// PUT /api/sessions/:id/join
router.put('/:id/join', protect, joinSession);

// DELETE /api/sessions/:id
router.delete('/:id', protect, deleteSession);

module.exports = router;

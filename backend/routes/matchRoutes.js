const express = require('express');
const router = express.Router();
const {
  findMatches,
  sendConnectRequest,
  updateMatchStatus,
  getConnections,
  getRequests,
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/match/find
router.get('/find', protect, findMatches);

// GET /api/match/connections
router.get('/connections', protect, getConnections);

// GET /api/match/requests
router.get('/requests', protect, getRequests);

// POST /api/match/connect/:userId
router.post('/connect/:userId', protect, sendConnectRequest);

// PUT /api/match/:matchId
router.put('/:matchId', protect, updateMatchStatus);

module.exports = router;

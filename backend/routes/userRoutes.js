const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/profile
router.get('/profile', protect, getProfile);

// PUT /api/users/profile
router.put('/profile', protect, updateProfile);

// GET /api/users
router.get('/', protect, getAllUsers);

// GET /api/users/:id
router.get('/:id', protect, getUserById);

module.exports = router;

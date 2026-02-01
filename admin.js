/**
 * Admin Routes
 * Routes for administrative operations
 */

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllItems,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/items', getAllItems);

module.exports = router;

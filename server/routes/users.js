import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  getBadges,
  getStats
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Get user badges
router.get('/badges', getBadges);

// Get user statistics
router.get('/stats', getStats);

export default router;
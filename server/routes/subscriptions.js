import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateSubscription } from '../middleware/validation.js';
import {
  getPlans,
  subscribe,
  getCurrentSubscription,
  cancelSubscription
} from '../controllers/subscriptionController.js';

const router = express.Router();

// Get available plans (no auth required)
router.get('/plans', getPlans);

// All other routes require authentication
router.use(requireAuth);

// Subscribe to a plan
router.post('/subscribe', validateSubscription, subscribe);

// Get current subscription
router.get('/current', getCurrentSubscription);

// Cancel subscription
router.post('/cancel', cancelSubscription);

export default router;
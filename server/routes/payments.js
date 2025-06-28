import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validatePaymentInitiation } from '../middleware/validation.js';
import {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  handleMpesaCallback
} from '../controllers/paymentController.js';

const router = express.Router();

// M-Pesa callback (no auth required)
router.post('/mpesa/callback', handleMpesaCallback);

// All other routes require authentication
router.use(requireAuth);

// Initiate payment
router.post('/initiate', validatePaymentInitiation, initiatePayment);

// Verify payment status
router.get('/verify/:transactionId', verifyPayment);

// Get payment history
router.get('/history', getPaymentHistory);

export default router;
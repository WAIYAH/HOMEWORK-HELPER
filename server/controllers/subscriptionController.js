import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { initiateMpesaPayment } from '../utils/mpesa.js';

const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Unlimited',
    description: 'Unlimited questions for one month',
    price: 200,
    duration: 30, // days
    features: [
      'Unlimited questions',
      'Priority AI processing',
      'Advanced explanations',
      'Progress tracking',
      'Achievement badges',
      'Priority support',
      'Family dashboard'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Unlimited',
    description: 'Unlimited questions for one year',
    price: 2000,
    duration: 365, // days
    features: [
      'All monthly features',
      'Save 17% compared to monthly',
      'Extended progress history',
      'Premium support',
      'Early access to new features'
    ]
  }
};

export const getPlans = async (req, res) => {
  try {
    res.json({
      data: Object.values(SUBSCRIPTION_PLANS)
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      message: 'Failed to fetch subscription plans',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { planId, phoneNumber } = req.body;
    const userId = req.user.clerkId;

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    // Check if user already has active subscription
    const user = await User.findByClerkId(userId);
    if (user.hasActiveSubscription()) {
      return res.status(400).json({ 
        message: 'You already have an active subscription',
        currentSubscription: user.subscription
      });
    }

    // Create payment record
    const payment = new Payment({
      userId,
      type: 'subscription',
      amount: plan.price,
      mpesa: {
        phoneNumber
      },
      subscription: {
        planId: plan.id,
        planName: plan.name,
        duration: `${plan.duration} days`,
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000)
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await payment.save();

    // Initiate M-Pesa payment
    const mpesaResponse = await initiateMpesaPayment({
      phoneNumber,
      amount: plan.price,
      accountReference: `SUB-${userId.slice(-6)}`,
      transactionDesc: `${plan.name} subscription`
    });

    if (mpesaResponse.success) {
      payment.mpesa.checkoutRequestId = mpesaResponse.data.CheckoutRequestID;
      payment.mpesa.merchantRequestId = mpesaResponse.data.MerchantRequestID;
      await payment.save();

      res.json({
        message: 'Subscription payment initiated successfully',
        data: {
          paymentId: payment._id,
          checkoutRequestId: mpesaResponse.data.CheckoutRequestID,
          plan: plan,
          status: 'pending'
        }
      });
    } else {
      payment.status = 'failed';
      payment.mpesa.resultDesc = mpesaResponse.message;
      await payment.save();

      res.status(400).json({
        message: 'Failed to initiate subscription payment',
        error: mpesaResponse.message
      });
    }

  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({
      message: 'Failed to process subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const user = await User.findByClerkId(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscription = user.subscription;
    const isActive = user.hasActiveSubscription();

    res.json({
      data: {
        ...subscription.toObject(),
        isActive,
        plan: subscription.plan ? SUBSCRIPTION_PLANS[subscription.plan] : null,
        daysRemaining: isActive ? 
          Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
      }
    });

  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({
      message: 'Failed to fetch subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const user = await User.findByClerkId(userId);

    if (!user || !user.hasActiveSubscription()) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    // Update subscription status
    user.subscription.status = 'cancelled';
    await user.save();

    res.json({
      message: 'Subscription cancelled successfully',
      data: {
        status: 'cancelled',
        endDate: user.subscription.endDate,
        message: 'Your subscription will remain active until the end of the current billing period'
      }
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      message: 'Failed to cancel subscription',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
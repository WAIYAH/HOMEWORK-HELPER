import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify the token with Clerk
    const payload = await clerkClient.verifyToken(token);
    
    if (!payload || !payload.sub) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(payload.sub);
    
    if (!clerkUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Find or create user in our database
    let user = await User.findByClerkId(clerkUser.id);
    
    if (!user) {
      user = await User.createFromClerk(clerkUser);
    }

    // Attach user info to request
    req.user = user;
    req.clerkUser = clerkUser;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const payload = await clerkClient.verifyToken(token);
      
      if (payload && payload.sub) {
        const clerkUser = await clerkClient.users.getUser(payload.sub);
        const user = await User.findByClerkId(clerkUser.id);
        
        req.user = user;
        req.clerkUser = clerkUser;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

export const requireSubscription = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.hasActiveSubscription()) {
      return res.status(403).json({ 
        message: 'Active subscription required',
        subscriptionStatus: req.user.subscription.status 
      });
    }

    next();
  } catch (error) {
    console.error('Subscription middleware error:', error);
    res.status(500).json({ message: 'Subscription check failed' });
  }
};
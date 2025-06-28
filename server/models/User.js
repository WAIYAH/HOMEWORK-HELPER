import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  earnedAt: { type: Date, default: Date.now },
  icon: { type: String, default: 'star' }
});

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  firstName: String,
  lastName: String,
  profileImage: String,
  subscription: {
    status: {
      type: String,
      enum: ['none', 'active', 'cancelled', 'expired'],
      default: 'none'
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: null
    },
    startDate: Date,
    endDate: Date,
    mpesaTransactionId: String
  },
  badges: [badgeSchema],
  stats: {
    totalQuestions: { type: Number, default: 0 },
    answeredQuestions: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 },
    lastActiveDate: Date
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    emailUpdates: { type: Boolean, default: true },
    defaultGradeLevel: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.status': 1 });

// Methods
userSchema.methods.hasActiveSubscription = function() {
  return this.subscription.status === 'active' && 
         this.subscription.endDate > new Date();
};

userSchema.methods.addBadge = function(badgeData) {
  const existingBadge = this.badges.find(badge => badge.id === badgeData.id);
  if (!existingBadge) {
    this.badges.push(badgeData);
    return true;
  }
  return false;
};

userSchema.methods.updateStats = function(questionData) {
  this.stats.totalQuestions += 1;
  if (questionData.status === 'answered') {
    this.stats.answeredQuestions += 1;
  }
  if (questionData.amount) {
    this.stats.totalSpent += questionData.amount;
  }
  this.stats.lastActiveDate = new Date();
};

// Static methods
userSchema.statics.findByClerkId = function(clerkId) {
  return this.findOne({ clerkId });
};

userSchema.statics.createFromClerk = function(clerkUser) {
  return this.create({
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    profileImage: clerkUser.profileImageUrl
  });
};

export default mongoose.model('User', userSchema);
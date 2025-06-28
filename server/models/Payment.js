import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    index: true
  },
  type: {
    type: String,
    enum: ['question', 'subscription'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  mpesa: {
    phoneNumber: String,
    transactionId: String,
    checkoutRequestId: String,
    merchantRequestId: String,
    resultCode: String,
    resultDesc: String,
    callbackData: mongoose.Schema.Types.Mixed
  },
  subscription: {
    planId: String,
    planName: String,
    duration: String,
    startDate: Date,
    endDate: Date
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    retryCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'mpesa.transactionId': 1 });
paymentSchema.index({ 'mpesa.checkoutRequestId': 1 });
paymentSchema.index({ type: 1 });

// Methods
paymentSchema.methods.markCompleted = function(mpesaData) {
  this.status = 'completed';
  this.mpesa.transactionId = mpesaData.transactionId;
  this.mpesa.resultCode = mpesaData.resultCode;
  this.mpesa.resultDesc = mpesaData.resultDesc;
  this.mpesa.callbackData = mpesaData;
  return this.save();
};

paymentSchema.methods.markFailed = function(errorData) {
  this.status = 'failed';
  this.mpesa.resultCode = errorData.resultCode;
  this.mpesa.resultDesc = errorData.resultDesc;
  this.metadata.retryCount += 1;
  return this.save();
};

paymentSchema.methods.canRetry = function() {
  return this.metadata.retryCount < 3 && this.status === 'failed';
};

// Static methods
paymentSchema.statics.findByUserId = function(userId, limit = 50) {
  return this.find({ userId })
    .populate('questionId', 'questionText createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);
};

paymentSchema.statics.findByTransactionId = function(transactionId) {
  return this.findOne({ 'mpesa.transactionId': transactionId });
};

paymentSchema.statics.findByCheckoutRequestId = function(checkoutRequestId) {
  return this.findOne({ 'mpesa.checkoutRequestId': checkoutRequestId });
};

paymentSchema.statics.getTotalRevenue = function() {
  return this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        avgTransactionAmount: { $avg: '$amount' }
      }
    }
  ]);
};

paymentSchema.statics.getRevenueByPeriod = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        dailyRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

export default mongoose.model('Payment', paymentSchema);
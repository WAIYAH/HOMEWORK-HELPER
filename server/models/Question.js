import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  questionText: {
    type: String,
    required: true
  },
  submissionType: {
    type: String,
    enum: ['text', 'image'],
    required: true
  },
  imageUrl: String,
  gradeLevel: {
    type: String,
    required: true
  },
  subject: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'answered', 'failed'],
    default: 'pending'
  },
  answer: {
    explanation: String,
    steps: [String],
    additionalNotes: String,
    generatedAt: Date
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    amount: Number,
    mpesaTransactionId: String,
    paidAt: Date
  },
  processing: {
    ocrText: String,
    aiPrompt: String,
    processingTime: Number,
    errorMessage: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
questionSchema.index({ userId: 1, createdAt: -1 });
questionSchema.index({ status: 1 });
questionSchema.index({ 'payment.status': 1 });
questionSchema.index({ gradeLevel: 1 });

// Methods
questionSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

questionSchema.methods.setAnswer = function(answerData) {
  this.answer = {
    ...answerData,
    generatedAt: new Date()
  };
  this.status = 'answered';
  return this.save();
};

questionSchema.methods.markPaymentCompleted = function(transactionData) {
  this.payment.status = 'completed';
  this.payment.mpesaTransactionId = transactionData.transactionId;
  this.payment.paidAt = new Date();
  return this.save();
};

questionSchema.methods.setProcessingError = function(errorMessage) {
  this.status = 'failed';
  this.processing.errorMessage = errorMessage;
  return this.save();
};

// Static methods
questionSchema.statics.findByUserId = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

questionSchema.statics.findPendingQuestions = function() {
  return this.find({ 
    status: 'pending',
    'payment.status': 'completed'
  }).sort({ createdAt: 1 });
};

questionSchema.statics.getStatsByUser = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        answeredQuestions: {
          $sum: { $cond: [{ $eq: ['$status', 'answered'] }, 1, 0] }
        },
        totalSpent: { $sum: '$payment.amount' },
        avgProcessingTime: { $avg: '$processing.processingTime' }
      }
    }
  ]);
};

export default mongoose.model('Question', questionSchema);
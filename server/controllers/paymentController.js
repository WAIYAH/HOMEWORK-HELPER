import Payment from '../models/Payment.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { initiateMpesaPayment, queryMpesaTransaction } from '../utils/mpesa.js';

export const initiatePayment = async (req, res) => {
  try {
    const { questionId, phoneNumber, amount } = req.body;
    const userId = req.user.clerkId;

    // Verify question belongs to user
    const question = await Question.findOne({ _id: questionId, userId });
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if already paid
    if (question.payment.status === 'completed') {
      return res.status(400).json({ message: 'Question already paid for' });
    }

    // Create payment record
    const payment = new Payment({
      userId,
      questionId,
      type: 'question',
      amount,
      mpesa: {
        phoneNumber
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
      amount,
      accountReference: questionId,
      transactionDesc: `Payment for homework question ${questionId.slice(-6)}`
    });

    if (mpesaResponse.success) {
      // Update payment with M-Pesa details
      payment.mpesa.checkoutRequestId = mpesaResponse.data.CheckoutRequestID;
      payment.mpesa.merchantRequestId = mpesaResponse.data.MerchantRequestID;
      await payment.save();

      // Update question payment info
      question.payment.amount = amount;
      await question.save();

      res.json({
        message: 'Payment initiated successfully',
        data: {
          paymentId: payment._id,
          checkoutRequestId: mpesaResponse.data.CheckoutRequestID,
          status: 'pending'
        }
      });
    } else {
      payment.status = 'failed';
      payment.mpesa.resultDesc = mpesaResponse.message;
      await payment.save();

      res.status(400).json({
        message: 'Failed to initiate payment',
        error: mpesaResponse.message
      });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      message: 'Failed to initiate payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const verifyPayment = async (req, res) =>  {
  try {
    const { transactionId } = req.params;
    const userId = req.user.clerkId;

    const payment = await Payment.findOne({
      userId,
      'mpesa.transactionId': transactionId
    }).populate('questionId');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // If payment is still pending, query M-Pesa for status
    if (payment.status === 'pending') {
      const mpesaStatus = await queryMpesaTransaction(payment.mpesa.checkoutRequestId);
      
      if (mpesaStatus.success && mpesaStatus.data.ResultCode === '0') {
        // Payment successful
        await payment.markCompleted(mpesaStatus.data);
        
        // Update question payment status
        const question = await Question.findById(payment.questionId);
        if (question) {
          await question.markPaymentCompleted({
            transactionId: mpesaStatus.data.MpesaReceiptNumber
          });
        }
      }
    }

    res.json({
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.mpesa.transactionId,
        paidAt: payment.updatedAt
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      message: 'Failed to verify payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ userId })
      .populate('questionId', 'questionText createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-mpesa.callbackData -metadata');

    const total = await Payment.countDocuments({ userId });

    res.json({
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      message: 'Failed to fetch payment history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const handleMpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2));

    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData.Body.stkCallback;

    // Find payment by checkout request ID
    const payment = await Payment.findByCheckoutRequestId(CheckoutRequestID);
    
    if (!payment) {
      console.error('Payment not found for CheckoutRequestID:', CheckoutRequestID);
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (ResultCode === '0') {
      // Payment successful
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;
      const transactionId = callbackMetadata.Item.find(
        item => item.Name === 'MpesaReceiptNumber'
      )?.Value;

      await payment.markCompleted({
        transactionId,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        ...callbackData.Body.stkCallback
      });

      // Update question payment status
      if (payment.questionId) {
        const question = await Question.findById(payment.questionId);
        if (question) {
          await question.markPaymentCompleted({ transactionId });
          
          // Start AI processing
          processQuestionWithAI(question);
        }
      }

      // Update user stats
      await User.findOneAndUpdate(
        { clerkId: payment.userId },
        { $inc: { 'stats.totalSpent': payment.amount } }
      );

    } else {
      // Payment failed
      await payment.markFailed({
        resultCode: ResultCode,
        resultDesc: ResultDesc
      });
    }

    res.json({ message: 'Callback processed successfully' });

  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.status(500).json({ message: 'Callback processing failed' });
  }
};

// Helper function to process question with AI
async function processQuestionWithAI(question) {
  try {
    await question.markAsProcessing();
    
    const aiResponse = await generateAIAnswer(
      question.questionText,
      question.gradeLevel
    );

    await question.setAnswer({
      explanation: aiResponse.explanation,
      steps: aiResponse.steps,
      additionalNotes: aiResponse.additionalNotes
    });

    // Emit socket event for real-time notification
    // Note: You'll need to access the io instance here
    // This could be done by storing it globally or passing it through context

  } catch (error) {
    console.error('AI processing error:', error);
    await question.setProcessingError(error.message);
  }
}
import Question from '../models/Question.js';
import User from '../models/User.js';
import { processImageWithOCR } from '../utils/ocr.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { generateAIAnswer } from '../utils/ai.js';

export const submitQuestion = async (req, res) => {
  try {
    const { questionText, gradeLevel, submissionType, subject } = req.body;
    const userId = req.user.clerkId;

    let processedQuestionText = questionText;
    let imageUrl = null;

    // Handle image submission
    if (submissionType === 'image' && req.files?.image) {
      const imageFile = req.files.image;
      
      // Upload image to Cloudinary
      const uploadResult = await uploadToCloudinary(imageFile);
      imageUrl = uploadResult.secure_url;

      // Extract text using OCR
      const ocrResult = await processImageWithOCR(imageFile);
      processedQuestionText = ocrResult.text || questionText;
    }

    // Create question document
    const question = new Question({
      userId,
      questionText: processedQuestionText,
      submissionType,
      imageUrl,
      gradeLevel,
      subject: subject || 'other',
      processing: {
        ocrText: submissionType === 'image' ? processedQuestionText : null
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        deviceType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
      }
    });

    await question.save();

    // Update user stats
    await User.findOneAndUpdate(
      { clerkId: userId },
      { 
        $inc: { 'stats.totalQuestions': 1 },
        $set: { 'stats.lastActiveDate': new Date() }
      }
    );

    // Emit socket event for real-time updates
    req.io.to(userId).emit('question-submitted', {
      questionId: question._id,
      status: question.status
    });

    res.status(201).json({
      message: 'Question submitted successfully',
      data: {
        questionId: question._id,
        status: question.status,
        estimatedCost: calculateQuestionCost(processedQuestionText, gradeLevel)
      }
    });

  } catch (error) {
    console.error('Question submission error:', error);
    res.status(500).json({
      message: 'Failed to submit question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getQuestions = async (req, res) => {
  try {
    const userId = req.user.clerkId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const questions = await Question.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-processing.aiPrompt -metadata');

    const total = await Question.countDocuments({ userId });

    res.json({
      data: questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      message: 'Failed to fetch questions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.clerkId;

    const question = await Question.findOne({ _id: id, userId });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ data: question });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      message: 'Failed to fetch question',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getQuestionStats = async (req, res) => {
  try {
    const userId = req.user.clerkId;

    const stats = await Question.getStatsByUser(userId);
    const recentQuestions = await Question.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('questionText status createdAt payment.amount');

    res.json({
      data: {
        stats: stats[0] || {
          totalQuestions: 0,
          answeredQuestions: 0,
          totalSpent: 0,
          avgProcessingTime: 0
        },
        recentQuestions
      }
    });

  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch question statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Helper function to calculate question cost
function calculateQuestionCost(questionText, gradeLevel) {
  const basePrice = 5;
  const complexityMultiplier = questionText.length > 100 ? 1.5 : 1;
  const gradeMultiplier = gradeLevel.includes('form') ? 1.5 : 1;
  
  return Math.min(Math.ceil(basePrice * complexityMultiplier * gradeMultiplier), 10);
}
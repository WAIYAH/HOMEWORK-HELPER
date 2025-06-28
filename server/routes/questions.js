import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateQuestionSubmission, validateQuestionId } from '../middleware/validation.js';
import {
  submitQuestion,
  getQuestions,
  getQuestion,
  getQuestionStats
} from '../controllers/questionController.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Submit a new question
router.post('/submit', validateQuestionSubmission, submitQuestion);

// Get user's questions
router.get('/', getQuestions);

// Get specific question
router.get('/:id', validateQuestionId, getQuestion);

// Get question statistics
router.get('/stats/summary', getQuestionStats);

export default router;
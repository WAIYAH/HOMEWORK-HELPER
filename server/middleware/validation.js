import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateQuestionSubmission = [
  body('gradeLevel')
    .notEmpty()
    .withMessage('Grade level is required')
    .isIn([
      'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6',
      'grade-7', 'grade-8', 'form-1', 'form-2', 'form-3', 'form-4'
    ])
    .withMessage('Invalid grade level'),
  
  body('submissionType')
    .isIn(['text', 'image'])
    .withMessage('Submission type must be either text or image'),
  
  body('questionText')
    .if(body('submissionType').equals('text'))
    .notEmpty()
    .withMessage('Question text is required for text submissions')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question text must be between 5 and 1000 characters'),
  
  body('subject')
    .optional()
    .isIn(['math', 'science', 'english', 'social-studies', 'other'])
    .withMessage('Invalid subject'),
  
  handleValidationErrors
];

export const validatePaymentInitiation = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isMongoId()
    .withMessage('Invalid question ID'),
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^254[0-9]{9}$/)
    .withMessage('Phone number must be in format 254XXXXXXXXX'),
  
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      if (value < 5 || value > 1000) {
        throw new Error('Amount must be between 5 and 1000 KES');
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateSubscription = [
  body('planId')
    .notEmpty()
    .withMessage('Plan ID is required')
    .isIn(['monthly', 'yearly'])
    .withMessage('Invalid plan ID'),
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^254[0-9]{9}$/)
    .withMessage('Phone number must be in format 254XXXXXXXXX'),
  
  handleValidationErrors
];

export const validateQuestionId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid question ID'),
  
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];
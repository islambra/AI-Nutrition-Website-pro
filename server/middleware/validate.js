import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg);
    return res.status(400).json({ success: false, message: messages.join('. ') });
  }
  next();
};

export const validateRegister = [
  body('fullName').trim().notEmpty().withMessage('Full name is required')
    .isLength({ max: 100 }).withMessage('Full name too long'),
  body('email').trim().isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['client', 'student']).withMessage('Role must be client or student'),
  handleValidationErrors
];

export const validateLogin = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateDieteticienRegister = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('age').isInt({ min: 18, max: 120 }).withMessage('Age must be between 18 and 120'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('specialty').trim().notEmpty().withMessage('Specialty is required'),
  handleValidationErrors
];

export const validateStaffCreate = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['admin', 'dieteticien']).withMessage('Role must be admin or dieteticien'),
  handleValidationErrors
];

export const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  handleValidationErrors
];

export const validateBlog = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ max: 50000 }),
  body('type').isIn(['Recipe', 'Article', 'Community']).withMessage('Invalid blog type'),
  handleValidationErrors
];

export const validateComment = [
  body('content').trim().notEmpty().withMessage('Comment is required').isLength({ max: 2000 }),
  handleValidationErrors
];

export const validatePlan = [
  body('planName').trim().notEmpty().withMessage('Plan name is required'),
  body('planCategory').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1'),
  handleValidationErrors
];

export const validateConsultation = [
  body('userPlanId').isMongoId().withMessage('Invalid plan ID'),
  body('requestedDateTime').isISO8601().withMessage('Valid date is required'),
  handleValidationErrors
];

export const validateCourse = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('level').isIn([1, 2, 3]).withMessage('Level must be 1, 2, or 3'),
  body('semester').isIn([1, 2]).withMessage('Semester must be 1 or 2'),
  handleValidationErrors
];

export const validateFormation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('durationWeeks').isInt({ min: 1 }).withMessage('Duration must be at least 1 week'),
  handleValidationErrors
];

export const validatePayment = [
  body('paymentMethod').isIn(['ccp', 'baridimob']).withMessage('Invalid payment method'),
  handleValidationErrors
];

export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors
];

export const validatePasswordReset = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors
];

export const validateNewPassword = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  handleValidationErrors
];

export const validateQueryParams = [
  query('category').optional().trim().escape(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minDuration').optional().isInt({ min: 0 }),
  query('maxDuration').optional().isInt({ min: 0 }),
  handleValidationErrors
];

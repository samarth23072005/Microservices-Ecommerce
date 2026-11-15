
const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return formatted error response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters long'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate
];

/**
 * Validation rules for profile update
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters long'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must not exceed 20 characters'),

  body('address')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),

  body('address.street')
    .optional()
    .isString()
    .withMessage('Street must be a string'),

  body('address.city')
    .optional()
    .isString()
    .withMessage('City must be a string'),

  body('address.state')
    .optional()
    .isString()
    .withMessage('State must be a string'),

  body('address.zipCode')
    .optional()
    .isString()
    .withMessage('Zip code must be a string'),

  body('address.country')
    .optional()
    .isString()
    .withMessage('Country must be a string'),

  body('role')
    .not()
    .exists()
    .withMessage('Updating user role is not permitted through this endpoint'),

  body('password')
    .not()
    .exists()
    .withMessage('Password updates must be performed via dedicated password endpoints'),

  validate
];


module.exports = {
  validate,
  registerValidation,
  loginValidation,
  updateProfileValidation
};

const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User registration validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email too long'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .escape(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Menu item validation
const validateMenuItem = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  body('price')
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Price must be a positive number'),
  
  body('category')
    .isIn(['appetizers', 'breakfast', 'lunch', 'dinner', 'desserts', 'snacks', 'drinks'])
    .withMessage('Invalid category'),
  
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Image must be a valid URL'),
  
  body('deliverable')
    .optional()
    .isBoolean()
    .withMessage('Deliverable must be a boolean'),
  
  handleValidationErrors
];

// Order validation
const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  
  body('items.*.id')
    .trim()
    .notEmpty()
    .withMessage('Item ID is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('deliveryType')
    .isIn(['pickup', 'delivery'])
    .withMessage('Invalid delivery type'),
  
  body('paymentMethod')
    .isIn(['paypal', 'mpesa'])
    .withMessage('Invalid payment method'),
  
  body('deliveryAddress')
    .if(body('deliveryType').equals('delivery'))
    .notEmpty()
    .withMessage('Delivery address is required for delivery orders'),
  
  body('deliveryAddress.street')
    .if(body('deliveryType').equals('delivery'))
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters')
    .escape(),
  
  body('deliveryAddress.city')
    .if(body('deliveryType').equals('delivery'))
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .escape(),
  
  body('deliveryAddress.phone')
    .if(body('deliveryType').equals('delivery'))
    .trim()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Order ID validation
const validateOrderId = [
  param('orderId')
    .trim()
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Invalid order ID format'),
  
  handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (fieldName = 'id') => [
  param(fieldName)
    .trim()
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

// Status update validation
const validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters')
    .escape(),
  
  handleValidationErrors
];

// GPS location validation
const validateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Accuracy must be a positive number'),
  
  handleValidationErrors
];

// User creation (admin) validation
const validateCreateUser = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
    .escape(),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be at least 6 characters'),
  
  body('roles')
    .isArray({ min: 1 })
    .withMessage('At least one role is required'),
  
  body('roles.*')
    .isIn(['customer', 'admin', 'ordermanager', 'delivery'])
    .withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  handleValidationErrors
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Passwords do not match'),
  
  handleValidationErrors
];

// Query parameter sanitization
const sanitizeQuery = [
  query('*')
    .trim()
    .escape(),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateMenuItem,
  validateOrder,
  validateOrderId,
  validateObjectId,
  validateStatusUpdate,
  validateLocation,
  validateCreateUser,
  validatePasswordChange,
  sanitizeQuery,
  handleValidationErrors
};

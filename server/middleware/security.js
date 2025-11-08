const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

// Security Headers using Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://accounts.google.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "https://www.paypal.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://www.paypal.com", "https://www.sandbox.paypal.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      process.env.FRONTEND_URL,
      process.env.PRODUCTION_URL
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per IP for sensitive operations
  message: 'Too many requests for this operation, please try again later.'
});

// Sanitization Middlewares
const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[SECURITY] NoSQL injection attempt detected: ${key}`);
  }
});

// Prevent HTTP Parameter Pollution
const preventParameterPollution = hpp({
  whitelist: ['price', 'quantity', 'status', 'deliveryType', 'category']
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    };
    
    if (req.user) {
      logData.userId = req.user.id;
      logData.username = req.user.username;
    }
    
    // Log errors with more detail
    if (res.statusCode >= 400) {
      console.warn('[REQUEST ERROR]', logData);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[REQUEST]', logData);
    }
  });
  
  next();
};

// Security event logger
const securityLogger = (eventType, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ...details
  };
  
  console.warn('[SECURITY EVENT]', JSON.stringify(logEntry));
  
  // In production, send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Winston, Sentry, LogDNA)
  }
};

module.exports = {
  securityHeaders,
  corsOptions,
  generalLimiter,
  authLimiter,
  strictLimiter,
  sanitizeData,
  preventParameterPollution,
  requestLogger,
  securityLogger
};

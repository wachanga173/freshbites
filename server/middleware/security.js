const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const hpp = require('hpp')

// Security Headers using Helmet
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://maps.googleapis.com', 'https://accounts.google.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://maps.googleapis.com', 'https://www.paypal.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", 'https://www.paypal.com', 'https://www.sandbox.paypal.com']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
})

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ]
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP
  message: 'Too many authentication attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per IP for sensitive operations
  message: 'Too many requests for this operation, please try again later.'
})

// GPS/Location tracking rate limiter
const locationUpdateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 location updates per minute
  message: 'Too many location updates. Please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false
})

// Location tracking view limiter (for customers checking delivery)
const trackingViewLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 tracking views per minute
  message: 'Too many tracking requests. Please try again shortly.',
  standardHeaders: true,
  legacyHeaders: false
})

// Location validation and security
const validateLocation = (req, res, next) => {
  const { latitude, longitude, accuracy } = req.body

  // Validate latitude
  if (latitude !== undefined) {
    const lat = parseFloat(latitude)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        error: 'Invalid latitude. Must be between -90 and 90',
        securityNote: 'Location data validation failed'
      })
    }
  }

  // Validate longitude
  if (longitude !== undefined) {
    const lng = parseFloat(longitude)
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid longitude. Must be between -180 and 180',
        securityNote: 'Location data validation failed'
      })
    }
  }

  // Validate accuracy (if provided)
  if (accuracy !== undefined) {
    const acc = parseFloat(accuracy)
    if (isNaN(acc) || acc < 0 || acc > 10000) {
      return res.status(400).json({
        error: 'Invalid accuracy value',
        securityNote: 'Accuracy must be between 0 and 10000 meters'
      })
    }
  }

  // Check for suspicious patterns (e.g., exact 0,0 coordinates)
  if (latitude === 0 && longitude === 0) {
    console.warn('[SECURITY] Suspicious location: 0,0 coordinates from user', req.user?.id)
    return res.status(400).json({
      error: 'Invalid location coordinates',
      securityNote: 'Location appears to be spoofed or invalid'
    })
  }

  next()
}

// Detect rapid location changes (potential spoofing)
const detectLocationSpoofing = async (req, res, next) => {
  const { latitude, longitude } = req.body
  const userId = req.user.id

  // Store last known locations in memory (you could use Redis for production)
  if (!global.lastLocations) {
    global.lastLocations = new Map()
  }

  const lastLocation = global.lastLocations.get(userId)

  if (lastLocation) {
    const timeDiff = Date.now() - lastLocation.timestamp

    // Calculate distance (Haversine formula)
    const R = 6371e3 // Earth radius in meters
    const φ1 = lastLocation.latitude * Math.PI / 180
    const φ2 = latitude * Math.PI / 180
    const Δφ = (latitude - lastLocation.latitude) * Math.PI / 180
    const Δλ = (longitude - lastLocation.longitude) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in meters

    // Check for impossible speed (e.g., > 200 km/h)
    const speed = (distance / timeDiff) * 3600 // km/h

    if (speed > 200 && timeDiff < 60000) { // Less than 1 minute
      console.warn(`[SECURITY] Potential location spoofing detected for user ${userId}:`, {
        distance: `${distance.toFixed(0)}m`,
        time: `${timeDiff}ms`,
        speed: `${speed.toFixed(0)} km/h`
      })

      // Log but don't block (could be legitimate in some cases)
      req.suspiciousLocation = true
    }
  }

  // Update last location
  global.lastLocations.set(userId, {
    latitude,
    longitude,
    timestamp: Date.now()
  })

  next()
}

// Sanitization Middlewares
const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req: _req, key }) => {
    console.warn(`[SECURITY] NoSQL injection attempt detected: ${key}`)
  }
})

// Prevent HTTP Parameter Pollution
const preventParameterPollution = hpp({
  whitelist: ['price', 'quantity', 'status', 'deliveryType', 'category']
})

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    }

    if (req.user) {
      logData.userId = req.user.id
      logData.username = req.user.username
    }

    // Log errors with more detail
    if (res.statusCode >= 400) {
      console.warn('[REQUEST ERROR]', logData)
    } else if (process.env.NODE_ENV === 'development') {
      console.log('[REQUEST]', logData)
    }
  })

  next()
}

// Security event logger
const securityLogger = (eventType, details) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ...details
  }

  console.warn('[SECURITY EVENT]', JSON.stringify(logEntry))

  // In production, send to external logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Winston, Sentry, LogDNA)
  }
}

module.exports = {
  securityHeaders,
  corsOptions,
  generalLimiter,
  authLimiter,
  strictLimiter,
  locationUpdateLimiter,
  trackingViewLimiter,
  sanitizeData,
  preventParameterPollution,
  requestLogger,
  securityLogger,
  validateLocation,
  detectLocationSpoofing
}

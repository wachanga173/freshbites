require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const paypal = require('paypal-rest-sdk');
const axios = require('axios');
const compression = require('compression');
const morgan = require('morgan');

// Database and Models
const connectDB = require('./config/database');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');
const DeliveryTracking = require('./models/DeliveryTracking');
const Feedback = require('./models/Feedback');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware
const { authenticateToken, requireRole } = require('./auth');
const {
  securityHeaders,
  corsOptions,
  generalLimiter,
  authLimiter,
  strictLimiter,
  sanitizeData,
  preventParameterPollution,
  requestLogger,
  securityLogger
} = require('./middleware/security');
const {
  errorHandler,
  notFoundHandler,
  catchAsync,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdown,
  logger,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError
} = require('./middleware/errorHandler');
const {
  validateRegister,
  validateLogin,
  validateMenuItem,
  validateOrder,
  validateOrderId,
  validateObjectId,
  validateStatusUpdate,
  validateLocation,
  validateCreateUser,
  validatePasswordChange
} = require('./middleware/validation');

const app = express();
// Trust first proxy (required for correct IP detection on Render)
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Handle uncaught exceptions early
uncaughtExceptionHandler();

// Connect to MongoDB
connectDB();

// Configure PayPal SDK
paypal.configure({
  'mode': process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  'client_id': process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
  'client_secret': process.env.PAYPAL_CLIENT_SECRET || 'YOUR_PAYPAL_CLIENT_SECRET'
});

// M-Pesa Configuration (Daraja API)
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'YOUR_MPESA_CONSUMER_KEY',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'YOUR_MPESA_CONSUMER_SECRET',
  shortCode: process.env.MPESA_SHORTCODE || '174379',
  passkey: process.env.MPESA_PASSKEY || 'YOUR_MPESA_PASSKEY',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payment/mpesa/callback'
};

// ===== SECURITY MIDDLEWARE (Applied in specific order) =====

// 1. Security Headers (helmet)
app.use(securityHeaders);

// 2. CORS Configuration
app.use(cors(corsOptions));

// 3. HTTP Request Logging (Morgan + Winston)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// 4. Response Compression
app.use(compression());

// 5. Body Parsers (before rate limiting to allow proper request counting)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Rate Limiting (General - applies to all routes)
app.use('/api/', generalLimiter);

// 7. Data Sanitization against NoSQL Injection
app.use(sanitizeData);

// 8. Prevent Parameter Pollution
app.use(preventParameterPollution);

// 9. Custom Request Logger
app.use(requestLogger);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to organize menu by category
async function getMenuByCategory() {
  try {
    const items = await MenuItem.find({ available: true });
    const menu = {
      appetizers: [],
      breakfast: [],
      lunch: [],
      dinner: [],
      desserts: [],
      snacks: [],
      drinks: []
    };
    items.forEach(item => {
      if (menu[item.category]) {
        menu[item.category].push({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          deliverable: item.deliverable || false,
          orderCategory: item.orderCategory || ['dine-in'],
          shippingFee: item.shippingFee || 0
        });
      }
    });
    return menu;
  } catch (err) {
    console.error('getMenuByCategory error:', err);
    throw err;
  }
}

// M-Pesa: Get access token
async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64');
  try {
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('M-Pesa token error:', error.response?.data || error.message);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// ========== AUTH ROUTES ==========

// Register new user
app.post('/api/auth/register', authLimiter, validateRegister, catchAsync(async (req, res) => {
  const { username, email, password, phone } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    securityLogger('registration_attempt', {
      username,
      email,
      reason: 'duplicate',
      ip: req.ip
    });
    throw new ValidationError(
      existingUser.username === username ? 'Username already exists' : 'Email already exists'
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
  username,
  email,
  password: hashedPassword,
  phone,
  roles: ['customer'],
  role: 'customer'
  });

  const token = jwt.sign(
  { id: user._id, username: user.username, roles: user.roles, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  securityLogger('user_registered', {
    userId: user._id,
    username: user.username,
    ip: req.ip
  });

  logger.info(`New user registered: ${user.username} (${user._id})`);

  res.status(201).json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      roles: user.roles
    }
  });
}));

// Login
app.post('/api/auth/login', authLimiter, validateLogin, catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    securityLogger('login_failed', {
      username,
      reason: 'user_not_found',
      ip: req.ip
    });
    throw new AuthenticationError('Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    securityLogger('login_failed', {
      username,
      userId: user._id,
      reason: 'invalid_password',
      ip: req.ip
    });
    throw new AuthenticationError('Invalid credentials');
  }

  const token = jwt.sign(
  { id: user._id, username: user.username, roles: user.roles, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  securityLogger('login_success', {
    userId: user._id,
    username: user.username,
    ip: req.ip
  });

  logger.info(`User logged in: ${user.username} (${user._id})`);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      phone: user.phone
    }
  });
}));

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Change password
app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Find user in MongoDB
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ========== MENU ROUTES ==========

// API: get menu (public)
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await getMenuByCategory();
    res.json(menu);
  } catch (err) {
    console.error('Menu fetch error:', err);
    res.status(500).json({ error: 'Failed to load menu', details: err.message || err });
  }
});

// API: submit order (authenticated)
app.post('/api/order', authenticateToken, async (req, res) => {
  try {
    const { items, name, note } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must include at least one item' });
    }

    // Calculate total
    let total = 0;
    const allItems = await MenuItem.find({ id: { $in: items } });
    
    const orderItems = items.map(id => {
      const found = allItems.find(i => i.id === id);
      if (!found) return null;
      total += found.price;
      return {
        id: found.id,
        name: found.name,
        price: found.price,
        image: found.image
      };
    }).filter(Boolean);

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items in order' });
    }

    const confirmation = {
      id: `ord_${Date.now()}`,
      items: orderItems,
      userId: req.user.id,
      name: name || req.user.username,
      note: note || '',
      total: Number(total.toFixed(2)),
      receivedAt: new Date().toISOString()
    };

    res.json({ success: true, confirmation });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// ========== PAYMENT ROUTES ==========

// PayPal: Create payment
app.post('/api/payment/paypal/create', authenticateToken, (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'No items in cart' });
  }

  // Convert KSH to USD (approximate rate: 1 USD = 130 KSH)
  const totalUSD = (total / 130).toFixed(2);

  const create_payment_json = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal'
    },
    redirect_urls: {
      return_url: `http://localhost:5174/payment/success`,
      cancel_url: `http://localhost:5174/payment/cancel`
    },
    transactions: [{
      item_list: {
        items: items.map(item => ({
          name: item.name,
          sku: item.id,
          price: ((item.price / 130).toFixed(2)),
          currency: 'USD',
          quantity: item.quantity
        }))
      },
      amount: {
        currency: 'USD',
        total: totalUSD
      },
      description: 'Fresh Bites Café Order'
    }]
  };

  paypal.payment.create(create_payment_json, (error, payment) => {
    if (error) {
      console.error('PayPal error:', error);
      return res.status(500).json({ error: 'Failed to create PayPal payment' });
    } else {
      // Store order temporarily with payment ID
      const order = {
        id: `ord_${Date.now()}`,
        userId: req.user.id,
        username: req.user.username,
        items: items,
        total: total,
        paymentMethod: 'paypal',
        paymentId: payment.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Find approval URL
      const approvalUrl = payment.links.find(link => link.rel === 'approval_url');
      
      res.json({
        success: true,
        paymentId: payment.id,
        approvalUrl: approvalUrl ? approvalUrl.href : null,
        order: order
      });
    }
  });
});

// PayPal: Execute payment (callback after user approves)
app.post('/api/payment/paypal/execute', authenticateToken, async (req, res) => {
  const { paymentId, PayerID, items, total, shippingFee, deliveryType, deliveryAddress, orderType } = req.body;

  if (!paymentId || !PayerID) {
    return res.status(400).json({ error: 'Payment ID and Payer ID are required' });
  }

  const execute_payment_json = {
    payer_id: PayerID
  };

  paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
    if (error) {
      console.error('PayPal execution error:', error);
      return res.status(500).json({ error: 'Payment execution failed' });
    } else {
      try {
        // Determine actual order type (backward compatibility)
        const actualOrderType = orderType || (deliveryType === 'delivery' ? 'delivery' : deliveryType === 'pickup' ? 'pickup' : 'dine-in');
        
        // Determine initial status based on order type
        let initialStatus = 'confirmed';
        if (actualOrderType === 'pickup') {
          initialStatus = 'ready';
        } else if (actualOrderType === 'dine-in') {
          initialStatus = 'ready';
        } else if (actualOrderType === 'delivery') {
          initialStatus = 'confirmed';
        }
        
        // Save completed order
        const newOrder = await Order.create({
          orderId: `ord_${Date.now()}`,
          userId: req.user.id,
          username: req.user.username || req.user.email,
          items: items || [],
          total: total || 0,
          shippingFee: shippingFee || 0,
          grandTotal: (total || 0) + (shippingFee || 0),
          paymentMethod: 'paypal',
          paymentId: payment.id,
          orderType: actualOrderType,
          deliveryType: deliveryType || 'pickup',
          deliveryAddress: deliveryAddress || null,
          status: initialStatus,
          statusHistory: [{
            status: initialStatus,
            timestamp: new Date(),
            note: `Payment completed via PayPal - ${actualOrderType} order`
          }],
          completedAt: null
        });

        res.json({
          success: true,
          order: {
            id: newOrder.orderId,
            userId: newOrder.userId,
            username: newOrder.username,
            paymentMethod: newOrder.paymentMethod,
            paymentId: newOrder.paymentId,
            status: newOrder.status,
            completedAt: newOrder.completedAt
          },
          payment: payment
        });
      } catch (err) {
        console.error('Order save error:', err);
        res.status(500).json({ error: 'Failed to save order' });
      }
    }
  });
});

// M-Pesa: Initiate STK Push
app.post('/api/payment/mpesa/stkpush', authenticateToken, async (req, res) => {
  const { phoneNumber, amount, items, shippingFee, deliveryType, deliveryAddress, orderType } = req.body;

  if (!phoneNumber || !amount) {
    return res.status(400).json({ error: 'Phone number and amount are required' });
  }

  try {
    // Format phone number - accept both 254XXXXXXXXX and 07XXXXXXXX formats
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (formattedPhone.startsWith('07')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (formattedPhone.startsWith('01')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('254')) {
      return res.status(400).json({ error: 'Invalid phone number format. Use 07XXXXXXXX or 254XXXXXXXXX' });
    }

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_CONFIG.shortCode}${MPESA_CONFIG.passkey}${timestamp}`).toString('base64');

    // Calculate total amount including shipping fee for delivery orders
    const totalAmount = Math.round(amount + (shippingFee || 0));

    const stkPushData = {
      BusinessShortCode: MPESA_CONFIG.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: totalAmount,
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: `FreshBites${Date.now()}`,
      TransactionDesc: 'Fresh Bites Café Order'
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      // Create pending order in database
      const orderId = `ord_${Date.now()}`;
      const newOrder = await Order.create({
        orderId: orderId,
        userId: req.user.id,
        username: req.user.username,
        items: items || [],
        total: amount,
        shippingFee: shippingFee || 0,
        grandTotal: amount + (shippingFee || 0),
        paymentMethod: 'mpesa',
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        orderType: orderType || 'dine-in',
        deliveryType: deliveryType || 'pickup',
        deliveryAddress: deliveryAddress || null,
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          note: 'Awaiting M-Pesa payment confirmation'
        }]
      });

      res.json({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestID: response.data.CheckoutRequestID,
        orderId: newOrder.orderId
      });
    } else {
      res.status(400).json({ error: 'Failed to initiate M-Pesa payment' });
    }
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.response?.data || error.message);
    res.status(500).json({ error: 'M-Pesa payment initialization failed' });
  }
});

// M-Pesa: Callback endpoint
app.post('/api/payment/mpesa/callback', async (req, res) => {
  console.log('M-Pesa Callback received:', JSON.stringify(req.body, null, 2));
  
  try {
    const { Body } = req.body;
    const { stkCallback } = Body;

    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      
      // Get the order to check delivery type
      const order = await Order.findOne({ checkoutRequestID: checkoutRequestID });
      
      if (order) {
        // Determine status based on orderType (with fallback to deliveryType)
        const orderTypeValue = order.orderType || order.deliveryType || 'dine-in';
        
        // Set appropriate status based on order type
        let newStatus = 'confirmed';
        if (orderTypeValue === 'pickup' || orderTypeValue === 'dine-in') {
          newStatus = 'ready';
        } else if (orderTypeValue === 'delivery') {
          newStatus = 'confirmed';
        }
        
        order.status = newStatus;
        
        // Ensure statusHistory exists
        if (!Array.isArray(order.statusHistory)) {
          order.statusHistory = [];
        }
        
        order.statusHistory.push({
          status: newStatus,
          timestamp: new Date(),
          note: `Payment confirmed via M-Pesa - ${orderTypeValue} order`
        });
        
        await order.save();
        console.log(`Order ${order.orderId} status updated to ${newStatus}`);
      } else {
        console.error(`Order not found for checkoutRequestID: ${checkoutRequestID}`);
      }
    } else {
      // Payment failed
      const checkoutRequestID = stkCallback.CheckoutRequestID;
      await Order.findOneAndUpdate(
        { checkoutRequestID: checkoutRequestID },
        { 
          status: 'failed',
          $push: {
            statusHistory: {
              status: 'failed',
              timestamp: new Date(),
              note: `M-Pesa payment failed: ${stkCallback.ResultDesc || 'Unknown error'}`
            }
          }
        }
      );
      console.log(`Order payment failed for checkoutRequestID: ${checkoutRequestID}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// M-Pesa: Check payment status
app.get('/api/payment/mpesa/status/:checkoutRequestID', authenticateToken, async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;
    const order = await Order.findOne({ checkoutRequestID: checkoutRequestID });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      status: order.status,
      order: {
        id: order.orderId,
        userId: order.userId,
        username: order.username,
        items: order.items,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }
    });
  } catch (err) {
    console.error('Status check error:', err);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Get user orders
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Manual payment confirmation (for when M-Pesa callback fails)
app.post('/api/orders/:orderId/confirm-payment', authenticateToken, requireRole('admin', 'superadmin', 'ordermanager'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order is not pending payment' });
    }

    // Determine status based on orderType
    const orderTypeValue = order.orderType || order.deliveryType || 'dine-in';
    const newStatus = orderTypeValue === 'pickup' ? 'ready' : 'confirmed';

    order.status = newStatus;
    
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `Payment manually confirmed by ${req.user.username || req.user.email || 'Manager'}`
    });

    if (orderTypeValue === 'pickup') {
      order.completedAt = new Date();
    }

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// ========== ADMIN MENU MANAGEMENT ==========

// Upload image endpoint
app.post('/api/admin/upload', authenticateToken, requireRole('admin', 'superadmin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// Add menu item (admin/superadmin only)
app.post('/api/admin/menu/:category', authenticateToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { category } = req.params;
    const item = req.body;

    if (!['appetizers', 'breakfast', 'lunch', 'dinner', 'desserts', 'snacks', 'drinks'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const newItem = await MenuItem.create({
      id: `${category[0]}${Date.now()}`,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: category,
      deliverable: item.deliverable || false,
      orderCategory: item.orderCategory || ['dine-in'],
      shippingFee: item.shippingFee || 0
    });

    res.json({ 
      success: true, 
      item: {
        id: newItem.id,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        image: newItem.image
      }
    });
  } catch (err) {
    console.error('Add item error:', err);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update menu item (admin/superadmin only)
app.put('/api/admin/menu/:category/:id', authenticateToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { category, id } = req.params;
    const updates = req.body;

    if (!['appetizers', 'breakfast', 'lunch', 'dinner', 'desserts', 'snacks', 'drinks'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const item = await MenuItem.findOneAndUpdate(
      { id: id, category: category },
      {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        image: updates.image,
        available: updates.available,
        deliverable: updates.deliverable,
        orderCategory: updates.orderCategory || ['dine-in'],
        shippingFee: updates.shippingFee || 0
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ 
      success: true, 
      item: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image
      }
    });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete menu item (admin/superadmin only)
app.delete('/api/admin/menu/:category/:id', authenticateToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { category, id } = req.params;

    if (!['appetizers', 'breakfast', 'lunch', 'dinner', 'desserts', 'snacks', 'drinks'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await MenuItem.findOneAndDelete({ id: id, category: category });
    
    if (!result) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ========== SUPER ADMIN USER MANAGEMENT ==========

// Get all users (superadmin only)
app.get('/api/superadmin/users', authenticateToken, requireRole('superadmin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // Transform _id to id for frontend compatibility
    const usersWithId = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      createdAt: user.createdAt
    }));
    res.json(usersWithId);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user with roles (superadmin only)
app.post('/api/superadmin/create-admin', authenticateToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { username, email, password, roles, phone } = req.body;

    if (!username || !email || !password || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'All fields are required. Roles must be an array.' });
    }

    // Validate roles
    const validRoles = ['admin', 'ordermanager', 'delivery', 'customer'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      roles: roles,
      role: Array.isArray(roles) && roles.length > 0 ? roles[0] : '',
      phone: phone || ''
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        phone: user.phone
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (superadmin only)
app.delete('/api/superadmin/users/:id', authenticateToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Find the user to check their roles
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting superadmin accounts
    if (userToDelete.roles && userToDelete.roles.includes('superadmin')) {
      return res.status(403).json({ error: 'Cannot delete superadmin accounts' });
    }

    await User.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ========== DELIVERY PERSONNEL ROUTE ==========

// Get delivery personnel (for order managers and admins)
app.get('/api/delivery-personnel', authenticateToken, requireRole('admin', 'superadmin', 'ordermanager'), async (req, res) => {
  try {
    const deliveryUsers = await User.find({ roles: 'delivery' }).select('-password');
    const usersWithId = deliveryUsers.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      createdAt: user.createdAt
    }));
    res.json(usersWithId);
  } catch (err) {
    console.error('Get delivery personnel error:', err);
    res.status(500).json({ error: 'Failed to fetch delivery personnel' });
  }
});

// ========== ORDER MANAGEMENT ROUTES (for ordermanager role) ==========

// Get all orders (for order managers and admins)
app.get('/api/orders/manage', authenticateToken, requireRole('admin', 'superadmin', 'ordermanager'), async (req, res) => {
  try {
    const { status, deliveryType } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (deliveryType) filter.deliveryType = deliveryType;
    
    const orders = await Order.find(filter)
      .populate('userId', 'username email phone')
      .populate('assignedTo', 'username phone')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (for order managers and admins)
app.patch('/api/orders/:orderId/status', authenticateToken, requireRole('admin', 'superadmin', 'ordermanager'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: note || ''
    });
    
    order.status = status;
    
    if (status === 'completed' || status === 'delivered') {
      order.completedAt = new Date();
    }
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Assign order to delivery person
app.patch('/api/orders/:orderId/assign', authenticateToken, requireRole('admin', 'superadmin', 'ordermanager'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonId } = req.body;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const deliveryPerson = await User.findById(deliveryPersonId);
    if (!deliveryPerson || !deliveryPerson.roles.includes('delivery')) {
      return res.status(400).json({ error: 'Invalid delivery person' });
    }
    
    order.assignedTo = deliveryPersonId;
    order.status = 'out_for_delivery';
    order.statusHistory.push({
      status: 'out_for_delivery',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `Assigned to ${deliveryPerson.username}`
    });
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (err) {
    console.error('Assign order error:', err);
    res.status(500).json({ error: 'Failed to assign order' });
  }
});

// Get customer's orders
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('assignedTo', 'username phone')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order details with full tracking info
app.get('/api/orders/:orderId/details', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
      .populate('userId', 'username email phone')
      .populate('assignedTo', 'username phone')
      .populate({
        path: 'statusHistory.updatedBy',
        select: 'username'
      });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check authorization
    if (req.user.role === 'customer' && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// ========== DELIVERY TRACKING ROUTES ==========

// Update delivery person location (for delivery personnel)
app.post('/api/delivery/update-location', authenticateToken, requireRole('delivery'), async (req, res) => {
  try {
    const { orderId, latitude, longitude, accuracy } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location coordinates required' });
    }
    
    let tracking = await DeliveryTracking.findOne({ orderId, isActive: true });
    
    if (!tracking) {
      // Create new tracking
      tracking = await DeliveryTracking.create({
        orderId,
        deliveryPersonId: req.user.id,
        currentLocation: {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        },
        locationHistory: [{
          latitude,
          longitude,
          timestamp: new Date()
        }]
      });
    } else {
      // Update existing tracking
      tracking.currentLocation = {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date()
      };
      
      tracking.locationHistory.push({
        latitude,
        longitude,
        timestamp: new Date()
      });
      
      await tracking.save();
    }
    
    // Update order location as well
    await Order.findByIdAndUpdate(orderId, {
      'deliveryPersonLocation.latitude': latitude,
      'deliveryPersonLocation.longitude': longitude,
      'deliveryPersonLocation.lastUpdated': new Date()
    });
    
    res.json({ success: true, tracking });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get real-time delivery tracking (for customers and managers)
app.get('/api/delivery/track/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
      .populate('assignedTo', 'username phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check authorization
    if (req.user.role === 'customer' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const tracking = await DeliveryTracking.findOne({ orderId: order._id, isActive: true })
      .populate('deliveryPersonId', 'username phone');
    
    res.json({
      order: {
        orderId: order.orderId,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        assignedTo: order.assignedTo
      },
      tracking: tracking || null
    });
  } catch (err) {
    console.error('Get tracking error:', err);
    res.status(500).json({ error: 'Failed to fetch tracking info' });
  }
});

// Get delivery person's active deliveries
app.get('/api/delivery/my-deliveries', authenticateToken, requireRole('delivery'), async (req, res) => {
  try {
    const orders = await Order.find({
      assignedTo: req.user.id,
      status: { $in: ['out_for_delivery', 'ready'] }
    }).populate('userId', 'username phone');
    
    res.json(orders);
  } catch (err) {
    console.error('Get my deliveries error:', err);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// Mark delivery as completed (delivery person arrives)
app.post('/api/delivery/:orderId/arrive', authenticateToken, requireRole('delivery'), async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }
    
    // Deactivate tracking
    await DeliveryTracking.findOneAndUpdate(
      { orderId: order._id, isActive: true },
      { 
        isActive: false,
        actualArrival: new Date()
      }
    );
    
    res.json({ success: true, message: 'Arrived at destination' });
  } catch (err) {
    console.error('Mark arrival error:', err);
    res.status(500).json({ error: 'Failed to mark arrival' });
  }
});

// Customer confirms order completion
// Delivery person marks delivery as DONE (for delivery orders)
app.post('/api/delivery/:orderId/mark-done', authenticateToken, requireRole('delivery'), async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId }).populate('assignedTo');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify this delivery is assigned to the current user
    if (!order.assignedTo || order.assignedTo._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'This delivery is not assigned to you' });
    }

    // Must be a delivery order
    if (order.deliveryType !== 'delivery') {
      return res.status(400).json({ error: 'This is not a delivery order. Use pickup confirmation instead.' });
    }

    // Check if already completed
    if (order.status === 'completed' && !order.canReuse) {
      return res.status(400).json({ error: 'This order is already completed and cannot be reused' });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    order.completedBy = req.user.id;
    order.completedByRole = 'delivery';
    order.canReuse = false; // Prevent reuse
    order.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: '✅ Delivery completed by delivery person'
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Delivery marked as done. Order cannot be reused.',
      order 
    });
  } catch (err) {
    console.error('Mark delivery done error:', err);
    res.status(500).json({ error: 'Failed to mark delivery as done' });
  }
});

// Order manager marks pickup as DONE (for pickup orders - customer collected physically)
app.post('/api/orders/:orderId/mark-pickup-done', authenticateToken, requireRole('ordermanager', 'admin', 'superadmin'), async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Must be a pickup order
    if (order.deliveryType !== 'pickup') {
      return res.status(400).json({ error: 'This is a delivery order. Use delivery completion instead.' });
    }

    // Check if already completed
    if (order.status === 'completed' && !order.canReuse) {
      return res.status(400).json({ error: 'This order is already completed and cannot be reused' });
    }

    // Order should be ready for pickup
    if (order.status !== 'ready' && order.status !== 'delivered') {
      return res.status(400).json({ error: 'Order must be in "ready" status before marking as picked up' });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    order.completedBy = req.user.id;
    order.completedByRole = 'ordermanager';
    order.canReuse = false; // Prevent reuse
    order.pickupConfirmedAt = new Date();
    order.pickupConfirmedBy = req.user.id;
    order.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: '✅ Customer collected order physically (confirmed by order manager)'
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Pickup confirmed. Customer has collected the order. Order cannot be reused.',
      order 
    });
  } catch (err) {
    console.error('Mark pickup done error:', err);
    res.status(500).json({ error: 'Failed to mark pickup as done' });
  }
});

// Customer confirms completion (deprecated - kept for backward compatibility)
app.post('/api/orders/:orderId/confirm-completion', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if already completed and locked
    if (order.status === 'completed' && !order.canReuse) {
      return res.status(400).json({ 
        error: 'This order has already been completed and locked.',
        message: order.deliveryType === 'delivery' 
          ? 'Order was completed by delivery person'
          : 'Order was completed by order manager'
      });
    }
    
    order.status = 'completed';
    order.completedAt = new Date();
    order.completedBy = req.user.id;
    order.completedByRole = 'customer';
    order.statusHistory.push({
      status: 'completed',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: 'Customer confirmed completion'
    });
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (err) {
    console.error('Confirm completion error:', err);
    res.status(500).json({ error: 'Failed to confirm completion' });
  }
});

// ========== DELIVERY CONFIRMATION WITH LOCATION VERIFICATION ==========

// Confirm delivery with location verification (for delivery personnel)
app.post('/api/delivery/confirm-delivery', authenticateToken, requireRole('delivery'), async (req, res) => {
  try {
    const { orderId, latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location coordinates required for delivery confirmation' });
    }
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this order' });
    }
    
    // Calculate distance between delivery location and customer location using Haversine formula
    let locationMatch = false;
    let distance = null;
    
    if (order.deliveryAddress && order.deliveryAddress.latitude && order.deliveryAddress.longitude) {
      const R = 6371; // Earth's radius in km
      const dLat = (order.deliveryAddress.latitude - latitude) * Math.PI / 180;
      const dLon = (order.deliveryAddress.longitude - longitude) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(order.deliveryAddress.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance = R * c * 1000; // Distance in meters
      
      // Consider match if within 100 meters
      locationMatch = distance <= 100;
    }
    
    order.status = 'delivered';
    order.completedAt = new Date();
    order.completedBy = req.user.id;
    order.completedByRole = 'delivery';
    order.deliveryConfirmation = {
      confirmedAt: new Date(),
      confirmedLocation: {
        latitude,
        longitude
      },
      locationMatch,
      distanceFromCustomer: distance
    };
    
    order.statusHistory.push({
      status: 'delivered',
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `Delivered by ${req.user.username}${locationMatch ? ' (location verified)' : distance ? ` (${Math.round(distance)}m from customer)` : ''}`
    });
    
    await order.save();
    
    res.json({ 
      success: true, 
      order,
      locationVerified: locationMatch,
      distance: distance ? Math.round(distance) : null
    });
  } catch (err) {
    console.error('Confirm delivery error:', err);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
});

// Order manager confirms pickup or dine-in
app.post('/api/orders/:orderId/complete', authenticateToken, requireRole('ordermanager', 'superadmin'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { completionType } = req.body; // 'pickup' or 'dine-in'
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Handle legacy orders without orderType (backward compatibility)
    // Prioritize completionType from request, then order fields, then default
    const orderTypeValue = completionType || order.orderType || order.deliveryType || 'dine-in';
    
    if (orderTypeValue === 'delivery') {
      return res.status(400).json({ error: 'Delivery orders must be confirmed by delivery personnel' });
    }
    
    const statusMap = {
      'pickup': 'picked_up',
      'dine-in': 'dined',
      'delivery': 'delivered'
    };
    
    order.status = statusMap[orderTypeValue] || 'completed';
    order.completedAt = new Date();
    order.completedBy = req.user.id;
    order.completedByRole = Array.isArray(req.user.roles) && req.user.roles.includes('superadmin') ? 'superadmin' : 'ordermanager';
    
    // Ensure statusHistory array exists
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }
    
    const username = req.user.username || req.user.email || 'Manager';
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      updatedBy: req.user.id,
      note: `${orderTypeValue} confirmed by ${username}`
    });
    
    await order.save();
    
    res.json({ success: true, order });
  } catch (err) {
    console.error('Complete order error:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ error: 'Failed to complete order', details: err.message });
  }
});

// ========== FEEDBACK ROUTES ==========

// Submit feedback (chatbot)
app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { subject, message, category, rating, orderId } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    
    const feedbackId = `fb_${Date.now()}`;
    const feedback = await Feedback.create({
      feedbackId,
      userId: req.user.id,
      username: req.user.username,
      orderId: orderId || null,
      subject,
      message,
      category: category || 'general',
      rating: rating || null,
      chatHistory: [{
        sender: 'customer',
        message,
        timestamp: new Date()
      }]
    });
    
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Get all feedback (for feedback manager)
app.get('/api/feedback/all', authenticateToken, requireRole('feedback_manager', 'superadmin'), async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const feedbacks = await Feedback.find(filter)
      .populate('userId', 'username email phone')
      .populate('response.respondedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get customer's own feedback
app.get('/api/feedback/my-feedback', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .populate('response.respondedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    console.error('Get my feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Get single feedback details
app.get('/api/feedback/:feedbackId', authenticateToken, async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    const feedback = await Feedback.findOne({ feedbackId })
      .populate('userId', 'username email phone')
      .populate('response.respondedBy', 'username');
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Check authorization
    const isFeedbackManager = req.user.roles.includes('feedback_manager') || req.user.roles.includes('superadmin');
    if (!isFeedbackManager && feedback.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(feedback);
  } catch (err) {
    console.error('Get feedback details error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback details' });
  }
});

// Respond to feedback (for feedback manager)
app.post('/api/feedback/:feedbackId/respond', authenticateToken, requireRole('feedback_manager', 'superadmin'), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { message, status } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Response message is required' });
    }
    
    const feedback = await Feedback.findOne({ feedbackId });
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    feedback.response = {
      message,
      respondedBy: req.user.id,
      respondedAt: new Date()
    };
    
    feedback.chatHistory.push({
      sender: 'feedback_manager',
      message,
      timestamp: new Date()
    });
    
    if (status) {
      feedback.status = status;
    } else if (feedback.status === 'pending') {
      feedback.status = 'in_progress';
    }
    
    await feedback.save();
    
    res.json({ success: true, feedback });
  } catch (err) {
    console.error('Respond to feedback error:', err);
    res.status(500).json({ error: 'Failed to respond to feedback' });
  }
});

// Update feedback status
app.patch('/api/feedback/:feedbackId/status', authenticateToken, requireRole('feedback_manager', 'superadmin'), async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const feedback = await Feedback.findOneAndUpdate(
      { feedbackId },
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ success: true, feedback });
  } catch (err) {
    console.error('Update feedback status error:', err);
    res.status(500).json({ error: 'Failed to update feedback status' });
  }
});

// ========== AI DIET ASSISTANT ==========

// AI-powered diet assistant endpoint
app.post('/api/ai/diet-assistant', authenticateToken, async (req, res) => {
  try {
    const { question, userPreferences } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // This is a placeholder for AI integration
    // You would integrate with OpenAI, Anthropic, or another AI service here
    // For now, return a structured response based on simple keyword matching
    
    const lowerQuestion = question.toLowerCase();
    let response = '';
    
    if (lowerQuestion.includes('calorie') || lowerQuestion.includes('nutrition')) {
      response = 'Our menu items include detailed nutritional information. For specific calorie counts, please check the menu details or ask about a particular item. Generally, our salads and grilled items are lower in calories, while our desserts and fried items are more indulgent.';
    } else if (lowerQuestion.includes('allerg') || lowerQuestion.includes('gluten') || lowerQuestion.includes('dairy')) {
      response = 'We take allergies seriously. Please inform our staff about any dietary restrictions. Many of our items can be modified to accommodate gluten-free, dairy-free, and other dietary needs. Our staff can provide detailed allergen information for each menu item.';
    } else if (lowerQuestion.includes('vegan') || lowerQuestion.includes('vegetarian')) {
      response = 'We offer several vegetarian and vegan options! Look for items marked as "Vegetarian" or "Vegan" on our menu. Our chefs can also modify many dishes to suit plant-based diets.';
    } else if (lowerQuestion.includes('protein') || lowerQuestion.includes('workout') || lowerQuestion.includes('fitness')) {
      response = 'For high-protein options, consider our grilled chicken dishes, fish entrees, or legume-based meals. These are excellent for post-workout nutrition and muscle recovery.';
    } else if (lowerQuestion.includes('weight loss') || lowerQuestion.includes('diet')) {
      response = 'For weight management, focus on our lighter options like salads, grilled proteins, and vegetable-based dishes. Portion control and balanced nutrition are key. Consider our smaller portions or sharing larger entrees.';
    } else {
      response = 'Thank you for your question! Our AI diet assistant can help with nutrition advice, dietary restrictions, allergies, calorie information, and meal recommendations. Please feel free to ask specific questions about our menu items or dietary concerns.';
    }
    
    // Log the interaction for improvement
    console.log('Diet AI Query:', { userId: req.user.id, question, timestamp: new Date() });
    
    res.json({
      success: true,
      question,
      response,
      timestamp: new Date().toISOString(),
      disclaimer: 'This advice is general in nature. For specific dietary needs, please consult with a healthcare professional or registered dietitian.'
    });
  } catch (err) {
    console.error('Diet assistant error:', err);
    res.status(500).json({ error: 'Failed to process diet query' });
  }
});

// Serve client static files if present (optional)
const clientPath = path.join(__dirname, '..', 'client');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  // fallback to index.html for SPA
  app.get('*', (req, res, next) => {
    const accept = req.headers.accept || '';
    if (accept.includes('text/html')) {
      res.sendFile(path.join(clientPath, 'index.html'));
    } else next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle 404 - Keep this AFTER all other routes
app.use(notFoundHandler);

// Global error handler - MUST be last
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Security: Helmet, CORS, Rate Limiting, Sanitization enabled`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
unhandledRejectionHandler(server);

// Handle graceful shutdown
gracefulShutdown(server);

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    deliverable: Boolean
  }],
  total: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'mpesa'],
    required: true
  },
  paymentId: String,
  checkoutRequestID: String,
  merchantRequestID: String,
  orderType: {
    type: String,
    enum: ['dine-in', 'pickup', 'delivery'],
    default: 'dine-in'
  },
  deliveryType: {
    type: String,
    enum: ['pickup', 'delivery'],
    default: 'pickup'
  },
  deliveryAddress: {
    street: String,
    city: String,
    phone: String,
    instructions: String,
    latitude: Number,
    longitude: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'picked_up', 'dined', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deliveryPersonLocation: {
    latitude: Number,
    longitude: Number,
    lastUpdated: Date
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedByRole: {
    type: String,
    enum: ['delivery', 'ordermanager', 'superadmin', 'customer']
  },
  deliveryConfirmation: {
    confirmedAt: Date,
    confirmedLocation: {
      latitude: Number,
      longitude: Number
    },
    locationMatch: Boolean,
    distanceFromCustomer: Number
  },
  canReuse: {
    type: Boolean,
    default: true
  },
  pickupConfirmedAt: Date,
  pickupConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// Indexes for performance optimization (orderId already has unique index)
orderSchema.index({ userId: 1, createdAt: -1 }) // User's orders sorted by date
orderSchema.index({ status: 1, createdAt: -1 }) // Filter by status and sort
orderSchema.index({ assignedTo: 1, status: 1 }) // Delivery person's active orders
orderSchema.index({ deliveryType: 1, status: 1 }) // Filter delivery vs pickup
orderSchema.index({ createdAt: -1 }) // Recent orders
orderSchema.index({ 'paymentDetails.status': 1 }) // Payment status queries

module.exports = mongoose.model('Order', orderSchema)

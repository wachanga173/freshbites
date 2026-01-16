const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema({
  feedbackId: {
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
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food_quality', 'service', 'delivery', 'general', 'complaint', 'suggestion'],
    default: 'general'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  chatHistory: [{
    sender: {
      type: String,
      enum: ['customer', 'feedback_manager', 'bot'],
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Indexes for performance optimization
feedbackSchema.index({ userId: 1, createdAt: -1 }) // User's feedback
feedbackSchema.index({ status: 1, createdAt: -1 }) // Filter by status
feedbackSchema.index({ category: 1, status: 1 }) // Category filtering
feedbackSchema.index({ rating: 1 }) // Rating queries
feedbackSchema.index({ createdAt: -1 }) // Recent feedback

module.exports = mongoose.model('Feedback', feedbackSchema)

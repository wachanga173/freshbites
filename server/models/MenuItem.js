const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['appetizers', 'breakfast', 'lunch', 'dinner', 'desserts', 'snacks', 'drinks'],
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  deliverable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance optimization (id already has unique index)
menuItemSchema.index({ category: 1, available: 1 }); // Most common query pattern
menuItemSchema.index({ available: 1, deliverable: 1 }); // Filter available deliverable items
menuItemSchema.index({ name: 'text', description: 'text' }); // Text search support
menuItemSchema.index({ price: 1 }); // Price-based sorting/filtering

module.exports = mongoose.model('MenuItem', menuItemSchema);

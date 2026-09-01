const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    type: [String],
    enum: ['customer', 'admin', 'superadmin', 'ordermanager', 'delivery', 'feedback_manager'],
    default: ['customer']
  },
  phone: {
    type: String,
    trim: true
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorMethod: {
    type: String,
    enum: ['authenticator', 'email', null],
    default: null
  },
  twoFactorSecret: {
    type: String,
    default: null
  },
  twoFactorTempSecret: {
    type: String,
    default: null
  },
  twoFactorOTP: {
    type: String
  },
  twoFactorExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
})

// Indexes for performance optimization (username and email already have unique indexes)
userSchema.index({ roles: 1 }) // For role-based queries
userSchema.index({ createdAt: -1 }) // For sorting by registration date

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

module.exports = mongoose.model('User', userSchema)

// update-ordermanager-roles.js
// Run this script with: node update-ordermanager-roles.js

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')

async function updateOrderManagerRoles() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI not set in environment.')
    process.exit(1)
  }
  await mongoose.connect(uri)
  try {
    const user = await User.findOne({ username: 'ordermanager' })
    if (!user) {
      console.error('No user found with username "ordermanager"')
      process.exit(1)
    }
    if (!Array.isArray(user.roles)) {
      user.roles = []
    }
    if (!user.roles.includes('ordermanager')) {
      user.roles.push('ordermanager')
    }
    user.role = 'ordermanager' // ensure legacy field is set
    await user.save()
    console.log('User updated:', user)
  } catch (err) {
    console.error('Error updating user:', err)
  } finally {
    await mongoose.disconnect()
  }
}

updateOrderManagerRoles()

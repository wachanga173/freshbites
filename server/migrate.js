/**
 * Migration script to move data from JSON files to MongoDB Atlas
 * Run this once after setting up MongoDB connection
 */

require('dotenv').config()
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const User = require('./models/User')
const MenuItem = require('./models/MenuItem')
const Order = require('./models/Order')

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('Connected to MongoDB Atlas')

    // Clear existing data (optional - remove if you want to keep existing data)
    await User.deleteMany({})
    await MenuItem.deleteMany({})
    await Order.deleteMany({})
    console.log('Cleared existing data')

    // Migrate Users
    const usersPath = path.join(__dirname, 'users.json')
    if (fs.existsSync(usersPath)) {
      const usersFile = JSON.parse(fs.readFileSync(usersPath, 'utf8'))
      const usersData = usersFile.users || usersFile // Handle both {users: []} and [] formats

      for (const user of usersData) {
        await User.create({
          username: user.username,
          email: user.email,
          password: user.password, // Already hashed
          role: user.role,
          roles: user.roles || (user.role ? [user.role] : ['customer'])
        })
      }
      console.log(`Migrated ${usersData.length} users`)
    }

    // Migrate Menu Items
    const menuPath = path.join(__dirname, 'menu.json')
    if (fs.existsSync(menuPath)) {
      const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'))

      const allItems = []
      for (const [category, items] of Object.entries(menuData)) {
        for (const item of items) {
          allItems.push({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            category: category
          })
        }
      }

      await MenuItem.insertMany(allItems)
      console.log(`Migrated ${allItems.length} menu items`)
    }

    // Migrate Orders
    const ordersPath = path.join(__dirname, 'orders.json')
    if (fs.existsSync(ordersPath)) {
      const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'))

      for (const order of ordersData) {
        // Find user by username to get ObjectId
        const user = await User.findOne({ username: order.username })

        if (user) {
          await Order.create({
            orderId: order.id,
            userId: user._id,
            username: order.username,
            items: order.items || [],
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentId: order.paymentId,
            checkoutRequestID: order.checkoutRequestID,
            merchantRequestID: order.merchantRequestID,
            status: order.status,
            createdAt: order.createdAt,
            completedAt: order.completedAt
          })
        }
      }
      console.log(`Migrated ${ordersData.length} orders`)
    }

    console.log('✅ Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
migrateData()

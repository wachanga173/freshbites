require('dotenv').config()
const mongoose = require('mongoose')

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB\n')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    const allUsers = await usersCollection.find({}).toArray()
    
    console.log(`Total users: ${allUsers.length}\n`)
    
    allUsers.forEach(user => {
      console.log('---')
      console.log(`Username: ${user.username}`)
      console.log(`Email: ${user.email}`)
      console.log(`Phone: ${user.phone || 'N/A'}`)
      console.log(`Roles: ${JSON.stringify(user.roles)}`)
      console.log(`Old role field: ${user.role || 'N/A'}`)
    })

    await mongoose.connection.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

checkUsers()

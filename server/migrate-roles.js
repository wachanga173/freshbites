require('dotenv').config()
const mongoose = require('mongoose')

async function migrateRoles() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected successfully!')

    const db = mongoose.connection.db
    const usersCollection = db.collection('users')

    // Find all users that have a 'role' field (not 'roles' array)
    const usersWithOldSchema = await usersCollection.find({ 
      role: { $exists: true },
      roles: { $exists: false }
    }).toArray()

    console.log(`Found ${usersWithOldSchema.length} users with old schema`)

    if (usersWithOldSchema.length === 0) {
      console.log('No users to migrate. All users already have roles array.')
      await mongoose.connection.close()
      return
    }

    // Migrate each user
    for (const user of usersWithOldSchema) {
      const oldRole = user.role
      const newRoles = [oldRole] // Convert single role to array

      console.log(`Migrating user "${user.username}" from role "${oldRole}" to roles ["${oldRole}"]`)

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: { roles: newRoles },
          $unset: { role: '' }
        }
      )
    }

    console.log(`✅ Successfully migrated ${usersWithOldSchema.length} users!`)

    // Verify migration
    const verifyUsers = await usersCollection.find({}).toArray()
    console.log('\nVerification:')
    verifyUsers.forEach(u => {
      console.log(`  - ${u.username}: roles = [${u.roles.join(', ')}]`)
    })

    await mongoose.connection.close()
    console.log('\nMigration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrateRoles()

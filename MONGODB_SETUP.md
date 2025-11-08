# MongoDB Atlas Setup Guide

## 🎯 What Changed

Your Fresh Bites Café now uses **MongoDB Atlas** (cloud database) instead of JSON files for data storage. This provides:

✅ **Better Performance** - Faster queries and scalability  
✅ **Data Integrity** - ACID transactions and validation  
✅ **Cloud Backup** - Automatic backups and disaster recovery  
✅ **Real Database** - Production-ready infrastructure  
✅ **Better Security** - Encryption and access controls  

---

## 📦 New Dependencies Installed

```bash
✓ mongoose@latest - MongoDB ODM for Node.js
✓ dotenv@latest - Environment variable management
```

---

## 🗄️ Database Models Created

### **1. User Model** (`models/User.js`)
- username (unique)
- email (unique)
- password (hashed)
- role (customer/admin/superadmin)
- createdAt

### **2. MenuItem Model** (`models/MenuItem.js`)
- id (custom ID like 'b1', 'l2')
- name
- description
- price
- image
- category (appetizers, breakfast, lunch, dinner, desserts, snacks, drinks)
- available (boolean)
- createdAt

### **3. Order Model** (`models/Order.js`)
- orderId (order_1234567890)
- userId (reference to User)
- username
- items (array of order items)
- total
- paymentMethod (paypal/mpesa)
- paymentId / checkoutRequestID
- status (pending/completed/failed/cancelled)
- createdAt / completedAt

---

## 🚀 Setup Instructions

### **Step 1: Create MongoDB Atlas Account**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a FREE account
3. Create a new cluster (choose FREE tier - M0)
4. Wait for cluster to be created (~5 minutes)

### **Step 2: Get Connection String**

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string
5. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### **Step 3: Configure Environment Variables**

1. Open `server/.env`
2. Update `MONGODB_URI` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/cafeteria?retryWrites=true&w=majority
   ```
   
3. Generate a JWT secret (random string):
   ```env
   JWT_SECRET=my_super_secret_jwt_key_12345_change_this
   ```

**Important**: Replace `<username>` and `<password>` in the connection string with your actual MongoDB credentials!

### **Step 4: Whitelist Your IP Address**

1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (for development)
4. Or add your specific IP address

### **Step 5: Create Database User**

1. Go to "Database Access" in Atlas
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `cafeteria_user` (or any name)
5. Password: Create a strong password
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### **Step 6: Migrate Existing Data**

Run the migration script to move your data from JSON files to MongoDB:

```bash
cd server
node migrate.js
```

This will:
- Connect to MongoDB Atlas
- Read data from `users.json`, `menu.json`, `orders.json`
- Insert all data into MongoDB
- Preserve all existing data

**Output:**
```
Connected to MongoDB Atlas
Cleared existing data
Migrated X users
Migrated X menu items
Migrated X orders
✅ Migration completed successfully!
```

### **Step 7: Start the Server**

```bash
npm run dev
```

**You should see:**
```
MongoDB Connected: cluster0-xxxxx.mongodb.net
Server listening on http://localhost:3000
```

---

## ✅ Verification

### **Test Database Connection:**

1. Open http://localhost:5174
2. Try to register a new user
3. Login with existing credentials
4. Browse the menu
5. Add items to cart
6. Complete a checkout

### **Check MongoDB Atlas:**

1. Go to your cluster in Atlas
2. Click "Browse Collections"
3. You should see:
   - `users` collection
   - `menuitems` collection
   - `orders` collection

---

## 🔄 What Changed in Code

### **server.js**
- ✅ Added MongoDB connection with `connectDB()`
- ✅ Replaced all JSON file operations with Mongoose queries
- ✅ Updated auth routes to use User model
- ✅ Updated menu routes to use MenuItem model
- ✅ Updated order routes to use Order model
- ✅ Updated admin routes to use database

### **No Changes Needed:**
- ❌ Frontend code (client/)
- ❌ API endpoints (same URLs)
- ❌ User experience
- ❌ Authentication flow
- ❌ Payment integration

---

## 📊 Data Migration Status

Your existing data will be migrated:

| Data Type | Source | Destination | Status |
|-----------|--------|-------------|--------|
| Users | users.json | MongoDB `users` | ✅ Ready to migrate |
| Menu Items | menu.json | MongoDB `menuitems` | ✅ Ready to migrate |
| Orders | orders.json | MongoDB `orders` | ✅ Ready to migrate |

---

## 🛡️ Security Improvements

1. **Environment Variables** - Sensitive data in `.env`
2. **Password Hashing** - bcrypt with salts
3. **JWT Tokens** - Secure session management
4. **MongoDB Encryption** - Data encrypted at rest
5. **Input Validation** - Mongoose schema validation

---

## 🔧 Troubleshooting

### **Error: "MongoServerError: bad auth"**
- ✅ Check username/password in connection string
- ✅ Ensure user has correct permissions in Atlas

### **Error: "connect ECONNREFUSED"**
- ✅ Check if IP address is whitelisted in Atlas
- ✅ Verify connection string is correct

### **Error: "Authentication failed"**
- ✅ Check JWT_SECRET is set in `.env`
- ✅ Clear browser localStorage and login again

### **Migration Issues:**
- ✅ Ensure JSON files exist before migrating
- ✅ Check MongoDB connection is working
- ✅ Run `node migrate.js` only once

---

## 📝 Environment Variables Checklist

```env
✅ PORT=3000
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=random_secret_key
✅ PAYPAL_CLIENT_ID=...
✅ PAYPAL_CLIENT_SECRET=...
✅ MPESA_CONSUMER_KEY=...
✅ MPESA_CONSUMER_SECRET=...
✅ MPESA_SHORTCODE=...
✅ MPESA_PASSKEY=...
✅ MPESA_CALLBACK_URL=...
```

---

## 🎉 Benefits of MongoDB Atlas

### **Free Tier Includes:**
- 512 MB storage
- Shared RAM
- Shared vCPU
- Perfect for development and small apps

### **Production Ready:**
- Auto-scaling
- Automated backups
- 99.995% uptime SLA
- Global clusters
- Real-time analytics

### **Developer Friendly:**
- Easy to use dashboard
- Monitoring and alerts
- Query profiler
- Data explorer

---

## 🚀 Next Steps

After successful migration:

1. **Test Everything:**
   - User registration/login
   - Menu browsing
   - Cart operations
   - Checkout flow
   - Admin panel
   - Order history

2. **Backup JSON Files:**
   ```bash
   mkdir backup
   cp server/*.json backup/
   ```

3. **Optional: Remove JSON Files**
   Once you're confident everything works, you can remove:
   - `server/users.json`
   - `server/menu.json`
   - `server/orders.json`
   - `server/userService.js` (no longer needed)

4. **Monitor Performance:**
   - Check MongoDB Atlas metrics
   - Monitor API response times
   - Watch for errors in logs

---

## 📞 Support Resources

- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Mongoose Docs**: https://mongoosejs.com/docs/
- **MongoDB University**: Free courses at https://university.mongodb.com/

---

**Your cafeteria is now running on a professional cloud database!** 🎉

Open http://localhost:5174 and test it out!

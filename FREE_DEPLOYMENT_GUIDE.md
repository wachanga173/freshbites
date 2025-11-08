# 🚀 Free Deployment Guide - Cafeteria Application

## 🎯 Best Free Deployment Options

Since your MongoDB is already on MongoDB Atlas (cloud), here are the **best FREE options** for deploying your frontend and backend:

---

## 🏆 **RECOMMENDED SETUP (100% FREE)**

### **Backend:** Render.com (Free Tier)
### **Frontend:** Vercel (Free Tier)
### **Database:** MongoDB Atlas (Already setup ✅)

**Why this combination?**
- ✅ 100% Free forever (with generous limits)
- ✅ Automatic HTTPS/SSL certificates
- ✅ Continuous deployment from GitHub
- ✅ Professional URLs
- ✅ Good performance
- ✅ No credit card required

---

## 📦 **1. BACKEND DEPLOYMENT (Render.com)**

### Why Render?
- ✅ FREE 750 hours/month (enough for 24/7 operation)
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Auto-deploy from GitHub
- ✅ Better than Heroku free tier (which no longer exists)

### Steps:

#### A. Prepare Your Backend for Deployment

1. **Create a `render.yaml` file in the root directory:**

```yaml
services:
  - type: web
    name: cafeteria-api
    env: node
    region: oregon
    plan: free
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

2. **Verify your `server/package.json` has correct scripts:**

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### B. Deploy to Render

1. **Sign up:** Go to [render.com](https://render.com) and sign up with GitHub
2. **Create New Web Service:** Click "New +" → "Web Service"
3. **Connect Repository:** Select your `cafeteria` repository
4. **Configure:**
   - **Name:** cafeteria-api
   - **Region:** Oregon (closest free region)
   - **Branch:** main
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. **Add Environment Variables:**
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=your_shortcode
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://cafeteria-api.onrender.com/api/payment/mpesa/callback
   SHIPPING_FEE=50
   FRONTEND_URL=https://cafeteria-app.vercel.app
   ```

6. **Deploy:** Click "Create Web Service"

Your backend will be available at: `https://cafeteria-api.onrender.com`

#### ⚠️ **Important Render Notes:**
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- To prevent sleep, use a service like [UptimeRobot](https://uptimerobot.com/) (free) to ping your API every 5 minutes

---

## 🌐 **2. FRONTEND DEPLOYMENT (Vercel)**

### Why Vercel?
- ✅ Unlimited bandwidth (FREE)
- ✅ Automatic HTTPS
- ✅ Global CDN for fast loading
- ✅ Perfect for React/Vite apps
- ✅ No sleep/inactivity issues
- ✅ Auto-deploy on Git push

### Steps:

#### A. Prepare Frontend for Deployment

1. **Update `client/vite.config.js` for production:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
})
```

2. **Update API calls in your frontend to use environment variable:**

In all your API calls, ensure you're using:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
fetch(`${API_URL}/api/...`)
```

3. **Create `vercel.json` in the root directory:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "client/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/client/dist/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
```

#### B. Deploy to Vercel

1. **Sign up:** Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. **Import Project:** Click "Add New..." → "Project"
3. **Import Git Repository:** Select your `cafeteria` repository
4. **Configure:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_API_URL=https://cafeteria-api.onrender.com
   ```

6. **Deploy:** Click "Deploy"

Your frontend will be available at: `https://cafeteria-app.vercel.app`

---

## 🔄 **Alternative Free Options**

### Option 2: Both on Render.com
**Backend + Frontend on Render**
- Backend as Web Service (same as above)
- Frontend as Static Site
- Pros: Everything in one place
- Cons: Frontend also sleeps on free tier

### Option 3: Railway.app
**Backend on Railway (500 hours/month free)**
- Similar to Render
- Better performance but limited hours
- Good alternative if Render doesn't work

### Option 4: Netlify (Frontend) + Render (Backend)
**Similar to Vercel + Render**
- Netlify is great for static sites
- Very similar features to Vercel

---

## 🔒 **3. SECURITY CHECKLIST BEFORE DEPLOYMENT**

### ✅ Pre-Deployment Security

1. **Verify .gitignore includes:**
   ```
   .env
   .env.local
   server/.env
   client/.env
   node_modules
   logs/
   server/uploads/
   ```

2. **Never commit:**
   - ❌ `.env` files
   - ❌ API keys
   - ❌ MongoDB connection strings
   - ❌ JWT secrets
   - ❌ PayPal/M-Pesa credentials

3. **Use environment variables for:**
   - ✅ All secrets
   - ✅ Database URLs
   - ✅ API keys
   - ✅ Service credentials

4. **Check committed files:**
   ```bash
   git log --all --full-history -- "*.env"
   ```
   If any `.env` files show up, they've been committed! See "Emergency: Leaked Secrets" section below.

### 🚨 **Emergency: If You've Committed Secrets**

If you accidentally committed secrets to GitHub:

1. **Immediately rotate ALL secrets:**
   - Generate new JWT_SECRET
   - Regenerate MongoDB password in Atlas
   - Regenerate PayPal API credentials
   - Regenerate M-Pesa credentials
   - Get new Google Maps API key

2. **Remove from Git history:**
   ```bash
   # WARNING: This rewrites history
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch server/.env" \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push (be careful!)
   git push origin --force --all
   ```

3. **Add to .gitignore immediately:**
   ```bash
   echo ".env" >> .gitignore
   git add .gitignore
   git commit -m "Add .env to gitignore"
   git push
   ```

---

## 🔧 **4. UPDATE CORS FOR PRODUCTION**

Update `server/middleware/security.js`:

```javascript
const whitelist = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://cafeteria-api.onrender.com', // Your backend URL
  'https://cafeteria-app.vercel.app',   // Your frontend URL
  process.env.FRONTEND_URL
].filter(Boolean);
```

---

## 📊 **5. MONGODB ATLAS CONFIGURATION**

### Whitelist Render and Vercel IPs:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ This is safe because you have authentication
   - Render/Vercel use dynamic IPs, so specific IPs won't work

4. **Verify Connection String includes:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/cafeteria?retryWrites=true&w=majority
   ```

---

## 🧪 **6. TESTING YOUR DEPLOYMENT**

### Backend Health Check:
```bash
curl https://cafeteria-api.onrender.com/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

### Frontend Check:
1. Visit `https://cafeteria-app.vercel.app`
2. Open DevTools → Network tab
3. Check API calls go to your Render backend
4. Test authentication, orders, delivery tracking

---

## 💰 **Cost Comparison (All FREE)**

| Service | Free Tier Limits | Cost After |
|---------|-----------------|------------|
| **Render** | 750 hrs/month, 100GB bandwidth | $7/month for always-on |
| **Vercel** | Unlimited bandwidth, 100GB/month | $20/month for pro features |
| **MongoDB Atlas** | 512MB storage, shared cluster | $9/month for 2GB |
| **UptimeRobot** | 50 monitors, 5-min intervals | $7/month for more |

**Total Free Limits:**
- ✅ Enough for 1000+ daily active users
- ✅ 100GB bandwidth = ~1M API calls/month
- ✅ Perfect for portfolio, small business, MVP

---

## 🚀 **7. DEPLOYMENT COMMANDS**

### One-Time Setup:
```bash
# 1. Commit latest changes
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Render will auto-deploy backend
# 3. Vercel will auto-deploy frontend
```

### Continuous Deployment:
Every time you push to `main` branch:
- Render rebuilds backend automatically
- Vercel rebuilds frontend automatically

---

## 📈 **8. KEEP YOUR APP ALIVE (FREE)**

### UptimeRobot Setup (Prevent Render Sleep):

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Add New Monitor:
   - **Type:** HTTP(s)
   - **URL:** `https://cafeteria-api.onrender.com/health`
   - **Interval:** 5 minutes
   - **Monitor Type:** Keyword
   - **Keyword:** "ok"

This pings your backend every 5 minutes, keeping it awake!

---

## 🎉 **9. FINAL CHECKLIST**

Before going live:

- [ ] `.env` files NOT in Git
- [ ] Secrets in Render environment variables
- [ ] Frontend uses VITE_API_URL environment variable
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- [ ] CORS whitelist includes production URLs
- [ ] Google Maps API key has proper restrictions
- [ ] PayPal in sandbox or production mode (set in .env)
- [ ] M-Pesa callback URL points to production backend
- [ ] UptimeRobot monitoring enabled
- [ ] Test all features in production
- [ ] Custom domain configured (optional)

---

## 🔗 **10. CUSTOM DOMAIN (Optional but Recommended)**

### For Vercel (Frontend):
1. Buy domain from Namecheap/Google Domains (~$10/year)
2. In Vercel Dashboard → Settings → Domains
3. Add your domain (e.g., `cafeteria.com`)
4. Update DNS records as shown

### For Render (Backend):
1. In Render Dashboard → Settings → Custom Domain
2. Add subdomain (e.g., `api.cafeteria.com`)
3. Update DNS records

**Final URLs:**
- Frontend: `https://cafeteria.com`
- Backend: `https://api.cafeteria.com`

---

## 📞 **SUPPORT & RESOURCES**

### Platform Documentation:
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **UptimeRobot:** https://uptimerobot.com/help

### Troubleshooting:
- **Render Logs:** Dashboard → Logs tab
- **Vercel Logs:** Dashboard → Deployments → View logs
- **MongoDB Logs:** Atlas → Database → Metrics

---

## 🎯 **RECOMMENDED: RENDER + VERCEL**

**This is the best free combination because:**
1. ✅ Vercel frontend has NO sleep issues
2. ✅ Render backend can be kept alive with UptimeRobot
3. ✅ Both have automatic HTTPS
4. ✅ Both auto-deploy from GitHub
5. ✅ Combined free limits are very generous
6. ✅ Professional URLs included
7. ✅ Good performance globally

**Total setup time:** ~30 minutes  
**Total cost:** $0 forever (with generous usage limits)

---

**Ready to deploy? Follow the steps above and your cafeteria app will be live!** 🚀

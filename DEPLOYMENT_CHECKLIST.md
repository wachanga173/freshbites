# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment (Complete These First)

### 1. Security Verification
```bash
# Run security audit
node security-audit.js
```
- [ ] Security audit passes with 0 issues
- [ ] .env files NOT in Git
- [ ] .gitignore includes all sensitive files

### 2. Environment Variables Prepared
- [ ] server/.env configured for local dev
- [ ] client/.env configured for local dev
- [ ] List of all env vars ready for Render/Vercel

### 3. Code Ready
- [ ] Latest code committed to GitHub
- [ ] All tests pass (if you have tests)
- [ ] No console.log statements in production code

---

## 🌐 Backend Deployment (Render.com)

### Step 1: Sign Up
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Select your **cafeteria** repository
3. Configure:
   - **Name:** `cafeteria-api`
   - **Region:** Oregon (or closest)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### Step 3: Environment Variables
Add these in Render Dashboard → Environment tab:

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
FRONTEND_URL=https://YOUR-APP.vercel.app
```

**Note:** Update `FRONTEND_URL` after deploying frontend

### Step 4: Deploy
- [ ] Click **"Create Web Service"**
- [ ] Wait for deployment (~2-5 minutes)
- [ ] Check logs for errors
- [ ] Test health endpoint: `https://cafeteria-api.onrender.com/health`

**Your Backend URL:** `https://cafeteria-api.onrender.com`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Sign Up
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your **cafeteria** repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Environment Variables
Add these in Vercel → Settings → Environment Variables:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=https://cafeteria-api.onrender.com
```

### Step 4: Deploy
- [ ] Click **"Deploy"**
- [ ] Wait for deployment (~1-2 minutes)
- [ ] Visit your site
- [ ] Test all features

**Your Frontend URL:** `https://YOUR-APP.vercel.app`

---

## 🔄 Post-Deployment

### 1. Update Backend CORS
Go back to Render → Environment Variables:
- [ ] Update `FRONTEND_URL` with your actual Vercel URL
- [ ] Trigger manual redeploy

### 2. MongoDB Atlas Network Access
1. Go to MongoDB Atlas → Network Access
2. [ ] Click "Add IP Address"
3. [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
4. [ ] Confirm

### 3. Test Everything
- [ ] Frontend loads successfully
- [ ] Can register new user
- [ ] Can login
- [ ] Can view menu
- [ ] Can add items to cart
- [ ] Can place order
- [ ] Can track order
- [ ] Admin dashboard works
- [ ] Delivery dashboard works
- [ ] GPS tracking works
- [ ] Google Maps displays correctly

### 4. Setup Uptime Monitoring (Optional but Recommended)
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Sign up (free)
3. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://cafeteria-api.onrender.com/health`
   - Interval: 5 minutes
4. This prevents Render from sleeping!

---

## 🔒 Security Post-Deployment

### 1. Verify No Secrets in Git
```bash
# Check git history for .env files
git log --all --full-history -- "**/.env"

# Should return nothing!
```

### 2. Verify Environment Variables
- [ ] No secrets in GitHub repository
- [ ] All secrets in Render/Vercel dashboards
- [ ] .env files in .gitignore

### 3. Test Security Headers
Visit: https://securityheaders.com
- [ ] Enter your Vercel URL
- [ ] Check score (should be A or B)

---

## 📊 URLs Summary

After deployment, save these URLs:

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** | `https://YOUR-APP.vercel.app` | Customer-facing site |
| **Backend** | `https://cafeteria-api.onrender.com` | API server |
| **MongoDB** | MongoDB Atlas | Already configured |
| **Health Check** | `/health` | Backend health endpoint |

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Server won't start
```bash
# Check Render logs
# Common issues:
1. Missing environment variable
2. MongoDB connection failed
3. Port already in use
```
**Solution:** Check Environment Variables tab in Render

**Problem:** API calls fail with CORS error
```bash
# Solution:
1. Verify FRONTEND_URL in Render env vars
2. Check CORS whitelist in server/middleware/security.js
3. Redeploy backend
```

### Frontend Issues

**Problem:** White screen / won't load
```bash
# Check Vercel deployment logs
# Common issues:
1. Build failed
2. Wrong output directory
3. Missing environment variables
```
**Solution:** Check Vercel → Deployments → View logs

**Problem:** API calls return 404
```bash
# Solution:
1. Verify VITE_API_URL in Vercel env vars
2. Make sure it points to https://cafeteria-api.onrender.com
3. Redeploy frontend
```

### Database Issues

**Problem:** Can't connect to MongoDB
```bash
# Solution:
1. MongoDB Atlas → Network Access
2. Add IP 0.0.0.0/0 (allow from anywhere)
3. Verify connection string is correct
4. Check MongoDB Atlas cluster is running
```

---

## 🎉 Success Criteria

Your deployment is successful when:

- [ ] ✅ Frontend loads at Vercel URL
- [ ] ✅ Backend responds at Render URL
- [ ] ✅ Health check returns `{"status":"ok"}`
- [ ] ✅ Can register and login
- [ ] ✅ Can view menu items
- [ ] ✅ Can place orders
- [ ] ✅ GPS tracking works
- [ ] ✅ Google Maps displays
- [ ] ✅ Admin functions work
- [ ] ✅ No console errors
- [ ] ✅ HTTPS working on both

---

## 📈 Next Steps After Deployment

1. **Custom Domain (Optional)**
   - Buy domain (~$10/year)
   - Configure in Vercel/Render
   - Update DNS settings

2. **Monitoring Setup**
   - UptimeRobot for availability
   - Sentry for error tracking (optional)
   - Google Analytics (optional)

3. **Performance Optimization**
   - Enable Vercel Analytics
   - Monitor Render metrics
   - Check MongoDB slow queries

4. **Backup Strategy**
   - Schedule MongoDB backups
   - Export environment variables
   - Document deployment process

---

## 💰 Cost Breakdown (All FREE)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Render | 750 hours/month | $7/month always-on |
| Vercel | Unlimited | $20/month pro |
| MongoDB Atlas | 512MB storage | $9/month for 2GB |
| UptimeRobot | 50 monitors | $7/month |
| **TOTAL** | **$0/month** | ~$43/month full stack |

**Note:** Free tier is MORE than enough for:
- 1000+ daily active users
- 100GB bandwidth/month
- Professional portfolio project
- Small business MVP

---

## 🎯 Deployment Time Estimate

- **Render Backend Setup:** 10-15 minutes
- **Vercel Frontend Setup:** 5-10 minutes
- **Testing & Verification:** 10-15 minutes
- **Total:** ~30-40 minutes

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com
- **This Project Docs:** See FREE_DEPLOYMENT_GUIDE.md

---

**Ready to deploy? Start with Backend (Render) first, then Frontend (Vercel)!** 🚀

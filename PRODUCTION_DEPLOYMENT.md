# Production Deployment Guide

## 🔒 Security Hardening Completed

### ✅ Implemented Security Measures

#### 1. **Authentication & Authorization**
- ✅ Multi-role system with proper validation
- ✅ JWT token authentication with expiry (7 days)
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control middleware
- ✅ Password complexity requirements enforced
- ✅ Security event logging for auth attempts

#### 2. **Input Validation & Sanitization**
- ✅ Express-validator for all inputs
- ✅ NoSQL injection prevention (express-mongo-sanitize)
- ✅ XSS protection through validation
- ✅ HTTP parameter pollution prevention (hpp)
- ✅ Request body size limits (10MB)
- ✅ File upload validation (5MB, images only)

#### 3. **Security Headers**
- ✅ Helmet.js configuration
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options (prevent clickjacking)
- ✅ X-Content-Type-Options (prevent MIME sniffing)
- ✅ Strict-Transport-Security (HSTS)
- ✅ Cross-Origin policies configured

#### 4. **Rate Limiting & DDoS Protection**
- ✅ General API rate limit: 100 requests/15min per IP
- ✅ Auth endpoints: 5 attempts/15min per IP
- ✅ Sensitive operations: 10 requests/15min per IP
- ✅ IP-based throttling
- ✅ Standardized error responses

#### 5. **Database Security**
- ✅ MongoDB connection with authentication
- ✅ Connection pooling configured
- ✅ Indexes on all frequently queried fields
- ✅ Data sanitization before database operations
- ✅ Proper error handling for DB operations

#### 6. **Logging & Monitoring**
- ✅ Winston logger (file + console)
- ✅ Morgan HTTP request logging
- ✅ Separate error and combined logs
- ✅ Log rotation (5MB per file, 5 files)
- ✅ Security event tracking
- ✅ User action auditing

#### 7. **Error Handling**
- ✅ Global error handler middleware
- ✅ Production vs development error responses
- ✅ No sensitive data leakage in production
- ✅ Proper HTTP status codes
- ✅ Graceful error recovery
- ✅ Unhandled rejection/exception handlers

#### 8. **Performance Optimization**
- ✅ Response compression (gzip)
- ✅ Database indexes on all models
- ✅ Connection pooling
- ✅ Efficient query patterns
- ✅ Static file caching
- ✅ PM2 cluster mode support

#### 9. **Process Management**
- ✅ PM2 ecosystem configuration
- ✅ Graceful shutdown handling
- ✅ Auto-restart on crashes
- ✅ Memory limit monitoring (500MB)
- ✅ Log aggregation
- ✅ Zero-downtime deployments ready

#### 10. **CORS & API Security**
- ✅ Whitelist-based CORS policy
- ✅ Credentials support configured
- ✅ Environment-based URL whitelisting
- ✅ Preflight request handling
- ✅ Method restrictions where needed

---

## 🚀 Production Deployment Steps

### Prerequisites
1. Node.js v14+ installed
2. MongoDB Atlas account with database created
3. PayPal and M-Pesa developer accounts
4. Google Maps API key
5. SSL certificate for HTTPS
6. Domain name configured

### Environment Variables Setup

#### Server (.env)
```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cafeteria

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# PayPal
PAYPAL_CLIENT_ID=your-production-paypal-client-id
PAYPAL_CLIENT_SECRET=your-production-paypal-secret

# M-Pesa (Production)
MPESA_CONSUMER_KEY=your-production-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-production-mpesa-consumer-secret
MPESA_SHORTCODE=your-production-shortcode
MPESA_PASSKEY=your-production-passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payment/mpesa/callback

# Server
NODE_ENV=production
PORT=3000
SHIPPING_FEE=50

# CORS Whitelist
FRONTEND_URL=https://yourdomain.com
```

#### Client (.env)
```env
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_API_URL=https://api.yourdomain.com
```

### Installation Steps

#### 1. Server Setup
```bash
cd server
npm install
npm install -g pm2

# Build production bundle (if needed)
npm run build
```

#### 2. Client Setup
```bash
cd client
npm install
npm run build

# This creates a 'dist' folder with optimized production build
```

#### 3. Database Optimization
```bash
# Ensure all indexes are created
node -e "require('./models/User'); require('./models/Order'); require('./models/MenuItem');"
```

#### 4. SSL Certificate Setup
```bash
# Using Let's Encrypt (recommended)
sudo apt-get install certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com
```

#### 5. Start Production Server
```bash
# Using PM2
cd server
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

#### 6. Nginx Configuration (Recommended)
```nginx
# /etc/nginx/sites-available/cafeteria
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers (additional to Helmet)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Serve frontend
    location / {
        root /var/www/cafeteria/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve uploaded images
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cafeteria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📊 Monitoring & Maintenance

### PM2 Commands
```bash
# View all processes
pm2 list

# Monitor CPU/Memory
pm2 monit

# View logs
pm2 logs cafeteria-api

# Restart application
pm2 restart cafeteria-api

# Reload (zero-downtime)
pm2 reload cafeteria-api

# Stop application
pm2 stop cafeteria-api

# Delete from PM2
pm2 delete cafeteria-api
```

### Log Management
```bash
# View application logs
tail -f server/logs/combined.log
tail -f server/logs/error.log

# View PM2 logs
pm2 logs --lines 100

# Rotate logs manually
pm2 flush
```

### Health Checks
```bash
# Check application health
curl https://yourdomain.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600.5,
  "environment": "production"
}
```

### Database Maintenance
```bash
# Create backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/cafeteria" --out=./backup

# Restore backup
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/cafeteria" ./backup/cafeteria

# Check database size
mongo "mongodb+srv://user:pass@cluster.mongodb.net/cafeteria" --eval "db.stats()"
```

---

## 🔍 Security Checklist

### Pre-Deployment
- [ ] All environment variables set in production
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] PayPal/M-Pesa using production credentials
- [ ] SSL certificate installed and valid
- [ ] Firewall configured (allow 80, 443, deny 3000)
- [ ] Database backups scheduled
- [ ] Monitoring tools configured
- [ ] Error tracking service setup (optional: Sentry)

### Post-Deployment
- [ ] Test all API endpoints
- [ ] Verify rate limiting works
- [ ] Check security headers (securityheaders.com)
- [ ] Test authentication flows
- [ ] Verify HTTPS redirect works
- [ ] Check log files are being created
- [ ] Test payment integrations
- [ ] Verify GPS tracking works
- [ ] Test role-based access control
- [ ] Run security scan (npm audit, Snyk)

---

## 🛡️ Security Best Practices

### API Key Management
- Never commit .env files to Git
- Rotate keys every 90 days
- Use different keys for dev/staging/production
- Monitor API usage for anomalies

### Database Security
- Enable MongoDB authentication
- Use IP whitelisting in MongoDB Atlas
- Enable audit logging
- Regular backups (automated)
- Encrypt backups

### Server Security
- Keep OS and packages updated
- Use UFW firewall
- Disable root SSH login
- Use SSH keys instead of passwords
- Regular security updates

### Application Security
- Regular dependency updates (npm audit)
- Monitor error logs daily
- Review security event logs
- Test rate limiting effectiveness
- Regular penetration testing

---

## 📈 Performance Optimization

### Already Implemented
- Response compression (gzip)
- Database indexing
- Connection pooling
- Static file caching
- Cluster mode with PM2

### Additional Optimizations (Optional)
1. **CDN for Static Assets**
   - Use Cloudflare or AWS CloudFront
   - Serve images from CDN

2. **Redis Caching**
   - Cache frequently accessed data
   - Session storage
   - Rate limiting store

3. **Load Balancer**
   - Distribute traffic across multiple servers
   - Auto-scaling support

4. **Database Replicas**
   - Read replicas for MongoDB
   - Improves read performance

---

## 🚨 Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs cafeteria-api --lines 50

# Common issues:
# - Port already in use: Change PORT in .env
# - MongoDB connection failed: Check MONGODB_URI
# - Missing dependencies: Run npm install
```

### High Memory Usage
```bash
# Check memory
pm2 monit

# Restart with lower limit
pm2 restart cafeteria-api --max-memory-restart 400M
```

### Slow API Responses
```bash
# Check database indexes
mongo "mongodb+srv://..." --eval "db.orders.getIndexes()"

# Monitor queries
# Enable MongoDB slow query log in Atlas

# Check API response times
pm2 logs cafeteria-api | grep "ms"
```

---

## 📞 Support & Resources

### Documentation
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- PM2: https://pm2.keymetrics.io/
- Helmet: https://helmetjs.github.io/

### Security Resources
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Express Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- Node.js Security Checklist: https://blog.risingstack.com/node-js-security-checklist/

---

## 🔄 Update Procedure

### Code Updates
```bash
# Pull latest code
git pull origin main

# Install dependencies
cd server && npm install
cd ../client && npm install

# Build client
cd client && npm run build

# Reload server (zero-downtime)
cd server && pm2 reload cafeteria-api
```

### Database Migrations
```bash
# Backup first!
mongodump --uri="..." --out=./backup

# Run migration script
node migrations/your-migration.js

# Verify changes
mongo "..." --eval "db.orders.findOne()"
```

---

**✅ Your cafeteria application is now production-ready with enterprise-grade security!**

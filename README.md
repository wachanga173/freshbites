# 🍴 Fresh Bites Café — Evolutionary Full-Stack Food Delivery Platform

> **An evolutionary, scalable food delivery platform built with modern technology. Open for developer collaboration.**

This repository contains a production-ready full-stack cafeteria web application with advanced features including real-time GPS delivery tracking, secure payment integration, and comprehensive security measures.

## 🌟 Platform Architecture

- **`client/`** — React 18 + Vite frontend with real-time GPS tracking UI
- **`server/`** — Express.js REST API with MongoDB, JWT authentication, and payment processing
- **Real-Time GPS Tracking** — Browser-based geolocation with Haversine distance calculations
- **Security Layer** — Rate limiting, input validation, location spoofing detection
- **Payment Gateway** — PayPal & M-Pesa (Daraja API) integration

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Git

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/cafeteria.git
cd cafeteria

# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Environment Configuration

```bash
cd server
cp .env.example .env
# Edit .env with your credentials (MongoDB, PayPal, M-Pesa, JWT secret)
```

**Required Environment Variables:**
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — JWT token secret
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET` — PayPal credentials
- `MPESA_*` — M-Pesa Daraja API credentials (Consumer Key, Secret, Passkey)

### 3. Start Development Servers

```bash
# From root directory - starts both server and client
npm run dev
```

This launches:
- **Express API Server:** http://localhost:3000
- **React Dev Server:** http://localhost:5173 (with hot reload)

The client automatically proxies API requests to the server.

### 4. Access the Application

Open **http://localhost:5173** in your browser.

---

## 🎯 Core Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Customer, Admin, Super Admin, Delivery Person, Order Manager, Feedback Manager)
- **Secure password hashing** with bcrypt
- **Session management** with HTTP-only cookies

### 🛒 Shopping & Ordering
- **Interactive menu** with category filtering (Breakfast, Lunch, Dinner, Drinks)
- **Real-time shopping cart** with quantity controls
- **Order history** and tracking
- **Menu management** for admins (CRUD operations with image upload)

### 💳 Payment Processing
- **PayPal Integration** — Secure international payments
- **M-Pesa Integration** — STK Push for Kenyan mobile money (Daraja API)
- **Transaction history** and receipt generation
- **Payment verification** and webhook handling

### 📍 Real-Time GPS Delivery Tracking
- **Browser Geolocation API** — No Google Maps API key required
- **Haversine formula** — Accurate distance calculations (meters/kilometers)
- **Live ETA estimation** — Based on distance and average delivery speed
- **Direction compass** — N, NE, E, SE, S, SW, W, NW bearing indicators
- **Customer view** — Real-time delivery person location and ETA
- **Delivery dashboard** — Automatic location updates every 5 seconds
- **Privacy filters** — Location history hidden from customers

### 🛡️ Enterprise Security
- **Rate Limiting** — Protection against abuse and DDoS
  - 20 location updates per minute
  - 30 tracking views per minute
  - 100 general API requests per 15 minutes
- **Input Validation** — GPS coordinate validation, sanitization
- **Location Spoofing Detection** — Speed-based anomaly detection (flags >200 km/h)
- **Authorization Checks** — Order ownership verification, role-based access
- **NoSQL Injection Prevention** — MongoDB sanitization
- **XSS Protection** — Helmet.js security headers
- **HTTPS Enforcement** — Secure communication
- **Security Logging** — Winston logger for audit trails

### 📱 Mobile-First Design
- **Responsive UI** — Optimized for all screen sizes
- **PWA Support** — Progressive Web App capabilities
- **App Download Links** — Android APK and iOS/PWA
- **Touch-optimized** — Mobile-friendly interactions

### 🎨 Modern UI/UX
- **Gradient designs** — Modern aesthetic with smooth animations
- **Card-based layout** — Clean, organized interface
- **Real-time updates** — Live data synchronization
- **Feedback system** — User feedback collection and management
- **Interactive components** — Smooth transitions and hover effects

---

## 📚 Technical Stack

### Frontend
- **React 18.2** — Modern component-based UI
- **Vite 5.0** — Lightning-fast build tool
- **React Router 7.9** — Client-side routing
- **Axios** — HTTP client for API requests
- **CSS3** — Custom styling with gradients and animations

### Backend
- **Node.js** — JavaScript runtime
- **Express 4.18** — Web application framework
- **Mongoose 8.19** — MongoDB object modeling
- **JWT** — JSON Web Tokens for authentication
- **bcrypt** — Password hashing
- **Multer** — File upload handling
- **Winston** — Logging framework

### Security Middleware
- **Helmet** — HTTP security headers
- **express-rate-limit** — Rate limiting
- **express-mongo-sanitize** — NoSQL injection prevention
- **hpp** — HTTP parameter pollution protection
- **cors** — Cross-Origin Resource Sharing

### Payment Gateways
- **PayPal REST API** — International payments
- **M-Pesa Daraja API** — Mobile money (Kenya)

### Development Tools
- **ESLint** — Code quality and consistency
- **Nodemon** — Auto-restart development server
- **Concurrently** — Run multiple commands simultaneously

---

## 🛠️ Advanced Configuration

### Individual Commands

Run server and client separately for development:

```bash
# Server only
cd server
npm install
npm start

# Client only
cd client
npm install
npm run dev
```

### Code Quality

```bash
# Run ESLint on client
cd client
npm run lint

# Run ESLint on server
cd server
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Production Build

```bash
# Build optimized client bundle
cd client
npm run build

# Preview production build
npm run preview
```

The production build creates static files in `client/dist/` that can be:
- Served by Express (static middleware)
- Deployed to Vercel, Netlify, or any static host
- Integrated with CDN for global distribution

---

## 🔧 Database Setup

### MongoDB Configuration

This application uses MongoDB. You can use:

1. **Local MongoDB:**
   ```bash
   # Install MongoDB locally
   # Set MONGODB_URI=mongodb://localhost:27017/cafeteria
   ```

2. **MongoDB Atlas (Cloud):**
   ```bash
   # Create free cluster at https://www.mongodb.com/cloud/atlas
   # Set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cafeteria
   ```

### Initialize Super Admin

```bash
cd server
node init-superadmin.js
```

This creates the first admin user with credentials displayed in the console.

---

## 🌐 Deployment

### Client Deployment (Vercel)

```bash
cd client
vercel deploy --prod
```

The `vercel.json` is pre-configured for SPA routing.

### Server Deployment (Render/Railway)

The `render.yaml` is included for Render deployment:
- Configure environment variables in Render dashboard
- Connect GitHub repository
- Auto-deploy on push

**Environment Variables Required:**
```
NODE_ENV=production
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret>
PAYPAL_CLIENT_ID=<paypal-client-id>
PAYPAL_CLIENT_SECRET=<paypal-secret>
MPESA_CONSUMER_KEY=<mpesa-key>
MPESA_CONSUMER_SECRET=<mpesa-secret>
MPESA_PASSKEY=<mpesa-passkey>
```

---

## 📖 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     — Register new user
POST /api/auth/login        — User login (returns JWT)
GET  /api/auth/me           — Get current user profile
```

### Menu Endpoints

```
GET    /api/menu            — Get all menu items
POST   /api/menu            — Create menu item (Admin)
PUT    /api/menu/:id        — Update menu item (Admin)
DELETE /api/menu/:id        — Delete menu item (Admin)
```

### Order Endpoints

```
GET  /api/orders            — Get user orders
POST /api/orders            — Create new order
GET  /api/orders/:id        — Get specific order
PUT  /api/orders/:id/status — Update order status (Admin)
```

### Payment Endpoints

```
POST /api/payment/paypal/create    — Create PayPal payment
POST /api/payment/paypal/capture   — Capture PayPal payment
POST /api/payment/mpesa/initiate   — Initiate M-Pesa STK Push
POST /api/payment/mpesa/callback   — M-Pesa callback (webhook)
```

### Delivery Tracking Endpoints

```
POST /api/delivery/update-location  — Update delivery location (Delivery Person)
GET  /api/delivery/track/:orderId   — Track order delivery (Customer)
```

### User Management (Admin)

```
GET    /api/users           — Get all users (Admin)
PUT    /api/users/:id/role  — Update user role (Super Admin)
DELETE /api/users/:id       — Delete user (Super Admin)
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Add items to cart
- [ ] Checkout with PayPal
- [ ] Checkout with M-Pesa
- [ ] Order tracking
- [ ] Real-time GPS delivery tracking
- [ ] Admin menu management
- [ ] Role-based access control
- [ ] Rate limiting (try rapid requests)
- [ ] Mobile responsiveness

### Security Testing

- [ ] JWT token expiration
- [ ] Invalid GPS coordinates
- [ ] Location spoofing detection (rapid location changes)
- [ ] Rate limit enforcement
- [ ] XSS prevention
- [ ] NoSQL injection attempts
- [ ] Unauthorized access attempts

---

## 🤝 Collaboration & Scaling

### 🚀 Evolutionary Platform

This platform is designed to be **evolutionary and highly scalable**. We welcome developers, designers, and innovators who want to collaborate in expanding capabilities and reach.

### Developer Collaboration

Interested in contributing to the platform's growth? We're looking for:
- **Full-Stack Developers** — Enhance features and scalability
- **Mobile Developers** — Native iOS/Android apps
- **DevOps Engineers** — Infrastructure and CI/CD
- **UI/UX Designers** — Improve user experience
- **QA Engineers** — Testing and quality assurance

**Contact for Collaboration:**  
📞 Call button available in the application footer

### Scalability Roadmap

**Current Capabilities:**
- Single-region deployment
- Real-time GPS tracking
- Multi-payment gateway support
- Role-based access control

**Future Scaling Opportunities:**
- Multi-region support with CDN
- Microservices architecture
- GraphQL API layer
- Advanced analytics dashboard
- AI-powered recommendations
- Blockchain payment integration
- Multi-language support (i18n)
- White-label solution for franchises
- Advanced logistics optimization
- Driver mobile app (React Native)
- Customer mobile app (Flutter)
- Real-time notifications (WebSocket/FCM)
- Advanced reporting and insights

---

## 📄 Project Structure

```
cafeteria/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   │   ├── robots.txt     # SEO crawler directives
│   │   └── sitemap.xml    # SEO sitemap
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Cart.jsx
│   │   │   ├── DeliveryMap.jsx
│   │   │   ├── FeedbackChatbot.jsx
│   │   │   ├── GPSTracker.jsx       # GPS tracking component
│   │   │   ├── MenuItem.jsx
│   │   │   └── RoleSwitcher.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── DeliveryDashboard.jsx
│   │   │   ├── OrderTracking.jsx    # Customer tracking view
│   │   │   └── ...
│   │   ├── context/       # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── config/        # Configuration
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html         # Entry HTML with SEO meta tags
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Express backend
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── security.js     # Rate limiting, validation, spoofing detection
│   │   └── validation.js
│   ├── models/            # Mongoose models
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── DeliveryTracking.js
│   │   └── Feedback.js
│   ├── routes/            # API routes
│   ├── uploads/           # Uploaded images
│   ├── server.js          # Main server file
│   ├── auth.js            # Authentication logic
│   ├── userService.js     # User management
│   ├── .env.example       # Environment template
│   └── package.json
│
├── package.json           # Root package (scripts)
├── README.md              # This file
└── render.yaml            # Render deployment config
```

---

## 🔒 Security Best Practices

1. **Environment Variables:** Never commit `.env` files
2. **JWT Secret:** Use strong, random secrets (256-bit minimum)
3. **HTTPS:** Always use HTTPS in production
4. **Rate Limiting:** Configure appropriate limits for your traffic
5. **Input Validation:** Validate all user inputs on both client and server
6. **MongoDB Security:** Use authentication and IP whitelisting
7. **CORS:** Configure allowed origins in production
8. **Security Headers:** Helmet.js is pre-configured
9. **Password Strength:** Enforce strong passwords (8+ chars, mixed case, numbers)
10. **Regular Updates:** Keep dependencies updated (npm audit)

---

## 🐛 Troubleshooting

### Common Issues

**Problem:** MongoDB connection error  
**Solution:** Check `MONGODB_URI` in `.env` and ensure MongoDB is running

**Problem:** Port already in use  
**Solution:** Change ports in `server.js` and `vite.config.js`

**Problem:** PayPal sandbox not working  
**Solution:** Verify credentials and use sandbox test accounts

**Problem:** GPS tracking not updating  
**Solution:** Check browser location permissions and HTTPS requirement

**Problem:** Rate limit errors  
**Solution:** Increase limits in `middleware/security.js` for development

### Debug Mode

Enable detailed logging:
```bash
# Server logs
cd server
DEBUG=* npm start

# Client verbose
cd client
npm run dev -- --debug
```

---

## 📜 License

This project is licensed under the **MIT License** — see LICENSE file for details.

Made with ❤️ for the community | Fresh Bites Café © 2024-2026

---

## 🌐 SEO Optimization

This application is optimized for search engines with:
- ✅ Semantic HTML structure
- ✅ Meta tags (Open Graph, Twitter Cards)
- ✅ Schema.org structured data
- ✅ Canonical URLs
- ✅ robots.txt and sitemap.xml
- ✅ Mobile-first responsive design
- ✅ Fast loading (Vite optimization)
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ NoScript fallback for SEO crawlers

---

## 📞 Support & Contact

For technical support, feature requests, or collaboration opportunities:
- **Developer Contact:** Available in application footer
- **GitHub Issues:** Open an issue for bug reports
- **Documentation:** Refer to this README and inline code comments

**Evolutionary Platform — Built to Scale — Open for Collaboration**

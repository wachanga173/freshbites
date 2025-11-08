# Fresh Bites Café — Full-Stack React App

This repository contains a full-stack cafeteria web application with payment integration:

- **`server/`** — Express API with PayPal & M-Pesa payment processing
- **`client/`** — React + Vite frontend with modern checkout flow

## Quick Start

### 1. Install all dependencies

From the root folder:

```bash
npm run install:all
```

This will install dependencies for the root, server, and client.

### 2. Run both server and client together

```bash
npm run dev
```

This starts:
- Express server on **http://localhost:3000** (API endpoints: `/api/menu`, `/api/order`)
- Vite dev server on **http://localhost:5173** (React app with hot reload)

The client is configured to proxy API requests to the server automatically.

### 3. Open the app

Visit **http://localhost:5173** in your browser.

---

## Individual Commands

If you prefer to run server and client separately:

**Server:**
```bash
cd server
npm install
npm start
```

**Client:**
```bash
cd client
npm install
npm run dev
```

---

## Build for Production

**Client:**
```bash
cd client
npm run build
```

This creates an optimized build in `client/dist/` which can be served by Express or any static host.

---

## Payment Integration

This app supports **PayPal** and **M-Pesa** payment methods.

### Setup Payment Credentials

1. Copy the environment example file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Add your payment credentials to `.env`:
   - **PayPal**: Get credentials from [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - **M-Pesa**: Get credentials from [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)

3. See **[PAYMENT_SETUP.md](./PAYMENT_SETUP.md)** for detailed setup instructions

### Features

✅ **Authentication System**
- User registration and login with JWT
- Role-based access (Customer, Admin, Super Admin)
- Secure password hashing with bcrypt

✅ **Shopping Cart**
- Add/remove items
- Quantity controls
- Real-time total calculation

✅ **Payment Options**
- **PayPal**: Secure international payments
- **M-Pesa**: STK Push for Kenyan mobile payments
- Order tracking and history

✅ **Admin Dashboard**
- Menu management (add, edit, delete items)
- Image upload support
- User management (Super Admin only)

✅ **Responsive Design**
- Modern card-based UI
- Mobile-friendly checkout flow
- Category filtering (Breakfast, Lunch, Drinks)

---

## Super Admin Account

**Username:** `superadmin`  
**Password:** `admin123`

Use this account to access the admin panel and create additional admin users.

---

## Notes

- Background images are in `client/public/` and served by Vite
- Menu data is in `server/menu.json`
- Orders are stored in `server/orders.json`
- User data is in `server/users.json`
- Uploaded images are saved to `server/uploads/`
- For production, consider using a proper database (MongoDB, PostgreSQL, etc.)

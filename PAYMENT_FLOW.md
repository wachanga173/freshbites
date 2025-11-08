# Payment Flow - Quick Reference

## 🛒 Complete Checkout Flow

### Step 1: Add Items to Cart
```
[Menu Page]
  ↓ Click "Add to Cart" on items
[Cart Sidebar Updates]
  ↓ Click "Proceed to Checkout"
```

### Step 2: Checkout Page
```
╔══════════════════════════════════════╗
║  ORDER SUMMARY                       ║
║  • Chapati (x2) ......... KSH 260   ║
║  • Coffee (x1) ........... KSH 325   ║
║                                      ║
║  SELECT PAYMENT METHOD               ║
║  ┌─────────┐  ┌─────────┐          ║
║  │ 💳      │  │ 📱      │          ║
║  │ PayPal  │  │ M-Pesa  │          ║
║  └─────────┘  └─────────┘          ║
║                                      ║
║  PAYMENT DETAILS                     ║
║  Subtotal: ........... KSH 585      ║
║  Delivery: ........... KSH 200      ║
║  ─────────────────────────────       ║
║  Total: .............. KSH 785      ║
║                                      ║
║  [Pay KSH 785] 🔒                   ║
╚══════════════════════════════════════╝
```

### Step 3A: PayPal Flow
```
[Checkout]
  ↓ Select PayPal → Click "Pay Now"
[PayPal Login Page]
  ↓ Login with sandbox account
[PayPal Approval]
  ↓ Approve payment
[Processing...]
  ↓ Execute payment
[Success Page]
  ✓ Payment Successful!
  Order ID: ord_1234567890
```

### Step 3B: M-Pesa Flow
```
[Checkout]
  ↓ Select M-Pesa → Enter phone: 254712345678
[Processing...]
  ↓ STK Push sent to phone
[Your Phone]
  ↓ Enter M-Pesa PIN
[Status Polling...]
  ↓ Checking payment status every 3 seconds
[Success!]
  ✓ Payment Confirmed!
  Order saved to database
```

## 📱 User Interface Elements

### Payment Method Cards
```
┌──────────────────┐  ┌──────────────────┐
│      💳          │  │       📱         │
│    PayPal        │  │     M-Pesa       │
│                  │  │                  │
│  Pay securely    │  │  Pay with        │
│  with PayPal     │  │  M-Pesa STK Push │
└──────────────────┘  └──────────────────┘
     (Click to select)       (Click to select)
```

### M-Pesa Phone Input (when M-Pesa selected)
```
┌────────────────────────────────────────┐
│ M-Pesa Phone Number                    │
│ ┌────────────────────────────────────┐ │
│ │ 254712345678                       │ │
│ └────────────────────────────────────┘ │
│ Enter phone number in format:          │
│ 254XXXXXXXXX                           │
└────────────────────────────────────────┘
```

### Success Page
```
╔══════════════════════════════════════╗
║                                      ║
║           ┌─────────┐                ║
║           │    ✓    │                ║
║           └─────────┘                ║
║                                      ║
║      Payment Successful!             ║
║                                      ║
║   Your order has been confirmed      ║
║                                      ║
║   Order ID: ord_1699999999999        ║
║   Date: Nov 8, 2025 10:30 AM         ║
║                                      ║
║      [Back to Home]                  ║
║                                      ║
╚══════════════════════════════════════╝
```

## 🔐 Security Features

✅ **Authentication Required**
- Must be logged in to checkout
- JWT token validation
- Secure session management

✅ **Payment Security**
- PayPal sandbox for testing
- HTTPS required for M-Pesa
- No card details stored locally

✅ **Order Tracking**
- Unique order IDs
- User association
- Payment method recorded
- Timestamp tracking

## 💡 Key Features

### Real-time Updates
- Cart updates instantly
- Payment status polling
- Order confirmation feedback

### Error Handling
- Login required messages
- Payment failure alerts
- Network error recovery

### Mobile Responsive
- Works on all screen sizes
- Touch-friendly buttons
- Optimized for mobile checkout

## 🎨 Color Scheme

```css
Primary Gradient: #667eea → #764ba2
Success Green:    #4CAF50
Error Red:        #f44336
Warning Orange:   #ff9800
Background:       Linear gradient purple
```

## 📊 Order Data Structure

```javascript
{
  id: "ord_1699999999999",
  userId: "user_123",
  username: "testuser",
  items: [
    {
      id: "b1699999999",
      name: "Chapati",
      price: 130,
      quantity: 2,
      image: "url..."
    }
  ],
  total: 785,
  paymentMethod: "mpesa", // or "paypal"
  checkoutRequestID: "ws_CO_...", // M-Pesa only
  paymentId: "PAYID-...", // PayPal only
  status: "completed", // or "pending", "failed"
  createdAt: "2025-11-08T10:30:00Z",
  completedAt: "2025-11-08T10:30:45Z"
}
```

## 🚦 Status Flow

```
Cart Items
    ↓
Select Payment Method
    ↓
┌─────────────┬─────────────┐
│   PayPal    │   M-Pesa    │
└─────────────┴─────────────┘
       ↓             ↓
   Redirect      STK Push
       ↓             ↓
   Approve        Enter PIN
       ↓             ↓
   Execute        Callback
       ↓             ↓
   ┌─────────────────┐
   │  Order Saved    │
   │  Status: Done   │
   └─────────────────┘
```

## 🔄 API Endpoints Used

```
POST /api/payment/paypal/create
GET  /api/payment/paypal/execute?paymentId=...&PayerID=...
POST /api/payment/mpesa/stkpush
GET  /api/payment/mpesa/status/:checkoutRequestID
POST /api/payment/mpesa/callback
GET  /api/orders
```

## ⚡ Quick Test Commands

```bash
# Start servers
npm run dev

# View orders
cat server/orders.json

# Check uploaded images
ls server/uploads/

# View users
cat server/users.json

# View menu
cat server/menu.json
```

---

**Remember**: Setup payment credentials in `server/.env` before testing!
See `PAYMENT_SETUP.md` for detailed instructions.

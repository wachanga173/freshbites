# Fresh Bites Café - Testing Guide

## ✅ Servers Running
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5174

## 🧪 Testing the Complete Checkout Flow

### 1. User Registration & Login

**Test New User Registration:**
1. Open http://localhost:5174
2. Click "Login / Register"
3. Switch to "Register" tab
4. Create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
5. ✅ Should automatically login after registration

**Test Admin Access:**
1. Use these credentials:
   - Username: `superadmin`
   - Password: `admin123`
2. Click "Admin Panel" to access dashboard

### 2. Shopping Cart Flow

**Add Items to Cart:**
1. Browse the menu (Breakfast, Lunch, Drinks)
2. Click "Add to Cart" on various items
3. ✅ Cart sidebar should update in real-time
4. Use +/- buttons to adjust quantities
5. Click × to remove items

**Proceed to Checkout:**
1. Ensure you're logged in
2. Click "Proceed to Checkout"
3. ✅ Should navigate to checkout page

### 3. PayPal Payment Flow

**Setup (Required First):**
1. Get PayPal sandbox credentials from [PayPal Developer](https://developer.paypal.com/dashboard/)
2. Update `server/.env`:
   ```
   PAYPAL_CLIENT_ID=your_actual_client_id
   PAYPAL_CLIENT_SECRET=your_actual_secret
   ```
3. Restart the server

**Test Payment:**
1. On checkout page, select "PayPal" payment card
2. Click "Pay Now"
3. ✅ Should redirect to PayPal login page
4. Login with sandbox buyer account
5. Approve the payment
6. ✅ Should redirect back to success page
7. ✅ Order should be saved in `server/orders.json`

**What You'll See:**
- Processing spinner while creating payment
- PayPal login/approval page
- Success page with order confirmation
- Order ID and timestamp

### 4. M-Pesa Payment Flow

**Setup (Required First):**
1. Get M-Pesa credentials from [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Update `server/.env`:
   ```
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=your_ngrok_url/api/payment/mpesa/callback
   ```
3. Setup ngrok for callback:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL to `MPESA_CALLBACK_URL`
5. Restart the server

**Test Payment:**
1. On checkout page, select "M-Pesa" payment card
2. Enter phone number: `254712345678` (sandbox format)
3. Click "Pay Now"
4. ✅ Alert: "Payment request sent!"
5. Check your phone for STK Push notification
6. Enter M-Pesa PIN
7. ✅ Auto-refreshing status check
8. ✅ Success message when payment confirmed

**What You'll See:**
- Phone number input field appears
- Processing spinner
- Alert message confirming STK Push sent
- Status polling in background (checks every 3 seconds)
- Success page when payment completes

### 5. Order History

**View Your Orders:**
1. Orders are saved in `server/orders.json`
2. Each order includes:
   - Order ID
   - User information
   - Items purchased
   - Total amount
   - Payment method
   - Timestamps

**Check Orders File:**
```bash
cd server
cat orders.json
```

### 6. Admin Features

**Menu Management:**
1. Login as `superadmin`
2. Click "Admin Panel"
3. Test these features:
   - ✅ Add new menu items
   - ✅ Edit existing items (click pencil icon)
   - ✅ Upload images (file or URL)
   - ✅ Delete items (click trash icon)
   - ✅ View all orders

**User Management (Super Admin Only):**
1. Switch to "User Management" tab
2. ✅ Create new admin accounts
3. ✅ View all users
4. ✅ Delete users (except yourself)

### 7. Edge Cases to Test

**Payment Errors:**
- Try checkout without logging in → Should prompt login
- Try with empty cart → Should show error
- Cancel PayPal payment → Should return to cancel page
- Use invalid M-Pesa number → Should show error

**Cart Management:**
- Add same item multiple times
- Update quantities to 0 (should remove)
- Remove items during checkout flow
- Cart persists during session

**Authentication:**
- Try accessing admin panel without login
- Try accessing checkout without login
- Try creating duplicate usernames
- Test logout functionality

## 🔍 Debugging

**Check Backend Logs:**
```bash
# Server terminal shows:
# - API requests
# - Payment processing
# - M-Pesa callbacks
# - Errors
```

**Check Browser Console:**
```javascript
// Open DevTools (F12)
// Watch for:
// - API call responses
// - Authentication status
// - Cart updates
// - Payment flow
```

**Common Issues:**

1. **PayPal not working:**
   - Check credentials in `.env`
   - Verify sandbox mode
   - Check return URLs match

2. **M-Pesa not working:**
   - Verify callback URL is public (use ngrok)
   - Check phone number format (254XXXXXXXXX)
   - Test with sandbox credentials first
   - Check M-Pesa callback in server logs

3. **Orders not saving:**
   - Check `server/orders.json` exists
   - Verify write permissions
   - Check server logs for errors

4. **Images not uploading:**
   - Check `server/uploads/` directory exists
   - Verify multer is installed
   - Check file size (5MB limit)

## 📊 Expected Results

### Successful PayPal Payment:
```json
{
  "id": "ord_1699999999999",
  "userId": "user_id",
  "username": "testuser",
  "paymentMethod": "paypal",
  "paymentId": "PAYID-XXXXXXXXX",
  "status": "completed",
  "completedAt": "2025-11-08T..."
}
```

### Successful M-Pesa Payment:
```json
{
  "id": "ord_1699999999999",
  "userId": "user_id",
  "username": "testuser",
  "items": [...],
  "total": 1500,
  "paymentMethod": "mpesa",
  "checkoutRequestID": "ws_CO_...",
  "status": "completed",
  "completedAt": "2025-11-08T..."
}
```

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change PayPal mode to 'live'
- [ ] Use production M-Pesa credentials
- [ ] Setup proper database (MongoDB/PostgreSQL)
- [ ] Add error logging service
- [ ] Setup email notifications
- [ ] Add SSL certificate
- [ ] Configure proper CORS
- [ ] Add rate limiting
- [ ] Setup monitoring
- [ ] Backup strategy for orders
- [ ] Payment reconciliation system

## 🚀 Next Steps

Ready to enhance? Consider adding:

1. **Order Tracking**: Real-time status updates
2. **Email Notifications**: Order confirmations
3. **Receipt Generation**: PDF receipts
4. **Refund System**: Handle payment refunds
5. **Analytics Dashboard**: Sales reports
6. **Inventory Management**: Stock tracking
7. **Delivery Integration**: Track deliveries
8. **Multi-currency**: Support more currencies
9. **Promo Codes**: Discount system
10. **Customer Reviews**: Rating system

---

**Need Help?**
- PayPal Support: https://developer.paypal.com/support/
- M-Pesa Support: https://developer.safaricom.co.ke/support
- See PAYMENT_SETUP.md for detailed configuration

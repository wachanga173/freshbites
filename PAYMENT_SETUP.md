# Fresh Bites Café - Payment Integration Setup

## PayPal Integration

### 1. Get PayPal API Credentials
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create a Sandbox account or login
3. Create a new REST API app
4. Copy your Client ID and Secret
5. Add these to your `.env` file:
   ```
   PAYPAL_CLIENT_ID=your_actual_client_id
   PAYPAL_CLIENT_SECRET=your_actual_client_secret
   ```

### 2. Test PayPal Payments
- Use PayPal Sandbox accounts for testing
- Create test buyer and seller accounts in the PayPal Developer Dashboard
- Test payments won't charge real money

## M-Pesa Integration

### 1. Get M-Pesa API Credentials
1. Go to [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account and login
3. Create a new app (choose "Lipa Na M-Pesa Online" API)
4. Get your Consumer Key, Consumer Secret, and Passkey
5. Set up your shortcode (use 174379 for sandbox testing)
6. Add these to your `.env` file:
   ```
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payment/mpesa/callback
   ```

### 2. Setup M-Pesa Callback URL
- For local testing, use a service like [ngrok](https://ngrok.com/) to expose your local server
- Run: `ngrok http 3000`
- Copy the HTTPS URL and append `/api/payment/mpesa/callback`
- Update the `MPESA_CALLBACK_URL` in your `.env` file

### 3. Test M-Pesa Payments
- Use M-Pesa sandbox for testing
- Test phone number format: 254XXXXXXXXX
- Sandbox test numbers are provided in the Daraja portal

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual credentials

3. Make sure `.env` is in `.gitignore` (it already should be)

## Running the Application

1. Install dependencies:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

2. Start the servers:
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3000

## Testing Payments

### PayPal Test Flow:
1. Add items to cart
2. Click "Proceed to Checkout"
3. Select "PayPal" payment method
4. Click "Pay Now"
5. Login with sandbox buyer account
6. Approve payment
7. Redirected back to success page

### M-Pesa Test Flow:
1. Add items to cart
2. Click "Proceed to Checkout"
3. Select "M-Pesa" payment method
4. Enter phone number in format: 254XXXXXXXXX
5. Click "Pay Now"
6. Check your phone for STK Push prompt
7. Enter M-Pesa PIN
8. Payment confirmation will appear

## Important Notes

- **Sandbox Mode**: Both PayPal and M-Pesa are configured for sandbox/testing by default
- **Production**: Change mode to 'live' for PayPal and use production credentials for M-Pesa
- **Security**: Never commit your `.env` file with real credentials
- **Callback URL**: M-Pesa callbacks require a public HTTPS URL (use ngrok for local testing)

## Troubleshooting

### PayPal Issues:
- Verify credentials are correct
- Check sandbox account has sufficient balance
- Ensure return URLs are correct

### M-Pesa Issues:
- Verify phone number format (254XXXXXXXXX)
- Check callback URL is publicly accessible
- Ensure consumer key and secret are valid
- Test with sandbox credentials first

## Support

For PayPal: https://developer.paypal.com/support/
For M-Pesa: https://developer.safaricom.co.ke/support

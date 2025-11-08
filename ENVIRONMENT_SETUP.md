# Environment Variables Setup

This project uses environment variables to keep sensitive information secure.

## Quick Setup

### 1. Server Environment Variables

```bash
cd server
# .env already exists with configuration
```

Edit `server/.env` if needed:
- MongoDB connection string
- Payment gateway credentials (PayPal, M-Pesa)
- JWT secret
- Shipping fee

### 2. Client Environment Variables

```bash
cd client
cp .env.example .env
```

Edit `client/.env` and add your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

## Getting API Keys

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API
4. Go to Credentials → Create API Key
5. Copy the key to `client/.env`

See detailed instructions in [GOOGLE_MAPS_SETUP.md](./GOOGLE_MAPS_SETUP.md)

### PayPal (Optional)

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Create sandbox app
3. Copy Client ID and Secret to `server/.env`

### M-Pesa (Optional)

1. Go to [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create app and get credentials
3. Add to `server/.env`

## Security Notes

- ✅ `.env` files are in `.gitignore` (not committed to Git)
- ✅ Use `.env.example` as templates
- ✅ Never share your API keys publicly
- ✅ Rotate keys if exposed

## Environment Variables Reference

### Server (server/.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `PAYPAL_CLIENT_ID` | PayPal credentials | Optional |
| `PAYPAL_CLIENT_SECRET` | PayPal credentials | Optional |
| `MPESA_CONSUMER_KEY` | M-Pesa credentials | Optional |
| `MPESA_CONSUMER_SECRET` | M-Pesa credentials | Optional |
| `MPESA_SHORTCODE` | M-Pesa business number | Optional |
| `MPESA_PASSKEY` | M-Pesa Lipa Na M-Pesa passkey | Optional |
| `SHIPPING_FEE` | Delivery fee (KES) | Yes |

### Client (client/.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | Optional* |

\* Optional but required for map features in delivery tracking

## Troubleshooting

**Problem:** Changes to `.env` not taking effect

**Solution:** Restart the development server:
```bash
# Stop the server (Ctrl+C)
npm run dev
```

**Problem:** "API key not configured" error

**Solution:** 
1. Check `client/.env` exists and has correct key
2. Verify key doesn't have quotes: ✅ `VITE_GOOGLE_MAPS_API_KEY=abc123` ❌ `VITE_GOOGLE_MAPS_API_KEY="abc123"`
3. Restart dev server

**Problem:** Map not loading

**Solution:**
1. Verify APIs are enabled in Google Cloud Console
2. Check browser console for errors
3. Ensure API key has no restrictions preventing localhost access

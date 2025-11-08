# Google Maps Integration Guide

## Overview
The cafeteria app now includes Google Maps integration for real-time delivery tracking. The map shows:
- 🚴 Delivery person's live location (updates every 10 seconds)
- 📍 Customer's delivery address
- 🛣️ Optimal route between delivery person and destination
- 📞 Quick call buttons to contact delivery person/customer

## Setup Instructions

### Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Directions API**  
   - **Geocoding API**
4. Go to **Credentials** → Create Credentials → API Key
5. Copy your API key

### Step 2: Secure Your API Key (Recommended)

1. Click on your API key to edit it
2. Under **Application restrictions**, select:
   - **HTTP referrers (web sites)**
3. Add your domain:
   ```
   http://localhost:5176/*
   http://localhost:*/*
   https://yourproductiondomain.com/*
   ```
4. Under **API restrictions**, select:
   - **Restrict key**
5. Check these APIs:
   - Maps JavaScript API
   - Directions API
   - Geocoding API

### Step 3: Add API Key to Environment Variables

1. Navigate to the `client` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd client
   cp .env.example .env
   ```

3. Edit `client/.env` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**Important:** 
- Replace `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual API key
- Never commit `.env` file to Git (it's already in .gitignore)
- Keep your API key secret

### Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login as a user with delivery role

3. Navigate to Delivery Dashboard

4. Select an active delivery - the map should load automatically

## Features

### For Customers (Order Tracking Page)
- **Live Map**: See delivery person's real-time location
- **Route Visualization**: View the optimal route to your address
- **ETA Information**: Approximate delivery time
- **Call Button**: Direct call to delivery person

### For Delivery Personnel (Delivery Dashboard)
- **Navigation Map**: See your location and destination
- **Route Guidance**: Optimal path to customer
- **Call Customer**: Quick dial customer's phone
- **Open in Google Maps**: Launch native Google Maps app for turn-by-turn navigation

## Map Components

### DeliveryMap Component

**Location:** `client/src/components/DeliveryMap.jsx`

**Props:**
```javascript
<DeliveryMap 
  deliveryLocation={{
    latitude: number,
    longitude: number,
    timestamp: Date
  }}
  destinationAddress={{
    street: string,
    city: string,
    phone: string,
    instructions: string
  }}
/>
```

**Features:**
- Auto-centers on delivery person
- Custom markers with emojis (🚴 for delivery, 📍 for destination)
- Real-time location updates
- Automatic route calculation
- Responsive design

## Troubleshooting

### Map Not Loading?

**Error:** "Failed to load Google Maps. Please check your API key."

**Solutions:**
1. Verify API key is correctly copied
2. Check if Maps JavaScript API is enabled
3. Ensure API key restrictions allow your domain
4. Check browser console for specific errors

### Route Not Showing?

**Error:** "Directions request failed"

**Solutions:**
1. Enable Directions API in Google Cloud Console
2. Verify both delivery location and destination are valid
3. Check API key has Directions API permission

### Address Not Geocoding?

**Error:** "Geocoding failed"

**Solutions:**
1. Enable Geocoding API
2. Verify address format: "Street, City, Kenya"
3. Check if address exists in Google Maps

## Cost Considerations

### Google Maps Pricing (as of 2025)

Google provides **$200 free credit per month**, which covers:

**Maps JavaScript API:**
- $7 per 1,000 loads
- ~28,500 free map loads/month

**Directions API:**
- $5 per 1,000 requests  
- ~40,000 free requests/month

**Geocoding API:**
- $5 per 1,000 requests
- ~40,000 free requests/month

### Typical Usage for Small Cafeteria:
- 100 deliveries/day = 3,000/month
- 3,000 map loads = $21
- 3,000 direction requests = $15
- 100 geocoding requests = $0.50
- **Total: ~$36.50/month** (well within $200 free credit)

## Alternative: Free Fallback Mode

If you don't configure Google Maps, the app will show:
- ✅ Latitude/Longitude coordinates
- ✅ Address text
- ✅ Last update timestamp
- ✅ Call buttons still work
- ❌ No visual map
- ❌ No route visualization

## Production Deployment

### Environment Variables

✅ **Already Configured!** The app uses environment variables by default.

**For Production Hosting (Vercel, Netlify, etc.):**

1. Add environment variable in your hosting platform:
   - Variable name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key

2. The app will automatically use it (no code changes needed)

**Local Development:**
- API key is stored in `client/.env` (not committed to Git)
- Use `client/.env.example` as a template

### Security Best Practices

1. **Never commit API keys to Git**
2. **Use HTTP referrer restrictions** for web apps
3. **Enable only required APIs**
4. **Set up billing alerts** in Google Cloud
5. **Monitor usage** regularly
6. **Rotate keys** if exposed

## Support

### Useful Links
- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [Directions API Docs](https://developers.google.com/maps/documentation/directions)
- [Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)

### Common Kenya Addresses Format
```javascript
{
  street: "Kimathi Street",
  city: "Nairobi",
  phone: "+254712345678",
  instructions: "Near Hilton Hotel"
}
```

## Testing Without Real GPS

For development/testing, you can simulate GPS coordinates:

```javascript
// In DeliveryDashboard.jsx, replace GPS tracking with test coordinates
const testLocation = {
  latitude: -1.286389,  // Nairobi CBD
  longitude: 36.817223,
  timestamp: new Date(),
  accuracy: 10
}
```

---

**Status:** ✅ Google Maps integration ready
**Last Updated:** November 8, 2025
**Components Modified:**
- `client/src/components/DeliveryMap.jsx` (new)
- `client/src/components/DeliveryMap.css` (new)
- `client/src/pages/OrderTracking.jsx` (updated)
- `client/src/pages/DeliveryDashboard.jsx` (updated)

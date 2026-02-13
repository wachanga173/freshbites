# News API Setup Guide

## Overview
The News page now fetches real-time news articles using the **GNews API** (https://gnews.io/), a free news aggregation service.

## Features
- ✅ Real-time news fetching from multiple sources
- ✅ Category-based filtering (Food, Diet, Nutrition, Healthy Eating, Recipes)
- ✅ Smart content filtering to show only food/health-related articles
- ✅ Automatic fallback to mock data if API fails or limit exceeded
- ✅ Free tier: 100 requests per day

## Setup Instructions

### 1. Get Your Free API Key

1. Visit [https://gnews.io/register](https://gnews.io/register)
2. Sign up with your email address
3. Verify your email
4. Log in to your dashboard
5. Copy your API key

### 2. Add API Key to Environment Variables

#### For Development:
1. Navigate to the `client` folder
2. Create a `.env` file (if it doesn't exist)
3. Add the following line:
   ```
   VITE_GNEWS_API_KEY=your_api_key_here
   ```
4. Restart the development server

#### For Production (Vercel):
1. Go to your Vercel dashboard
2. Select your project
3. Navigate to Settings → Environment Variables
4. Add new variable:
   - **Name:** `VITE_GNEWS_API_KEY`
   - **Value:** Your GNews API key
   - **Environment:** Production, Preview, Development (select all)
5. Redeploy your application

## How It Works

### API Integration
The app fetches news articles based on the selected category:

| Category | Search Query |
|----------|-------------|
| Food | food OR restaurant OR culinary OR cuisine |
| Diet | diet OR weight loss OR dieting OR healthy diet |
| Nutrition | nutrition OR vitamins OR minerals OR nutrients |
| Healthy Eating | healthy eating OR organic food OR wellness food |
| Recipes | recipes OR cooking OR meal prep OR chef |

### Smart Filtering
After fetching articles, the app applies additional filtering to ensure relevance:
- Checks article title and description for food/health-related keywords
- Filters out unrelated content
- Keywords include: food, diet, nutrition, eating, meal, recipe, cook, health, restaurant, cuisine, culinary, ingredient, vitamin, protein, vegetable, fruit, organic, chef, dining

### Fallback System
If the API is unavailable or the daily limit is exceeded:
- Automatically switches to curated mock data
- Displays cached articles relevant to each category
- No interruption to user experience

## API Limits & Usage

### Free Tier Limits
- **100 requests per day**
- Rate limiting applies
- No credit card required

### Best Practices
1. **Cache results:** The app automatically caches articles to reduce API calls
2. **Monitor usage:** Check your GNews dashboard for request statistics
3. **Upgrade if needed:** If you exceed 100 requests/day, consider upgrading to a paid plan

### Upgrade Options
If you need more requests:
- **Starter Plan:** 1,000 requests/day
- **Plus Plan:** 10,000 requests/day
- **Pro Plan:** 100,000 requests/day

Visit [https://gnews.io/pricing](https://gnews.io/pricing) for pricing details.

## Troubleshooting

### Common Issues

**Problem:** News not loading
- **Solution:** Check if API key is correctly set in environment variables
- **Solution:** Verify you haven't exceeded the daily limit (check GNews dashboard)
- **Solution:** Check browser console for error messages

**Problem:** Articles not relevant
- **Solution:** The filtering algorithm needs articles to contain food/health keywords
- **Solution:** If API returns irrelevant articles, they're automatically filtered out
- **Solution:** Fallback mock data is always food-related

**Problem:** "Using cached articles" message
- **Solution:** This indicates the API call failed or limit was exceeded
- **Solution:** Mock data is being displayed instead
- **Solution:** Reset occurs at midnight UTC

## Alternative APIs

If you prefer different news sources:

### 1. NewsAPI.org
- Free tier: 100 requests/day
- More sources but requires credit card
- URL: https://newsapi.org/

### 2. The Guardian API
- Free and unlimited
- Limited to Guardian content only
- URL: https://open-platform.theguardian.com/

### 3. Currents API
- Free tier: 600 requests/day
- Good coverage
- URL: https://currentsapi.services/

### 4. NewsData.io
- Free tier: 200 requests/day
- Multiple languages
- URL: https://newsdata.io/

## Implementation Details

### Code Location
- **Component:** `client/src/pages/News.jsx`
- **Environment Config:** `client/.env`
- **Example Config:** `client/.env.example`

### Key Functions
```javascript
fetchNews() // Fetches news from GNews API with fallback
getMockArticles() // Provides fallback data
```

### Dependencies
- Native Fetch API (no additional packages needed)
- Environment variables via Vite (`import.meta.env`)

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to Git
- API keys in environment variables are safe for client-side use
- GNews API keys are meant for client-side JavaScript
- Keys are automatically exposed in production builds (normal for client-side APIs)
- Rate limiting prevents abuse even if key is exposed

## Support

For API-related issues:
- GNews Documentation: https://gnews.io/docs/
- GNews Support: support@gnews.io

For app-related issues:
- Check the browser console for errors
- Verify environment variables are set correctly
- Test with the fallback mock data first

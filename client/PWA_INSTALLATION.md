# PWA Installation Guide - Fresh Bites Café

## Progressive Web App Features

Fresh Bites Café is now a fully functional Progressive Web App (PWA) that can be installed on any device!

### ✨ Features

- 📱 **Install on Any Device**: Works on iOS, Android, Desktop (Windows, Mac, Linux)
- 🚀 **Fast & Reliable**: Cached resources for quick loading
- 📴 **Offline Support**: Basic functionality available offline
- 🔔 **Push Notifications**: Get order updates (coming soon)
- 🎨 **Native App Feel**: Runs in standalone mode without browser UI
- 💾 **Local Storage**: Saves your preferences and cart

### 📲 Installation Instructions

#### iOS (iPhone/iPad)
1. Open the website in **Safari**
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**
5. The app icon will appear on your home screen

#### Android
**Method 1: Install Button (Recommended)**
- Click the **"Install PWA"** button in the footer
- Follow the on-screen prompts

**Method 2: Download APK**
- Click the **"Download APK"** button in the footer
- Install the APK file on your Android device

**Method 3: Browser Menu**
- Open Chrome/Edge browser
- Tap the menu (⋮)
- Select **"Install app"** or **"Add to Home screen"**

#### Desktop (Chrome, Edge, Brave)
1. Visit the website
2. Look for the **install icon** (⊕) in the address bar
3. Click it and select **"Install"**
4. Or use the **"Install PWA"** button in the footer

#### Desktop (Safari on macOS)
1. Open the website in Safari
2. Click **File** → **Add to Dock**
3. The app will appear in your Dock

### 🔧 Technical Details

- **Service Worker**: Handles offline functionality and caching
- **Web App Manifest**: Defines app metadata and behavior
- **Cache Strategy**: Network-first with cache fallback
- **Offline Page**: Custom offline experience
- **Icons**: Adaptive icons for all platforms

### 🌟 Benefits of Installing

1. **Faster Loading**: Cached resources load instantly
2. **Easy Access**: Launch from home screen/desktop
3. **Full Screen**: No browser UI distractions
4. **Notifications**: Receive order updates directly
5. **Offline Access**: View menu and previous orders offline
6. **Less Data Usage**: Cached content reduces data consumption

### 🔐 Permissions

The PWA may request:
- **Location**: For delivery address and GPS tracking
- **Notifications**: For order status updates
- **Storage**: To cache data and save preferences

### 🆘 Troubleshooting

**Install button not showing:**
- Make sure you're using a supported browser
- Check that you're on HTTPS (required for PWA)
- Clear browser cache and try again

**App not working offline:**
- Visit the site at least once while online
- Check if service worker is registered
- Update to the latest version

**iOS installation issues:**
- Must use Safari browser (not Chrome/Firefox on iOS)
- Ensure iOS 11.3 or later
- Check Safari settings allow website data

### 📱 Supported Platforms

| Platform | Install Method | Support Level |
|----------|---------------|---------------|
| iOS 11.3+ | Add to Home Screen | ✅ Full |
| Android 5+ | PWA/APK | ✅ Full |
| Windows 10+ | Edge/Chrome | ✅ Full |
| macOS | Safari/Chrome | ✅ Full |
| Linux | Chrome/Firefox | ✅ Full |

### 🔄 Updates

The PWA automatically checks for updates. When a new version is available:
1. The service worker downloads it in the background
2. You'll get a notification to refresh
3. Close and reopen the app to apply updates

### 🔗 Links

- **Website**: https://cafeteria-eta-khaki.vercel.app/
- **APK Download**: https://median.co/share/abbwkel#apk
- **Support**: Contact through the app's contact page

---

**Note**: For the best experience, we recommend installing the PWA on your device. It provides faster loading, offline access, and a native app-like experience!

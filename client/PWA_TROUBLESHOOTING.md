# PWA Install Prompt Troubleshooting Guide

## Why You're Not Seeing the Install Prompt

### Check These First:

1. **Open Browser DevTools Console**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Look for these messages:
     - ✅ `SW registered:` - Service Worker is working
     - ✅ `beforeinstallprompt event fired!` - Install prompt is available
     - ℹ️ `App not installed yet. Waiting for beforeinstallprompt event...` - Normal state
     - ℹ️ `App is already installed` - Already installed!

2. **Requirements for Install Prompt**
   - ✅ **HTTPS** - Must be on HTTPS (or localhost)
   - ✅ **Manifest** - Valid manifest.json file
   - ✅ **Service Worker** - Registered and active
   - ✅ **Not Already Installed** - App isn't already installed
   - ✅ **Engagement** - User visited at least once (some browsers)

### Common Issues & Solutions:

#### Issue 1: App Already Installed
**Symptoms:** No install prompt appears
**Solution:** 
- Check if app is already on your home screen/desktop
- Uninstall the app first:
  - **Desktop:** Look for app in Chrome Apps (chrome://apps)
  - **Mobile:** Long press app icon → Remove/Uninstall

#### Issue 2: Not on HTTPS
**Symptoms:** Service worker registration fails
**Solution:**
- PWA requires HTTPS in production
- Development: Use `localhost` or `127.0.0.1`
- Production: Ensure your site has valid SSL certificate

#### Issue 3: Browser Doesn't Support PWA
**Symptoms:** No console messages about beforeinstallprompt
**Browsers that support PWA install:**
- ✅ Chrome 40+ (Desktop & Android)
- ✅ Edge 79+
- ✅ Samsung Internet 4+
- ✅ Safari 11.3+ (iOS, limited)
- ❌ Firefox (use Add to Home Screen instead)
- ❌ Internet Explorer

#### Issue 4: Service Worker Not Registered
**Check in DevTools:**
1. Open DevTools → Application tab
2. Click "Service Workers" in sidebar
3. Should see `/sw.js` registered

**If not registered:**
- Check console for errors
- Make sure `sw.js` file exists in `/public` folder
- Clear browser cache and reload

#### Issue 5: Manifest Issues
**Check in DevTools:**
1. Open DevTools → Application tab
2. Click "Manifest" in sidebar
3. Look for errors or warnings

**Common manifest issues:**
- Missing required fields (name, short_name, start_url, display, icons)
- Invalid icon sizes or formats
- Icons not loading (check file paths)

### Testing PWA Installation:

#### Desktop (Chrome/Edge):
1. **Method 1:** Look for ⊕ icon in address bar (right side)
2. **Method 2:** Menu (⋮) → "Install Fresh Bites Café..."
3. **Method 3:** Click "Install App Now" button in footer

#### Android:
1. **Method 1:** Click "Install App Now" button in footer
2. **Method 2:** Menu (⋮) → "Install app" or "Add to Home screen"
3. **Method 3:** Download APK from footer link

#### iOS (Safari Only):
1. Tap Share button (↑) at bottom
2. Scroll and tap "Add to Home Screen"
3. Tap "Add"

**Note:** iOS doesn't support beforeinstallprompt, so "Install App Now" button won't appear

### Force the Install Prompt (Testing):

#### Method 1: Uninstall and Revisit
1. Uninstall existing app
2. Clear site data: DevTools → Application → Clear storage
3. Close and reopen browser
4. Visit site again

#### Method 2: Use DevTools
1. Open DevTools → Application tab
2. Click "Manifest" in sidebar  
3. Click "Update on reload"
4. Reload page

#### Method 3: Manual Trigger (Testing)
Open console and run:
```javascript
// Check if prompt is available
console.log('Deferred prompt:', window.deferredPrompt);

// Manually trigger (if available)
if (window.deferredPrompt) {
  window.deferredPrompt.prompt();
}
```

### Verifying PWA is Working:

1. **Check Lighthouse Score**
   - DevTools → Lighthouse tab
   - Run audit for "Progressive Web App"
   - Should score 90+ for full PWA support

2. **Check Service Worker**
   - DevTools → Application → Service Workers
   - Should show "activated and is running"

3. **Check Manifest**
   - DevTools → Application → Manifest
   - Should show all app details

4. **Check Install Criteria**
   - DevTools → Console
   - Look for PWA-related messages
   - No errors about manifest or service worker

### Production Deployment Checklist:

- [ ] Site served over HTTPS
- [ ] Service worker registered successfully
- [ ] Manifest.json accessible at /manifest.json
- [ ] All manifest icons load correctly (test each URL)
- [ ] start_url is correct and loads
- [ ] No console errors
- [ ] Tested on multiple browsers
- [ ] Tested on mobile and desktop

### Still Not Working?

1. **Clear Everything:**
   ```
   DevTools → Application → Clear storage → "Clear site data"
   ```

2. **Hard Refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Check Browser Version:**
   - Chrome/Edge should be latest version
   - Some features need Chrome 90+

4. **Try Incognito/Private Mode:**
   - Rules out extension interference
   - Fresh slate for testing

5. **Check Network:**
   - DevTools → Network tab
   - Make sure `/manifest.json` loads (200 status)
   - Make sure `/sw.js` loads (200 status)
   - Check icons load correctly

### Debugging Commands:

Run these in browser console:

```javascript
// Check if service worker is supported
console.log('SW supported:', 'serviceWorker' in navigator);

// Check if installed
console.log('Standalone mode:', window.matchMedia('(display-mode: standalone)').matches);

// Check if prompt available
console.log('Install prompt:', window.deferredPrompt);

// Get service worker registration
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW registration:', reg);
});

// Check manifest
fetch('/manifest.json')
  .then(r => r.json())
  .then(m => console.log('Manifest:', m));
```

### Expected Behavior:

1. **First Visit (New User):**
   - Service worker registers
   - After a few seconds/interactions, `beforeinstallprompt` fires
   - "Install App Now" button appears in footer
   - User can click to install

2. **Already Installed:**
   - No install button shows
   - App opens in standalone mode (no browser UI)
   - Service worker serves cached content

3. **iOS Safari:**
   - No automatic install button
   - User must use Share → "Add to Home Screen"
   - Limited PWA features compared to Android/Desktop

### Need More Help?

Check the browser console messages we've added:
- ✅ Success messages (green checkmarks)
- ℹ️ Info messages (blue info icons)
- ❌ Error messages (red X marks)

All messages are prefixed with emojis to make them easy to spot!

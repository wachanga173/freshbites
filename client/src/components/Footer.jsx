import { useState, useEffect } from 'react'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    /* eslint-disable no-console */
    const handler = (e) => {
      console.log('✅ beforeinstallprompt event fired!', e)
      e.preventDefault()
      setDeferredPrompt(e)
      window.deferredPrompt = e
      setShowInstallButton(true)
    }

    const installedHandler = () => {
      console.log('✅ App installed successfully!')
      setShowInstallButton(false)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isStandalone) {
      console.log('ℹ️ App is already installed')
      setShowInstallButton(false)
    } else {
      console.log('ℹ️ App not installed yet. Waiting for beforeinstallprompt event...')
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          console.log('✅ Service Worker is registered:', reg)
        } else {
          console.log('❌ Service Worker not registered yet')
        }
      })
    }
    /* eslint-enable no-console */

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleSubscribe = (e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      if (isIOS) {
        alert('To install on iOS:\n\n1. Tap the Share button (↑)\n2. Scroll and tap "Add to Home Screen"\n3. Tap "Add"')
      } else {
        alert('To install:\n\n• Desktop: Look for the install icon (⊕) in your address bar\n• Mobile: Use your browser menu and select "Install app"')
      }
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowInstallButton(false)
    }
    
    setDeferredPrompt(null)
    window.deferredPrompt = null
  }

  const handleCollaboration = () => {
    const p1 = String.fromCharCode(48,55,52,50,52,56,49,55,49,55)
    window.location.href = `tel:${p1}`
  }

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        {/* Main Footer Grid */}
        <div className="footer-grid">
          {/* Company Info - Takes 2 columns on larger screens */}
          <div className="footer-column footer-brand">
            <h3 className="footer-heading">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="brand-icon">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Fresh Bites Café
            </h3>
            <p className="footer-description">
              Delicious meals, delivered fresh to your door. Experience quality food with exceptional service, powered by real-time GPS tracking and secure payments.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }}>Home</a></li>
              <li><a href="/menu" onClick={(e) => { e.preventDefault(); window.location.href = '/menu' }}>Menu</a></li>
              <li><a href="/my-orders" onClick={(e) => { e.preventDefault(); window.location.href = '/my-orders' }}>My Orders</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); window.location.href = '/about' }}>About Us</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact' }}>Contact Us</a></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div className="footer-column">
            <h4 className="footer-title">Legal & Support</h4>
            <ul className="footer-links">
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); window.location.href = '/terms' }}>Terms & Conditions</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); window.location.href = '/privacy' }}>Privacy Policy</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact' }}>Help Center</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact' }}>FAQs</a></li>
            </ul>
          </div>

          {/* Download App */}
          <div className="footer-column">
            <h4 className="footer-title">Get Our App</h4>
            <p className="download-description">Install for a faster, better experience</p>
            <div className="download-buttons">
              {showInstallButton && (
                <button 
                  className="download-btn install-btn"
                  onClick={handleInstallClick}
                  aria-label="Install Progressive Web App"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="download-icon">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                  </svg>
                  <div className="download-text">
                    <small>Quick Install</small>
                    <strong>Install App Now</strong>
                  </div>
                </button>
              )}
              <a href="https://median.co/share/abbwkel#apk" target="_blank" rel="noopener noreferrer" className="download-btn android-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="download-icon">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 10.7 3.6 12.76 3.4 15h17.2c-.2-2.24-1.4-4.3-3-5.52zM10 13H8v-2h2v2zm6 0h-2v-2h2v2zm5.4 2H2.6c.2 2.24 1.4 4.3 3 5.52l-1.84 3.18c-.16.31-.04.69.26.85.08.04.16.06.24.06.21 0 .41-.11.53-.28l1.88-3.24a11.43 11.43 0 008.94 0l1.88 3.24c.12.17.32.28.53.28.08 0 .16-.02.24-.06.3-.16.42-.54.26-.85l-1.84-3.18c1.6-1.22 2.8-3.28 3-5.52z"/>
                </svg>
                <div className="download-text">
                  <small>Android APK</small>
                  <strong>Download APK</strong>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="developer-section">
          <div className="developer-content">
            <div className="developer-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
            </div>
            <div className="developer-text">
              <h4 className="developer-title">Evolutionary Platform for Developers</h4>
              <p className="developer-description">
                Built to scale and evolve. We welcome developers and innovators who want to collaborate 
                in expanding our capabilities and reach. Join us in building the future of food delivery.
              </p>
            </div>
            <button 
              className="developer-btn"
              onClick={handleCollaboration}
              aria-label="Contact for Developer Collaboration"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Collaborate With Us
            </button>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-content">
            <div className="newsletter-info">
              <h4 className="newsletter-title">Stay in the Loop</h4>
              <p className="newsletter-description">
                Subscribe to get special offers, exclusive deals, and the latest updates delivered to your inbox.
              </p>
            </div>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="newsletter-btn">
                <span>Subscribe</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright-section">
              <p className="copyright">
                © {new Date().getFullYear()} Fresh Bites Café. All rights reserved.
              </p>
              <p className="license-info">
                Open Source | MIT License | Made with <span className="heart">♥</span> for the community
              </p>
            </div>
            <div className="payment-section">
              <span className="payment-label">Secure Payments</span>
              <div className="payment-methods">
                <div className="payment-icon" title="M-Pesa">
                  <svg width="45" height="28" viewBox="0 0 45 28" fill="none">
                    <rect width="45" height="28" rx="4" fill="#00A950"/>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">M-PESA</text>
                  </svg>
                </div>
                <div className="payment-icon" title="PayPal">
                  <svg width="45" height="28" viewBox="0 0 45 28" fill="none">
                    <rect width="45" height="28" rx="4" fill="#003087"/>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">PayPal</text>
                  </svg>
                </div>
                <div className="payment-icon" title="Visa">
                  <svg width="45" height="28" viewBox="0 0 45 28" fill="none">
                    <rect width="45" height="28" rx="4" fill="#1A1F71"/>
                    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">VISA</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

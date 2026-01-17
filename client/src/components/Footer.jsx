import { useState } from 'react'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  const handleCollaboration = () => {
    const p1 = String.fromCharCode(48,55,52,50,52,56,49,55,49,55)
    window.location.href = `tel:${p1}`
  }

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-column">
            <h3 className="footer-heading">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Fresh Bites Café
            </h3>
            <p className="footer-description">
              Delicious meals, delivered fresh to your door. Experience quality food with exceptional service.
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
              <li><a href="/my-orders" onClick={(e) => { e.preventDefault(); window.location.href = '/my-orders' }}>My Orders</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); window.location.href = '/about' }}>About Us</a></li>
              <li><a href="/contact" onClick={(e) => { e.preventDefault(); window.location.href = '/contact' }}>Contact Us</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-column">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); window.location.href = '/terms' }}>Terms & Conditions</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); window.location.href = '/privacy' }}>Privacy Policy</a></li>
            </ul>
          </div>

          {/* Download App */}
          <div className="footer-column">
            <h4 className="footer-title">Get Our App</h4>
            <p className="download-description">Download our app for a better experience</p>
            <div className="download-buttons">
              <a href="https://median.co/share/abbwkel#apk" target="_blank" rel="noopener noreferrer" className="download-btn android-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="download-icon">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 10.7 3.6 12.76 3.4 15h17.2c-.2-2.24-1.4-4.3-3-5.52zM10 13H8v-2h2v2zm6 0h-2v-2h2v2zm5.4 2H2.6c.2 2.24 1.4 4.3 3 5.52l-1.84 3.18c-.16.31-.04.69.26.85.08.04.16.06.24.06.21 0 .41-.11.53-.28l1.88-3.24a11.43 11.43 0 008.94 0l1.88 3.24c.12.17.32.28.53.28.08 0 .16-.02.24-.06.3-.16.42-.54.26-.85l-1.84-3.18c1.6-1.22 2.8-3.28 3-5.52z"/>
                </svg>
                <div className="download-text">
                  <small>Download APK</small>
                  <strong>Android</strong>
                </div>
              </a>
              <button 
                className="download-btn ios-btn"
                onClick={() => {
                  if (window.deferredPrompt) {
                    window.deferredPrompt.prompt()
                  } else {
                    alert('To install:\n\niOS: Tap Share button, then "Add to Home Screen"\n\nDesktop: Look for install icon in address bar\n\nAndroid: Use menu → "Install app" or download APK above')
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="download-icon">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="download-text">
                  <small>Install PWA</small>
                  <strong>iOS / Desktop</strong>
                </div>
              </button>
            </div>
          </div>

          {/* Newsletter */}
          <div className="footer-column newsletter-column">
            <h4 className="footer-title">Stay Updated</h4>
            <p className="newsletter-description">Subscribe to our newsletter for offers and updates</p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-btn">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Evolutionary Statement */}
        <div className="evolutionary-section">
          <div className="evolutionary-content">
            <h4 className="evolutionary-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
              Evolutionary Platform
            </h4>
            <p className="evolutionary-text">
              This platform is built to scale and evolve. We welcome developers and innovators 
              who want to collaborate in expanding our capabilities and reach.
            </p>
            <button 
              className="developer-contact-btn"
              onClick={handleCollaboration}
              aria-label="Contact for Developer Collaboration"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Contact for Collaboration
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="copyright-section">
            <p className="copyright">
              © {new Date().getFullYear()} Fresh Bites Café. All rights reserved.
            </p>
            <p className="license-info">
              Licensed under MIT License | Made with <span className="heart">♥</span> for the community
            </p>
          </div>
          <div className="payment-methods">
            <span className="payment-text">We accept:</span>
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" className="payment-icon" title="M-Pesa">
              <rect width="40" height="25" rx="3" fill="#00A950"/>
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">M-PESA</text>
            </svg>
            <svg width="40" height="25" viewBox="0 0 40 25" fill="none" className="payment-icon" title="PayPal">
              <rect width="40" height="25" rx="3" fill="#003087"/>
              <path d="M15 10h2c1.5 0 2 1 2 2s-.5 2-2 2h-2v-4zm10 0h2c1.5 0 2 1 2 2s-.5 2-2 2h-2v-4z" fill="#009CDE"/>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}

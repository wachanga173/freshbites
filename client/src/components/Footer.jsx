import { useState } from 'react'
import './Footer.css'

export default function Footer() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    alert('Thank you for subscribing!')
    setEmail('')
  }

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* About Section */}
          <div className="footer-column">
            <h3 className="footer-heading">🍴 Fresh Bites Café</h3>
            <p className="footer-description">
              Delicious meals, delivered fresh to your door. Experience quality food with exceptional service.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon" aria-label="Facebook">📘</a>
              <a href="#" className="social-icon" aria-label="Twitter">🐦</a>
              <a href="#" className="social-icon" aria-label="Instagram">📷</a>
              <a href="#" className="social-icon" aria-label="LinkedIn">💼</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/' }}>Home</a></li>
              <li><a href="/my-orders" onClick={(e) => { e.preventDefault(); window.location.href = '/my-orders' }}>My Orders</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="/about" onClick={(e) => { e.preventDefault(); window.location.href = '/about' }}>About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-column">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="/terms" onClick={(e) => { e.preventDefault(); window.location.href = '/terms' }}>Terms & Conditions</a></li>
              <li><a href="/privacy" onClick={(e) => { e.preventDefault(); window.location.href = '/privacy' }}>Privacy Policy</a></li>
              <li><a href="#refund">Refund Policy</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Download App */}
          <div className="footer-column">
            <h4 className="footer-title">Get Our App</h4>
            <p className="download-description">Download our app for a better experience</p>
            <div className="download-buttons">
              <a href="https://median.co/share/abbwkel#apk" target="_blank" rel="noopener noreferrer" className="download-btn android-btn">
                <span className="download-icon">📱</span>
                <div className="download-text">
                  <small>Download for</small>
                  <strong>Android</strong>
                </div>
              </a>
              <a href="https://median.co/share/abbwkel" target="_blank" rel="noopener noreferrer" className="download-btn ios-btn">
                <span className="download-icon">🍎</span>
                <div className="download-text">
                  <small>Available on</small>
                  <strong>iOS / PWA</strong>
                </div>
              </a>
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

        {/* Contact Info */}
        <div className="footer-contact">
          <div className="contact-item">
            <span className="contact-icon">📍</span>
            <div className="contact-details">
              <span>[Your Address Here]</span>
              <small className="placeholder-note">Placeholder - Update with actual location</small>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <div className="contact-details">
              <span>[Your Phone Number]</span>
              <small className="placeholder-note">Placeholder - Update with actual phone</small>
            </div>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <div className="contact-details">
              <span>[Your Email Address]</span>
              <small className="placeholder-note">Placeholder - Update with actual email</small>
            </div>
          </div>
        </div>

        {/* Evolutionary Statement */}
        <div className="evolutionary-section">
          <div className="evolutionary-content">
            <h4 className="evolutionary-title">🚀 Evolutionary Platform</h4>
            <p className="evolutionary-text">
              This platform is built to scale and evolve. We welcome developers and innovators 
              who want to collaborate in expanding our capabilities and reach.
            </p>
            <button 
              className="developer-contact-btn"
              onClick={() => {
                // Encrypted phone: &#x30;&#x37;&#x34;&#x32;&#x34;&#x38;&#x31;&#x37;&#x31;&#x37;
                const p1 = String.fromCharCode(48,55,52,50,52,56,49,55,49,55)
                window.location.href = `tel:${p1}`
              }}
              aria-label="Contact for Developer Collaboration"
            >
              📞 Contact for Collaboration
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
              Licensed under MIT License | Made with ❤️ for the community
            </p>
          </div>
          <div className="payment-methods">
            <span className="payment-text">We accept:</span>
            <span className="payment-icon" title="M-Pesa">📱</span>
            <span className="payment-icon" title="PayPal">💳</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import './CookieConsent.css'

const COOKIE_CONSENT_KEY = 'freshbites-cookie-consent'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a cookie choice
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      if (!consent) {
        // Show after 1 second for a smooth initial page entrance
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 1000)
        return () => clearTimeout(timer)
      }
    } catch (err) {
      // If localStorage is unavailable, do nothing
    }
  }, [])

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'all')
    } catch (e) {
      // ignore
    }
    setIsVisible(false)
  }

  const handleAcceptEssential = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'essential')
    } catch (e) {
      // ignore
    }
    setIsVisible(false)
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'essential')
    } catch (e) {
      // ignore
    }
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner-wrapper" role="region" aria-label="Cookie consent">
      <div className="cookie-banner-card">
        <div className="cookie-header">
          <div className="cookie-icon-wrap">
            <Cookie size={22} />
          </div>
          <div className="cookie-title-wrap">
            <h3 className="cookie-title">We Value Your Privacy</h3>
            <p className="cookie-subtitle">Fresh Bites Café Cookies & Data Notice</p>
          </div>
          <button 
            className="cookie-close-btn" 
            onClick={handleDismiss}
            aria-label="Dismiss cookie notice"
          >
            <X size={18} />
          </button>
        </div>

        <p className="cookie-body-text">
          We use cookies to secure your sign-in, save your cart, and enhance your café ordering experience. Learn more in our{' '}
          <a 
            href="/cookies" 
            className="cookie-policy-link"
            onClick={(e) => {
              e.preventDefault()
              window.location.href = '/cookies'
            }}
          >
            Cookie Policy
          </a>.
        </p>

        <div className="cookie-actions">
          <button 
            type="button"
            className="cookie-btn-primary"
            onClick={handleAcceptAll}
          >
            Accept All
          </button>
          <button 
            type="button"
            className="cookie-btn-secondary"
            onClick={handleAcceptEssential}
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import './PWAInstallPrompt.css'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    setIsStandalone(standalone)

    // If already installed, don't show prompt
    if (standalone) {
      return
    }

    // Listen for beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      window.deferredPrompt = e
      
      // Show prompt after 30 seconds if user hasn't dismissed it
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowInstallPrompt(true)
        }
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (iOS && !dismissed && !standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 30000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show iOS instructions
      if (isIOS) {
        return
      }
      alert('Installation not available. Use your browser menu to install.')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      // User accepted the install prompt
    }
    
    setDeferredPrompt(null)
    window.deferredPrompt = null
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleRemindLater = () => {
    setShowInstallPrompt(false)
    // Clear after 24 hours
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed')
    }, 24 * 60 * 60 * 1000)
  }

  if (!showInstallPrompt || isStandalone) {
    return null
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-prompt-content">
        <button className="pwa-close-btn" onClick={handleDismiss} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="pwa-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>

        <div className="pwa-text">
          <h3 className="pwa-title">Install Fresh Bites Café</h3>
          <p className="pwa-description">
            Get quick access and enhanced features by installing our app!
          </p>
        </div>

        {isIOS ? (
          <div className="pwa-ios-instructions">
            <p className="ios-instruction-text">
              To install on iOS:
            </p>
            <ol className="ios-steps">
              <li>Tap the <strong>Share</strong> button 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', margin: '0 4px', verticalAlign: 'middle' }}>
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </li>
              <li>Select <strong>&ldquo;Add to Home Screen&rdquo;</strong></li>
              <li>Tap <strong>&ldquo;Add&rdquo;</strong></li>
            </ol>
            <div className="pwa-actions">
              <button className="pwa-btn pwa-btn-secondary" onClick={handleDismiss}>
                Got it
              </button>
            </div>
          </div>
        ) : (
          <div className="pwa-actions">
            <button className="pwa-btn pwa-btn-primary" onClick={handleInstall}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Install Now
            </button>
            <button className="pwa-btn pwa-btn-secondary" onClick={handleRemindLater}>
              Remind me later
            </button>
            <button className="pwa-btn pwa-btn-text" onClick={handleDismiss}>
              No thanks
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import './Contact.css'

export default function Contact() {
  const handleCall = () => {
    const phone = String.fromCharCode(48,55,52,50,52,56,49,55,49,55)
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="contact-page">
      <button 
        className="back-button"
        onClick={() => window.history.back()}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with Fresh Bites Café</p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Email Us</h3>
            <p>Send us an email anytime</p>
            <a href="mailto:info@freshbitescafe.com" className="contact-link">
              info@freshbitescafe.com
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Call Us</h3>
            <p>Available 24/7 for your queries</p>
            <button onClick={handleCall} className="contact-link call-button">
              Call Now
            </button>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Visit Us</h3>
            <p>Kenya</p>
            <p className="address-detail">Open daily: 8:00 AM - 10:00 PM</p>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 17V15H13V17H11ZM13 13H11V7H13V13Z" fill="currentColor"/>
              </svg>
            </div>
            <h3>Support</h3>
            <p>Need help with your order?</p>
            <a href="/my-orders" className="contact-link">
              Track Your Order
            </a>
          </div>
        </div>

        <div className="collaboration-section">
          <h2>Developer Collaboration</h2>
          <p>
            Fresh Bites Café is an evolutionary platform built for scalability. 
            We welcome developers and innovators who want to collaborate in expanding our capabilities.
          </p>
          <button onClick={handleCall} className="collaborate-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Contact for Collaboration
          </button>
        </div>
      </div>
    </div>
  )
}

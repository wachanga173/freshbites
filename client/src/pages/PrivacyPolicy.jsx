import './LegalPages.css'

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-link" onClick={() => window.history.back()}>← Back</button>
        
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last Updated: January 17, 2026</p>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              At Fresh Bites Café, we are committed to protecting your privacy. This Privacy Policy explains how 
              we collect, use, disclose, and safeguard your information when you use our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Information We Collect</h2>
            <h3>Personal Information</h3>
            <p>We may collect personal information that you provide to us, including:</p>
            <ul>
              <li>Name and contact information (email, phone number)</li>
              <li>Delivery address</li>
              <li>Payment information</li>
              <li>Account credentials</li>
              <li>Order history and preferences</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Device information (IP address, browser type, device type)</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support</li>
              <li>Improve our services and user experience</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Prevent fraud and enhance security</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and trends</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operations (payment processors, delivery services)</li>
              <li><strong>Business Partners:</strong> Companies we partner with to provide services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </section>

          <section className="legal-section">
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data</li>
              <li>Secure Socket Layer (SSL) technology</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your Privacy Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Object:</strong> Object to processing of your personal information</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Authenticate users and prevent fraud</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
            <p>
              You can control cookies through your browser settings, but disabling cookies may affect 
              functionality of our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy 
              practices or content of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for children under 18. We do not knowingly collect personal
              information from children. If you believe we have collected information from a child, please
              contact us immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in 
              this Privacy Policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes
              by posting the new policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <ul className="contact-info">
              <li>📧 Email: privacy@freshbitescafe.com</li>
              <li>📞 Phone: +254 712 345 678</li>
              <li>📍 Address: 123 Main Street, Nairobi, Kenya</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

import './LegalPages.css'

export default function TermsAndConditions() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-link" onClick={() => window.history.back()}>← Back</button>
        
        <h1 className="legal-title">Terms & Conditions</h1>
        <p className="legal-updated">Last Updated: January 17, 2026</p>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Fresh Bites Café. These Terms and Conditions govern your use of our website and services. 
              By accessing or using our services, you agree to be bound by these terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Use of Services</h2>
            <p>
              You must be at least 18 years old to use our services. By using our platform, you represent and 
              warrant that you have the legal capacity to enter into these Terms.
            </p>
            <ul>
              <li>You agree to provide accurate and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to use the service for any illegal or unauthorized purpose</li>
              <li>You must not transmit any harmful code or interfere with the service</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Orders and Payments</h2>
            <p>
              All orders are subject to availability and acceptance. We reserve the right to refuse any order 
              for any reason.
            </p>
            <ul>
              <li>Prices are subject to change without notice</li>
              <li>Payment must be made at the time of order</li>
              <li>We accept M-Pesa and other payment methods as indicated</li>
              <li>All prices are in Kenyan Shillings (KSH)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Delivery</h2>
            <p>
              We strive to deliver orders within the estimated time frame, but delivery times are approximate 
              and not guaranteed.
            </p>
            <ul>
              <li>Delivery fees vary based on location</li>
              <li>You must provide accurate delivery information</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>We are not responsible for delays beyond our control</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. Cancellations and Refunds</h2>
            <p>
              Orders may be cancelled within 5 minutes of placement for a full refund. After this period, 
              cancellations may be subject to a fee.
            </p>
            <ul>
              <li>Refunds are processed within 5-7 business days</li>
              <li>Quality complaints must be reported within 24 hours</li>
              <li>Refunds are issued to the original payment method</li>
              <li>We reserve the right to refuse refunds for invalid claims</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or content</li>
              <li>Harass, abuse, or harm others</li>
              <li>Impersonate any person or entity</li>
              <li>Collect user data without consent</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Intellectual Property</h2>
            <p>
              All content on this platform, including text, graphics, logos, and software, is the property of 
              Fresh Bites Café and protected by copyright and trademark laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Fresh Bites Café shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages arising out of your use of our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold Fresh Bites Café harmless from any claims, losses, damages, 
              liabilities, and expenses arising from your use of our services or violation of these Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Modifications to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately 
              upon posting. Your continued use of the service constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Kenya, without 
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="contact-info">
              <li>📧 Email: legal@freshbitescafe.com</li>
              <li>📞 Phone: +254 712 345 678</li>
              <li>📍 Address: 123 Main Street, Nairobi, Kenya</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}

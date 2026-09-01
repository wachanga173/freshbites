import { Mail, Phone, MapPin, Cookie, Shield, CheckCircle2 } from 'lucide-react'
import './LegalPages.css'

export default function CookiePolicy() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <button className="back-link" onClick={() => window.history.back()}>← Back</button>
        
        <h1 className="legal-title flex items-center gap-3">
          <Cookie size={36} className="text-amber-600 inline-block" /> Cookie Policy
        </h1>
        <p className="legal-updated">Last Updated: September 2, 2026</p>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website or use our web application. They help us remember your preferences, keep you securely signed in, maintain your shopping cart, and ensure optimal site performance.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Types of Cookies We Use</h2>
            <p>Fresh Bites Café uses the following categories of cookies and local storage items:</p>
            
            <div className="space-y-4 my-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <Shield size={18} className="text-green-600" /> Strictly Necessary / Essential Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  These cookies are vital for the cafeteria platform to function properly. They allow you to log in securely, navigate between role dashboards, maintain items in your shopping cart, and complete checkout.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={18} className="text-blue-600" /> Functional & Preference Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  These cookies remember your preferences such as your active role dashboard, food filter categories, dark/light theme choices, and delivery location pins.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={18} className="text-amber-600" /> Security & 2FA Tokens
                </h3>
                <p className="text-sm text-gray-600">
                  Used in conjunction with Two-Factor Authentication (TOTP and Email OTP) to verify authentication state and protect customer and admin accounts from unauthorized access.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 size={18} className="text-purple-600" /> Analytics & Performance Cookies
                </h3>
                <p className="text-sm text-gray-600">
                  These help us understand which food items, articles, and pages are most popular, enabling us to continuously improve our menu and speed up page load times.
                </p>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>3. Third-Party Integrations</h2>
            <p>We work with trusted third-party service providers that may also set cookies or access local storage:</p>
            <ul>
              <li><strong>PayPal & Payment Gateways:</strong> To securely process payments and detect fraudulent transactions.</li>
              <li><strong>OpenStreetMap & Leaflet:</strong> To render live delivery tracking maps and calculate route coordinates.</li>
              <li><strong>Email Delivery Services:</strong> To transmit receipts, 2FA security codes, and marketing newsletters.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. How You Can Manage Cookies</h2>
            <p>
              You have the right to decide whether to accept or decline non-essential cookies. You can manage your preferences through our interactive Cookie Consent banner on the website, or by configuring your web browser settings.
            </p>
            <p>
              Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. Note that disabling essential cookies may impact the availability of features such as shopping cart persistence and user login.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our technological practices or legal obligations. We encourage you to review this page periodically.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Contact Us</h2>
            <p>If you have any questions or comments about this Cookie Policy, please reach out to us:</p>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={18} />
                <span>privacy@freshbitescafe.com</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} />
                <span>123 Gourmet Street, Foodville, FC 12345</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

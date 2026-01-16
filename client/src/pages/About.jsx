import './About.css'

export default function About() {
  return (
    <div className="about-page">
      <div className="about-container">
        <button className="back-link" onClick={() => window.history.back()}>← Back</button>
        
        <div className="about-hero">
          <h1 className="about-title">About Fresh Bites Café</h1>
          <p className="about-tagline">Serving Delicious Meals with Love Since 2024</p>
        </div>

        <div className="about-content">
          {/* Our Story */}
          <section className="about-section">
            <div className="section-icon">📖</div>
            <h2>Our Story</h2>
            <p>
              Welcome to Fresh Bites Café, where passion meets flavor! Founded in 2024, we started with a simple 
              mission: to bring fresh, delicious, and affordable meals to our community. What began as a small 
              café has grown into a beloved destination for food lovers seeking quality and convenience.
            </p>
            <p>
              Every dish we serve is crafted with care, using the freshest ingredients sourced from local suppliers. 
              We believe that great food brings people together, and our diverse menu reflects the rich culinary 
              traditions that inspire us every day.
            </p>
          </section>

          {/* Our Mission */}
          <section className="about-section highlight-section">
            <div className="section-icon">🎯</div>
            <h2>Our Mission</h2>
            <p>
              To provide our customers with exceptional dining experiences through quality food, outstanding service,
              and innovative technology. We&apos;re committed to making delicious meals accessible to everyone, whether
              you dine in, pick up, or have it delivered to your doorstep.
            </p>
          </section>

          {/* What We Offer */}
          <section className="about-section">
            <div className="section-icon">🍽️</div>
            <h2>What We Offer</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🍳</div>
                <h3>Fresh Breakfast</h3>
                <p>Start your day right with our hearty breakfast options, from classic favorites to innovative creations.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🍔</div>
                <h3>Lunch & Dinner</h3>
                <p>Satisfy your cravings with our diverse menu featuring local and international cuisines.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🍰</div>
                <h3>Desserts & Snacks</h3>
                <p>Indulge in our delectable desserts and snacks, perfect for any time of the day.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">☕</div>
                <h3>Beverages</h3>
                <p>Refresh yourself with our selection of hot and cold beverages, from coffee to fresh juices.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Fast Delivery</h3>
                <p>Enjoy your favorite meals delivered fresh to your location with real-time tracking.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>Mobile App</h3>
                <p>Order on the go with our easy-to-use mobile app for iOS and Android.</p>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="about-section">
            <div className="section-icon">💎</div>
            <h2>Our Values</h2>
            <div className="values-list">
              <div className="value-item">
                <strong>Quality First:</strong> We never compromise on the quality of our ingredients or preparation.
              </div>
              <div className="value-item">
                <strong>Customer Satisfaction:</strong> Your happiness is our success. We listen, adapt, and improve.
              </div>
              <div className="value-item">
                <strong>Sustainability:</strong> We&apos;re committed to eco-friendly practices and supporting local suppliers.
              </div>
              <div className="value-item">
                <strong>Innovation:</strong> We embrace technology to enhance your dining experience.
              </div>
              <div className="value-item">
                <strong>Community:</strong> We&apos;re proud to be part of this community and give back whenever we can.
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="about-section highlight-section">
            <div className="section-icon">⭐</div>
            <h2>Why Choose Us?</h2>
            <ul className="why-choose-list">
              <li>✓ Fresh ingredients delivered daily from trusted local suppliers</li>
              <li>✓ Expert chefs with years of culinary experience</li>
              <li>✓ Flexible ordering options: dine-in, pickup, or delivery</li>
              <li>✓ Real-time order tracking for delivery orders</li>
              <li>✓ Secure payment options including M-Pesa</li>
              <li>✓ User-friendly mobile app for iOS and Android</li>
              <li>✓ Exceptional customer service and support</li>
              <li>✓ Competitive pricing without compromising quality</li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="about-section">
            <div className="section-icon">📞</div>
            <h2>Get In Touch</h2>
            <p>
              We&apos;d love to hear from you! Whether you have questions, feedback, or just want to say hello,
              feel free to reach out to us.
            </p>
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon-large">📍</div>
                <h4>Visit Us</h4>
                <p>[Your Address Here]</p>
                <small className="placeholder-text">Placeholder - Update with actual location</small>
              </div>
              <div className="contact-card">
                <div className="contact-icon-large">📞</div>
                <h4>Call Us</h4>
                <p>[Your Phone Number]</p>
                <small className="placeholder-text">Placeholder - Update with actual phone</small>
              </div>
              <div className="contact-card">
                <div className="contact-icon-large">✉️</div>
                <h4>Email Us</h4>
                <p>[Your Email Address]</p>
                <small className="placeholder-text">Placeholder - Update with actual email</small>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="about-section">
            <div className="section-icon">👥</div>
            <h2>Our Team</h2>
            <p>
              Behind every great meal is a passionate team dedicated to excellence. From our skilled chefs 
              to our friendly delivery partners, every member of the Fresh Bites family works together to 
              ensure you have the best experience possible.
            </p>
            <p className="team-cta">
              Join our team! We&apos;re always looking for talented individuals who share our passion for food
              and service.
            </p>
          </section>

          {/* Thank You Section */}
          <section className="about-section thank-you-section">
            <h2>Thank You for Choosing Us! 🙏</h2>
            <p>
              Your support means the world to us. We&apos;re honored to serve you and be part of your daily life.
              Here&apos;s to many more delicious meals together!
            </p>
            <button className="cta-button" onClick={() => window.location.href = '/'}>
              Explore Our Menu
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}

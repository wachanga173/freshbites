import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import MenuItem from './components/MenuItem'
import Cart from './components/Cart'
import FeedbackChatbot from './components/FeedbackChatbot'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import OrderManagementDashboard from './pages/OrderManagementDashboard'
import DeliveryDashboard from './pages/DeliveryDashboard'
import OrderTracking from './pages/OrderTracking'
import FeedbackManagerDashboard from './pages/FeedbackManagerDashboard'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import TermsAndConditions from './pages/TermsAndConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import About from './pages/About'
import Contact from './pages/Contact'
import RoleSwitcher from './components/RoleSwitcher'
import { getApiUrl } from './config/api'
import './App.css'

function MainApp() {
  const { user, logout, isAdmin, isOrderManager, isDelivery, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [menu, setMenu] = useState({ appetizers: [], breakfast: [], lunch: [], dinner: [], desserts: [], snacks: [], drinks: [] })
  const [cartItems, setCartItems] = useState([])
  const [message, setMessage] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [_showAdminPanel, setShowAdminPanel] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [currentRoute, setCurrentRoute] = useState('home')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showCart, setShowCart] = useState(false)

  const isFeedbackManager = user && (user.roles?.includes('feedback_manager') || user.roles?.includes('superadmin'))
  const isSuperAdmin = user && user.roles?.includes('superadmin')

  useEffect(() => {
    fetch(getApiUrl('/api/menu'))
      .then(r => {
        if (!r.ok) throw new Error('Menu endpoint not found')
        return r.json()
      })
      .then(setMenu)
      .catch(() => setMessage('Could not load menu from server'))

    // Simple routing based on URL path
    const path = window.location.pathname
    if (path.includes('/payment/success')) {
      setCurrentRoute('payment-success')
    } else if (path.includes('/payment/cancel')) {
      setCurrentRoute('payment-cancel')
    } else if (path === '/admin') {
      setCurrentRoute('admin')
      setShowAdminPanel(true)
    } else if (path === '/order-management') {
      setCurrentRoute('order-management')
    } else if (path === '/delivery') {
      setCurrentRoute('delivery')
    } else if (path === '/my-orders') {
      setCurrentRoute('my-orders')
    } else if (path === '/feedback-management') {
      setCurrentRoute('feedback-management')
    } else if (path === '/terms') {
      setCurrentRoute('terms')
    } else if (path === '/privacy') {
      setCurrentRoute('privacy')
    } else if (path === '/about') {
      setCurrentRoute('about')
    } else if (path === '/contact') {
      setCurrentRoute('contact')
    } else {
      setCurrentRoute('home')
    }
  }, [])
  if (currentRoute === 'my-orders' && user) {
    return <OrderTracking />
  }

  if (loading) {
    return <div className="loading-screen">Loading...</div>
  }

  // Handle payment result routes
  if (currentRoute === 'payment-success') {
    return <PaymentSuccess />
  }

  if (currentRoute === 'payment-cancel') {
    return <PaymentCancel />
  }

  // Handle legal pages
  if (currentRoute === 'terms') {
    return <TermsAndConditions />
  }

  if (currentRoute === 'privacy') {
    return <PrivacyPolicy />
  }

  if (currentRoute === 'about') {
    return <About />
  }

  if (currentRoute === 'contact') {
    return <Contact />
  }

  if (showAuth && !user) {
    return authMode === 'login' ? (
      <Login onSwitch={() => setAuthMode('register')} />
    ) : (
      <Register onSwitch={() => setAuthMode('login')} />
    )
  }

  // Role-specific dashboards
  if (currentRoute === 'admin' && isAdmin) {
    return (
      <div>
        <RoleSwitcher />
        <button 
          className="back-to-store-btn"
          onClick={() => {
            setShowAdminPanel(false)
            setCurrentRoute('home')
            window.history.pushState({}, '', '/')
          }}
        >
          ← Back to Store
        </button>
        <AdminDashboard />
      </div>
    )
  }

  if (currentRoute === 'order-management' && (isOrderManager || isSuperAdmin)) {
    return (
      <div>
        <RoleSwitcher />
        <button 
          className="back-to-store-btn"
          onClick={() => {
            setCurrentRoute('home')
            window.history.pushState({}, '', '/')
          }}
        >
          ← Back to Store
        </button>
        <OrderManagementDashboard />
      </div>
    )
  }

  if (currentRoute === 'feedback-management' && isFeedbackManager) {
    return (
      <div>
        <RoleSwitcher />
        <button 
          className="back-to-store-btn"
          onClick={() => {
            setCurrentRoute('home')
            window.history.pushState({}, '', '/')
          }}
        >
          ← Back to Store
        </button>
        <FeedbackManagerDashboard />
      </div>
    )
  }

  if (currentRoute === 'delivery' && isDelivery) {
    return (
      <div>
        <RoleSwitcher />
        <button 
          className="back-to-store-btn"
          onClick={() => {
            setCurrentRoute('home')
            window.history.pushState({}, '', '/')
          }}
        >
          ← Back to Store
        </button>
        <DeliveryDashboard />
      </div>
    )
  }

  if (showCheckout && user) {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return (
      <Checkout 
        items={cartItems}
        total={total}
        onBack={() => setShowCheckout(false)}
        onSuccess={(order) => {
          setCartItems([])
          setShowCheckout(false)
          setMessage(`✅ Payment successful! Order #${order.id} confirmed.`)
          setTimeout(() => setMessage(''), 5000)
        }}
      />
    )
  }

  function addToCart(item) {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function removeFromCart(index) {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateQuantity(index, delta) {
    setCartItems(prev => {
      const updated = [...prev]
      updated[index].quantity += delta
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index)
      }
      return updated
    })
  }

  function handleCheckout() {
    if (!user) {
      setMessage('Please login to place an order')
      setShowAuth(true)
      return
    }

    if (cartItems.length === 0) {
      setMessage('Please add items to your cart')
      return
    }

    // Navigate to checkout page
    setShowCheckout(true)
  }

  const categories = [
    { id: 'all', name: 'All Menu', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥟' },
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'lunch', name: 'Lunch', icon: '🍔' },
    { id: 'dinner', name: 'Dinner', icon: '🍖' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'drinks', name: 'Drinks', icon: '☕' }
  ]

  const filteredMenu = activeCategory === 'all' 
    ? [...menu.appetizers, ...menu.breakfast, ...menu.lunch, ...menu.dinner, ...menu.desserts, ...menu.snacks, ...menu.drinks]
    : menu[activeCategory] || []

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-overlay"></div>
        
        {/* Desktop User Menu Row - Top of hero */}
        {window.innerWidth > 768 && (
          <div className="hero-top-menu">
            {user ? (
              <>
                <span className="welcome-text">Welcome, {user.username}!</span>
                {isAdmin && (
                  <button onClick={() => {
                    setShowAdminPanel(true)
                    setCurrentRoute('admin')
                    window.history.pushState({}, '', '/admin')
                  }}>Admin Panel</button>
                )}
                {(isOrderManager || isSuperAdmin) && (
                  <button onClick={() => {
                    setCurrentRoute('order-management')
                    window.history.pushState({}, '', '/order-management')
                  }}>Order Management</button>
                )}
                {isFeedbackManager && (
                  <button onClick={() => {
                    setCurrentRoute('feedback-management')
                    window.history.pushState({}, '', '/feedback-management')
                  }}>Feedback Management</button>
                )}
                {isDelivery && (
                  <button onClick={() => {
                    setCurrentRoute('delivery')
                    window.history.pushState({}, '', '/delivery')
                  }}>Delivery Dashboard</button>
                )}
                <button onClick={() => {
                  setCurrentRoute('my-orders')
                  window.history.pushState({}, '', '/my-orders')
                }}>My Orders</button>
                <button onClick={logout}>Logout</button>
                <button 
                  className="cart-icon-only"
                  onClick={() => setShowCart(!showCart)}
                  title="View cart"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="cart-badge">{cartItems.length}</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <button className="login-btn" onClick={() => setShowAuth(true)}>
                  Login / Register
                </button>
                <button 
                  className="cart-icon-only"
                  onClick={() => setShowCart(!showCart)}
                  title="View cart"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                  {cartItems.length > 0 && (
                    <span className="cart-badge">{cartItems.length}</span>
                  )}
                </button>
              </>
            )}
          </div>
        )}
        
        <div className="hero-content">
          <h1 className="hero-title">Fresh Bites Café</h1>
          <p className="hero-subtitle">Delicious meals, delivered fresh to your door</p>
        </div>
        <button 
          className="hamburger-menu-hero"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Cart Icon */}
        <button 
          className="cart-icon-btn"
          onClick={() => setShowCart(!showCart)}
          aria-label="View cart"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          {cartItems.length > 0 && (
            <span className="cart-badge">{cartItems.length}</span>
          )}
        </button>
      </header>

      <nav className="category-nav">
        <div className="nav-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id)
              }}
            >
              <span className="cat-icon">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile User Menu Overlay */}
      {showMobileMenu && (
        <>
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="mobile-user-menu">
            {user ? (
              <>
                <div className="mobile-user-header">
                  <span>Welcome, {user.username}!</span>
                </div>
                {isAdmin && (
                  <button onClick={() => {
                    setShowAdminPanel(true)
                    setCurrentRoute('admin')
                    window.history.pushState({}, '', '/admin')
                    setShowMobileMenu(false)
                  }} className="mobile-link-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                      <path d="M2 17L12 22L22 17"/>
                      <path d="M2 12L12 17L22 12"/>
                    </svg>
                    Admin Panel
                  </button>
                )}
                {(isOrderManager || isSuperAdmin) && (
                  <button onClick={() => {
                    setCurrentRoute('order-management')
                    window.history.pushState({}, '', '/order-management')
                    setShowMobileMenu(false)
                  }} className="mobile-link-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M3 9h18"/>
                      <path d="M9 21V9"/>
                    </svg>
                    Order Management
                  </button>
                )}
                {isFeedbackManager && (
                  <button onClick={() => {
                    setCurrentRoute('feedback-management')
                    window.history.pushState({}, '', '/feedback-management')
                    setShowMobileMenu(false)
                  }} className="mobile-link-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    Feedback Management
                  </button>
                )}
                {isDelivery && (
                  <button onClick={() => {
                    setCurrentRoute('delivery')
                    window.history.pushState({}, '', '/delivery')
                    setShowMobileMenu(false)
                  }} className="mobile-link-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Delivery Dashboard
                  </button>
                )}
                <button onClick={() => {
                  setCurrentRoute('my-orders')
                  window.history.pushState({}, '', '/my-orders')
                  setShowMobileMenu(false)
                }} className="mobile-link-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  My Orders
                </button>
                <button onClick={() => {
                  setCurrentRoute('contact')
                  window.history.pushState({}, '', '/contact')
                  setShowMobileMenu(false)
                }} className="mobile-link-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                  </svg>
                  Contact
                </button>
                <button onClick={() => {
                  logout()
                  setShowMobileMenu(false)
                }} className="mobile-link-btn logout-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => {
                  setShowAuth(true)
                  setAuthMode('login')
                  setShowMobileMenu(false)
                }} className="mobile-link-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Login
                </button>
                <button onClick={() => {
                  setShowAuth(true)
                  setAuthMode('register')
                  setShowMobileMenu(false)
                }} className="mobile-link-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Register
                </button>
                <button onClick={() => {
                  setCurrentRoute('contact')
                  window.history.pushState({}, '', '/contact')
                  setShowMobileMenu(false)
                }} className="mobile-link-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z"/>
                  </svg>
                  Contact
                </button>
              </>
            )}
          </div>
        </>
      )}

      {message && (
        <div className="toast-message">
          {message}
        </div>
      )}

      <main className="main-content">
        <div className="container">
          <section className={`menu-section ${activeCategory !== 'all' ? activeCategory + '-bg' : ''}`}>
            <h2 className="section-title">
              {categories.find(c => c.id === activeCategory)?.name || 'Menu'}
            </h2>
            <div className="menu-grid">
              {filteredMenu.length > 0 ? (
                filteredMenu.map(item => (
                  <MenuItem 
                    key={item.id} 
                    item={item} 
                    onAddToCart={addToCart}
                  />
                ))
              ) : (
                <p className="empty-message">No items available in this category</p>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Cart Modal */}
      {showCart && (
        <>
          <div className="cart-modal-overlay" onClick={() => setShowCart(false)} />
          <div className="cart-modal">
            <div className="cart-modal-header">
              <h3>Your Cart</h3>
              <button className="close-cart-btn" onClick={() => setShowCart(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="cart-modal-content">
              <Cart 
                items={cartItems}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                onUpdateQuantity={updateQuantity}
              />
            </div>
          </div>
        </>
      )}

      {/* Feedback Chatbot - Available for all logged-in users */}
      {user && <FeedbackChatbot />}

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}

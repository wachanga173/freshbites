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
        <div className="hero-content">
          <h1 className="hero-title">Fresh Bites Café</h1>
          <p className="hero-subtitle">Delicious meals, delivered fresh to your door</p>
        </div>
        <div className="hero-actions">
          {user ? (
            <div className="user-menu">
              <span>Welcome, {user.username}!</span>
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
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowAuth(true)}>
              Login / Register
            </button>
          )}
        </div>
      </header>

      <nav className="category-nav">
        <button 
          className="hamburger-menu"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`nav-container ${showMobileMenu ? 'mobile-menu-open' : ''}`}>
          <div className="nav-scroll">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setShowMobileMenu(false)
                }}
              >
                <span className="cat-icon">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
        
        {showMobileMenu && (
          <div 
            className="mobile-menu-overlay" 
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </nav>

      {message && (
        <div className="toast-message">
          {message}
        </div>
      )}

      <main className="main-content">
        <div className="container">
          <div className="content-grid">
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

            <aside className="cart-sidebar">
              <Cart 
                items={cartItems}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                onUpdateQuantity={updateQuantity}
              />
            </aside>
          </div>
        </div>
      </main>

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

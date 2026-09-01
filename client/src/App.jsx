import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Menu from './pages/Menu'
import News from './pages/News'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
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
import CookiePolicy from './pages/CookiePolicy'
import About from './pages/About'
import Contact from './pages/Contact'
import ForgotPassword from './pages/ForgotPassword'
import RoleSwitcher from './components/RoleSwitcher'
import FeedbackChatbot from './components/FeedbackChatbot'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import CookieConsent from './components/CookieConsent'
import './App.css'

const CART_STORAGE_KEY = 'freshbites-cart'

function MainApp() {
  const { user, isAdmin, isOrderManager, isDelivery, loading } = useAuth()
  const [currentRoute, setCurrentRoute] = useState('home')

  const isFeedbackManager = user && (user.roles?.includes('feedback_manager') || user.roles?.includes('superadmin'))
  const isSuperAdmin = user && user.roles?.includes('superadmin')

  const getCheckoutData = () => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY)
      const items = raw ? JSON.parse(raw) : []
      const safeItems = Array.isArray(items) ? items : []
      const total = safeItems.reduce((sum, item) => {
        const price = Number(item?.price) || 0
        const quantity = Number(item?.quantity) || 0
        return sum + (price * quantity)
      }, 0)
      return { items: safeItems, total }
    } catch (err) {
      console.error('Failed to read checkout data:', err)
      return { items: [], total: 0 }
    }
  }

  useEffect(() => {
    // Simple routing based on URL path
    const path = window.location.pathname
    if (path.includes('/payment/success')) {
      setCurrentRoute('payment-success')
    } else if (path.includes('/payment/cancel')) {
      setCurrentRoute('payment-cancel')
    } else if (path === '/login') {
      setCurrentRoute('login')
    } else if (path === '/forgot-password') {
      setCurrentRoute('forgot-password')
    } else if (path === '/register') {
      setCurrentRoute('register')
    } else if (path === '/profile') {
      setCurrentRoute('profile')
    } else if (path === '/admin') {
      setCurrentRoute('admin')
    } else if (path === '/order-management') {
      setCurrentRoute('order-management')
    } else if (path === '/delivery') {
      setCurrentRoute('delivery')
    } else if (path === '/my-orders') {
      setCurrentRoute('my-orders')
    } else if (path === '/feedback-management') {
      setCurrentRoute('feedback-management')
    } else if (path === '/checkout') {
      setCurrentRoute('checkout')
    } else if (path === '/terms') {
      setCurrentRoute('terms')
    } else if (path === '/privacy') {
      setCurrentRoute('privacy')
    } else if (path === '/cookies' || path === '/cookie-policy') {
      setCurrentRoute('cookies')
    } else if (path === '/about') {
      setCurrentRoute('about')
    } else if (path === '/contact') {
      setCurrentRoute('contact')
    } else if (path === '/news') {
      setCurrentRoute('news')
    } else if (path === '/menu') {
      setCurrentRoute('menu')
    } else {
      setCurrentRoute('home')
    }
  }, [])
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <span className="loading-text">Fresh Bites Café</span>
      </div>
    )
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

  if (currentRoute === 'cookies') {
    return <CookiePolicy />
  }

  if (currentRoute === 'about') {
    return <About />
  }

  if (currentRoute === 'contact') {
    return <Contact />
  }

  if (currentRoute === 'news') {
    return <News />
  }

  // Auth routes
  if (currentRoute === 'login') {
    return (
      <Login 
        onSwitch={() => setCurrentRoute('register')} 
        onForgotPassword={() => setCurrentRoute('forgot-password')} 
      />
    )
  }

  if (currentRoute === 'register') {
    return <Register onSwitch={() => setCurrentRoute('login')} />
  }

  if (currentRoute === 'forgot-password') {
    return <ForgotPassword onBackToLogin={() => setCurrentRoute('login')} />
  }

  // Profile
  if (currentRoute === 'profile' && user) {
    return <Profile />
  }

  // My Orders
  if (currentRoute === 'my-orders' && user) {
    return <OrderTracking />
  }

  // Checkout
  if (currentRoute === 'checkout' && user) {
    const { items, total } = getCheckoutData()
    return (
      <Checkout
        items={items}
        total={total}
        onBack={() => { window.location.href = '/menu' }}
        onSuccess={() => {
          localStorage.removeItem(CART_STORAGE_KEY)
          window.location.href = '/my-orders'
        }}
      />
    )
  }

  // Role-specific dashboards
  if (currentRoute === 'admin' && isAdmin) {
    return (
      <div>
        <RoleSwitcher />
        <button 
          className="back-to-store-btn"
          onClick={() => window.location.href = '/'}
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
          onClick={() => window.location.href = '/'}
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
          onClick={() => window.location.href = '/'}
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
          onClick={() => window.location.href = '/'}
        >
          ← Back to Store
        </button>
        <DeliveryDashboard />
      </div>
    )
  }

  // Menu page
  if (currentRoute === 'menu') {
    return <Menu />
  }

  // Home page (default)
  return <Home />
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
      <FeedbackChatbot />
      <PWAInstallPrompt />
      <CookieConsent />
    </AuthProvider>
  )
}

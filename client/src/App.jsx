import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Menu from './pages/Menu'
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
import FeedbackChatbot from './components/FeedbackChatbot'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import './App.css'

function MainApp() {
  const { user, isAdmin, isOrderManager, isDelivery, loading } = useAuth()
  const [currentRoute, setCurrentRoute] = useState('home')

  const isFeedbackManager = user && (user.roles?.includes('feedback_manager') || user.roles?.includes('superadmin'))
  const isSuperAdmin = user && user.roles?.includes('superadmin')

  useEffect(() => {
    // Simple routing based on URL path
    const path = window.location.pathname
    if (path.includes('/payment/success')) {
      setCurrentRoute('payment-success')
    } else if (path.includes('/payment/cancel')) {
      setCurrentRoute('payment-cancel')
    } else if (path === '/login') {
      setCurrentRoute('login')
    } else if (path === '/register') {
      setCurrentRoute('register')
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
    } else if (path === '/about') {
      setCurrentRoute('about')
    } else if (path === '/contact') {
      setCurrentRoute('contact')
    } else if (path === '/menu') {
      setCurrentRoute('menu')
    } else {
      setCurrentRoute('home')
    }
  }, [])
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

  // Auth routes
  if (currentRoute === 'login') {
    return <Login onSwitch={() => window.location.href = '/register'} />
  }

  if (currentRoute === 'register') {
    return <Register onSwitch={() => window.location.href = '/login'} />
  }

  // My Orders
  if (currentRoute === 'my-orders' && user) {
    return <OrderTracking />
  }

  // Checkout
  if (currentRoute === 'checkout' && user) {
    return <Checkout />
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
    </AuthProvider>
  )
}

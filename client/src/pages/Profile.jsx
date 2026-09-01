import { ShoppingCart, Briefcase, Star, Clipboard, Bike, MessageSquare, User, Lightbulb, Zap, Package, Utensils, LogOut, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import Footer from '../components/Footer'
import './Auth.css'

export default function Profile() {
  const { user, token, logout } = useAuth()
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false)
  const [toggling2FA, setToggling2FA] = useState(false)
  const [twoFactorMessage, setTwoFactorMessage] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')

  if (!user) {
    window.location.href = '/login'
    return null
  }

  const handleToggle2FA = async () => {
    setToggling2FA(true)
    setTwoFactorMessage('')
    setTwoFactorError('')
    try {
      const res = await fetch(getApiUrl('/api/auth/2fa/toggle'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enable: !twoFactor })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTwoFactor(data.twoFactorEnabled)
        setTwoFactorMessage(data.message)
      } else {
        setTwoFactorError(data.error || 'Failed to update 2FA status.')
      }
    } catch (err) {
      setTwoFactorError('Connection error while updating 2FA.')
    } finally {
      setToggling2FA(false)
    }
  }

  // Get user roles
  const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['customer'])

  const getRoleIcon = (role) => {
    const icons = {
      customer: <ShoppingCart size={18} className="inline-block mr-1" />,
      admin: <Briefcase size={18} className="inline-block mr-1" />,
      superadmin: <Star size={18} className="inline-block mr-1" />,
      ordermanager: <Clipboard size={18} className="inline-block mr-1" />,
      delivery: <Bike size={18} className="inline-block mr-1" />,
      feedback_manager: <MessageSquare size={18} className="inline-block mr-1" />
    }
    return icons[role] || <User size={18} className="inline-block mr-1" />
  }

  const getRoleLabel = (role) => {
    const labels = {
      customer: 'Customer',
      admin: 'Admin',
      superadmin: 'Super Admin',
      ordermanager: 'Order Manager',
      delivery: 'Delivery Personnel',
      feedback_manager: 'Feedback Manager'
    }
    return labels[role] || role
  }

  const getRolePath = (role) => {
    const paths = {
      customer: '/',
      admin: '/admin',
      superadmin: '/admin',
      ordermanager: '/order-management',
      delivery: '/delivery',
      feedback_manager: '/feedback-management'
    }
    return paths[role] || '/'
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="text-xl sm:text-2xl font-bold" style={{color: 'var(--color-primary)'}}
            >
              Fresh Bites Café
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-sm lg:text-base font-medium text-gray-700 rounded-md transition-all" style={{color: 'inherit'}} onMouseEnter={(e) => {e.target.style.backgroundColor = '#f3f4f6'; e.target.style.color = 'var(--color-primary)'}} onMouseLeave={(e) => {e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'inherit'}}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="px-8 py-12 text-white text-center" style={{background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', color: 'white'}}>
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-5xl">
              <User size={18} className="inline-block mr-1" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p style={{color: '#D4C5B0'}}>{user.email}</p>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {/* Account Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span><Clipboard size={18} className="inline-block mr-1" /></span> Account Information
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600 font-medium">Username</span>
                  <span className="text-gray-800 font-semibold">{user.username}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-800 font-semibold">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Account Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    Active
                  </span>
                </div>
              </div>
            </section>

            {/* Roles Section */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span><Star size={18} className="inline-block mr-1" /></span> Your Roles & Dashboards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRoles.map(role => (
                  <div 
                    key={role}
                    className="rounded-lg p-6 hover:shadow-lg cursor-pointer" style={{background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #E8DCC8 100%)', border: '2px solid #A0826D'}} onMouseEnter={(e) => e.target.style.borderColor = 'var(--color-primary)'} onMouseLeave={(e) => e.target.style.borderColor = '#A0826D'}
                    onClick={() => window.location.href = getRolePath(role)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{getRoleIcon(role)}</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {getRoleLabel(role)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Click to access dashboard
                        </p>
                      </div>
                      <div style={{color: 'var(--color-primary)', fontSize: '24px'}}>→</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {userRoles.length > 1 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Lightbulb size={18} className="inline-block mr-1" /> <strong>Tip:</strong> You have multiple roles! Use the Role Switcher at the top of any page to quickly switch between your dashboards.
                  </p>
                </div>
              )}
            </section>

            {/* Two-Factor Authentication (2FA) Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span><ShieldCheck size={22} className="inline-block mr-1 text-amber-600" /></span> Account Security & 2FA
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication (2FA)</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${twoFactor ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-200 text-gray-700'}`}>
                        {twoFactor ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 max-w-xl">
                      Add an extra layer of protection. When enabled, a 6-digit verification code will be sent to your email (<strong>{user.email}</strong>) each time you sign in.
                    </p>
                  </div>

                  <button
                    onClick={handleToggle2FA}
                    disabled={toggling2FA}
                    className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap ${
                      twoFactor 
                        ? 'bg-white border-2 border-red-500 text-red-600 hover:bg-red-50' 
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <Lock size={16} />
                    {toggling2FA ? 'Updating...' : (twoFactor ? 'Disable 2FA' : 'Enable 2FA')}
                  </button>
                </div>

                {twoFactorMessage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>{twoFactorMessage}</span>
                  </div>
                )}

                {twoFactorError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                    {twoFactorError}
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span><Zap size={18} className="inline-block mr-1" /></span> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/my-orders'}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-left group"
                >
                  <div className="text-3xl"><Package size={18} className="inline-block mr-1" /></div>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-white" style={{transition: 'color 0.2s'}}onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.target.style.color = '#1f2937'}>My Orders</div>
                    <div className="text-sm text-gray-600">View order history</div>
                  </div>
                </button>
                <button
                  onClick={() => window.location.href = '/menu'}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-left group"
                >
                  <div className="text-3xl"><Utensils size={18} className="inline-block mr-1" /></div>
                  <div>
                    <div className="font-semibold text-gray-800" style={{transition: 'color 0.2s'}} onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'} onMouseLeave={(e) => e.target.style.color = '#1f2937'}>Browse Menu</div>
                    <div className="text-sm text-gray-600">Order delicious food</div>
                  </div>
                </button>
              </div>
            </section>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
              >
                <LogOut size={18} className="inline-block mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

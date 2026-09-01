import { ShoppingCart, Briefcase, Star, Clipboard, Bike, MessageSquare, User, Lightbulb, Zap, Package, Utensils, ShieldCheck, Lock, CheckCircle2, QrCode, KeyRound, Copy, Check, Smartphone, Mail, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import './Auth.css'

export default function Profile() {
  const { 
    user, 
    logout, 
    setupAuthenticator2FA, 
    verifySetupAuthenticator2FA, 
    setupEmail2FA, 
    verifySetupEmail2FA, 
    disable2FA 
  } = useAuth()

  // 2FA Setup State
  const [setupModal, setSetupModal] = useState(null) // null | 'authenticator' | 'email' | 'disable'
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusError, setStatusError] = useState('')

  if (!user) {
    window.location.href = '/login'
    return null
  }

  // Start Authenticator 2FA Setup
  const handleStartAuthenticatorSetup = async () => {
    setActionLoading(true)
    setStatusError('')
    setStatusMessage('')
    setVerificationCode('')
    setCopiedSecret(false)

    try {
      const data = await setupAuthenticator2FA()
      if (data.success) {
        setQrCodeDataUrl(data.qrCodeDataUrl)
        setSecretKey(data.secret)
        setSetupModal('authenticator')
      } else {
        setStatusError(data.error || 'Failed to start Authenticator setup.')
      }
    } catch (err) {
      setStatusError('Connection error during 2FA setup.')
    } finally {
      setActionLoading(false)
    }
  }

  // Verify and Activate Authenticator 2FA
  const handleVerifyAuthenticator = async (e) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      setStatusError('Please enter the 6-digit code from your Authenticator app.')
      return
    }

    setActionLoading(true)
    setStatusError('')
    try {
      const data = await verifySetupAuthenticator2FA(verificationCode)
      if (data.success) {
        setStatusMessage(data.message || 'Authenticator 2FA enabled successfully!')
        setSetupModal(null)
      } else {
        setStatusError(data.error || 'Invalid verification code. Please check and try again.')
      }
    } catch (err) {
      setStatusError('Failed to verify Authenticator code.')
    } finally {
      setActionLoading(false)
    }
  }

  // Start Email 2FA Setup
  const handleStartEmailSetup = async () => {
    setActionLoading(true)
    setStatusError('')
    setStatusMessage('')
    setVerificationCode('')

    try {
      const data = await setupEmail2FA()
      if (data.success) {
        setSetupModal('email')
        setStatusMessage(data.message)
      } else {
        setStatusError(data.error || 'Failed to send verification code.')
      }
    } catch (err) {
      setStatusError('Connection error during Email 2FA setup.')
    } finally {
      setActionLoading(false)
    }
  }

  // Verify and Activate Email 2FA
  const handleVerifyEmail2FA = async (e) => {
    e.preventDefault()
    if (!verificationCode || verificationCode.length !== 6) {
      setStatusError('Please enter the 6-digit code sent to your email.')
      return
    }

    setActionLoading(true)
    setStatusError('')
    try {
      const data = await verifySetupEmail2FA(verificationCode)
      if (data.success) {
        setStatusMessage(data.message || 'Email 2FA enabled successfully!')
        setSetupModal(null)
      } else {
        setStatusError(data.error || 'Invalid verification code.')
      }
    } catch (err) {
      setStatusError('Failed to verify code.')
    } finally {
      setActionLoading(false)
    }
  }

  // Disable 2FA
  const handleConfirmDisable2FA = async (e) => {
    e.preventDefault()
    if (!disablePassword) {
      setStatusError('Please enter your account password to confirm.')
      return
    }

    setActionLoading(true)
    setStatusError('')
    try {
      const data = await disable2FA(disablePassword)
      if (data.success) {
        setStatusMessage('Two-Factor Authentication has been disabled.')
        setSetupModal(null)
        setDisablePassword('')
      } else {
        setStatusError(data.error || 'Incorrect password.')
      }
    } catch (err) {
      setStatusError('Connection error while disabling 2FA.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (secretKey) {
      navigator.clipboard.writeText(secretKey)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2500)
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
                <span><ShieldCheck size={22} className="inline-block mr-1 text-amber-600" /></span> Account Security & Two-Factor Authentication (2FA)
              </h2>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                {statusMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {statusError && !setupModal && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
                    {statusError}
                  </div>
                )}

                {user.twoFactorEnabled ? (
                  // Active 2FA State
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800">Two-Factor Authentication is Active</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 max-w-xl">
                        {user.twoFactorMethod === 'authenticator'
                          ? 'Your account is secured using an Authenticator app (Google Authenticator, Authy, etc.).'
                          : `Your account is secured using one-time verification codes delivered to your email (${user.email}).`}
                      </p>
                    </div>

                    <button
                      onClick={() => { setSetupModal('disable'); setStatusError(''); setDisablePassword('') }}
                      className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <Lock size={16} /> Disable 2FA
                    </button>
                  </div>
                ) : (
                  // Disabled / Setup 2FA State
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-800">Protect Your Account</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-700">
                          Disabled
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Authenticator App Method (Recommended for all, Primary for Admins) */}
                      <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-amber-400 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                              <Smartphone size={20} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                              Recommended
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-1">Authenticator App</h4>
                          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                            Use Google Authenticator, Microsoft Authenticator, or Authy to generate instant 6-digit codes.
                          </p>
                        </div>
                        <button
                          onClick={handleStartAuthenticatorSetup}
                          disabled={actionLoading}
                          className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <QrCode size={16} /> Set Up Authenticator App
                        </button>
                      </div>

                      {/* Email Code Method (Customers Only) */}
                      {userRoles.includes('customer') && !userRoles.some(r => ['admin', 'superadmin'].includes(r)) && (
                        <div className="bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-400 transition-all flex flex-col justify-between">
                          <div>
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 mb-2">
                              <Mail size={20} />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Email Verification</h4>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                              Receive a 6-digit security code sent directly to your registered email ({user.email}) each time you sign in.
                            </p>
                          </div>
                          <button
                            onClick={handleStartEmailSetup}
                            disabled={actionLoading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2"
                          >
                            <Mail size={16} /> Set Up Email 2FA
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Authenticator Setup Modal */}
            {setupModal === 'authenticator' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { setSetupModal(null); setStatusError('') }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-2 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                      <QrCode size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Set Up Authenticator App</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Scan the QR code below using <strong>Google Authenticator</strong>, <strong>Authy</strong>, or <strong>Microsoft Authenticator</strong>.
                    </p>
                  </div>

                  {qrCodeDataUrl && (
                    <div className="flex justify-center my-3 p-3 bg-white border border-gray-200 rounded-xl shadow-inner">
                      <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-40 h-40 sm:w-48 sm:h-48" />
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <span className="text-xs text-gray-500 block mb-1">Or enter this key manually:</span>
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono font-bold text-gray-800 break-all select-all">{secretKey}</code>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                      >
                        {copiedSecret ? <><Check size={12} className="text-green-600" /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyAuthenticator}>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Enter 6-Digit Code from App
                      </label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-center font-mono font-bold text-lg tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {statusError && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {statusError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSetupModal(null); setStatusError('') }}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading || verificationCode.length !== 6}
                        className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Email 2FA Setup Modal */}
            {setupModal === 'email' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { setSetupModal(null); setStatusError('') }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-2 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                      <Mail size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Confirm Email 2FA Setup</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      We sent a 6-digit confirmation code to <strong>{user.email}</strong>. Enter it below to activate Email 2FA.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyEmail2FA}>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        6-Digit Confirmation Code
                      </label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-center font-mono font-bold text-lg tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    {statusError && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {statusError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSetupModal(null); setStatusError('') }}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading || verificationCode.length !== 6}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Disable 2FA Password Confirmation Modal */}
            {setupModal === 'disable' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { setSetupModal(null); setStatusError('') }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>

                  <div className="text-center mb-4">
                    <div className="w-12 h-12 mx-auto mb-2 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Disable Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      For your security, please enter your current account password to disable 2FA.
                    </p>
                  </div>

                  <form onSubmit={handleConfirmDisable2FA}>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Current Account Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={disablePassword}
                        onChange={e => setDisablePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        autoFocus
                        required
                      />
                    </div>

                    {statusError && (
                      <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                        {statusError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setSetupModal(null); setStatusError('') }}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading || !disablePassword}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        {actionLoading ? 'Disabling...' : 'Confirm Disable'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

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

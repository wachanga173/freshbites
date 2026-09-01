import { useState } from 'react'
import { ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login({ onSwitch, onForgotPassword }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // 2FA state
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState('authenticator')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [otp, setOtp] = useState('')

  const { login, verify2FA } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(username, password)
    if (!result.success) {
      setError(result.error || 'Failed to login')
    } else if (result.twoFactorRequired) {
      setShow2FA(true)
      setTwoFactorMethod(result.twoFactorMethod || 'authenticator')
      setUserId(result.userId)
      setUserEmail(result.email || '')
    }
    setLoading(false)
  }

  async function handleVerify2FA(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await verify2FA(userId, otp)
    if (!result.success) {
      setError(result.error || 'Invalid 2FA code. Please check and try again.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {show2FA ? (
          <>
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
                <ShieldCheck size={32} className="text-amber-600" />
              </div>
              <h2>2-Step Verification</h2>
              <p className="auth-subtitle">
                {twoFactorMethod === 'authenticator' 
                  ? 'Enter the 6-digit code from your Authenticator app (Google Authenticator / Authy).' 
                  : `Enter the 6-digit code sent to ${userEmail || 'your email'}.`}
              </p>
            </div>

            <form onSubmit={handleVerify2FA}>
              <div className="form-group">
                <label>Verification Code</label>
                <div className="input-with-icon">
                  <KeyRound size={18} className="input-icon" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    className="otp-input"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Verifying Code...' : 'Verify & Sign In'}
              </button>
            </form>

            <p className="auth-footer mt-4">
              <button 
                className="link-btn flex items-center justify-center gap-1 mx-auto" 
                onClick={() => { setShow2FA(false); setOtp(''); setError('') }}
              >
                <ArrowLeft size={15} /> Back to Sign In
              </button>
            </p>
          </>
        ) : (
          <>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Sign in to your account</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <div className="password-label-row">
                  <label>Password</label>
                  <button 
                    type="button" 
                    className="link-btn forgot-link" 
                    onClick={onForgotPassword || (() => { window.location.href = '/forgot-password' })}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="auth-footer">
              Don&apos;t have an account?{' '}
              <button className="link-btn" onClick={onSwitch}>
                Register
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Mail, KeyRound, Lock, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { getApiUrl } from '../config/api'
import './Auth.css'
import './ForgotPassword.css'

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState(1) // 1: Email Request, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Step 1: Send OTP to customer's email
  async function handleSendOTP(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage(data.message || 'Verification code sent to your email.')
        setStep(2)
      } else {
        setError(data.error || 'Failed to send reset code. Please verify your email.')
      }
    } catch (err) {
      console.error('Forgot password request error:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and reset password
  async function handleResetPassword(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword
        })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStep(3)
      } else {
        setError(data.error || 'Failed to reset password. Code may be invalid or expired.')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card forgot-password-card">
        {step === 1 && (
          <>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              Enter your registered customer email to receive a 6-digit verification code.
            </p>

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <ShieldAlert size={16} className="inline-block mr-1 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Sending Verification Code...' : 'Send Reset Code'}
              </button>
            </form>

            <p className="auth-footer">
              Remembered your password?{' '}
              <button className="link-btn" onClick={onBackToLogin}>
                Back to Sign In
              </button>
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Enter Code & New Password</h2>
            <p className="auth-subtitle">
              We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
            </p>

            {message && <div className="success-banner">{message}</div>}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label>6-Digit Verification Code</label>
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

              <div className="form-group">
                <label>New Password</label>
                <div className="input-with-icon password-input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <ShieldAlert size={16} className="inline-block mr-1 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Change Password'}
              </button>
            </form>

            <div className="step-back-row">
              <button className="link-btn text-muted" onClick={() => setStep(1)}>
                ← Change Email or Resend
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="reset-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={56} className="text-green-500" />
            </div>
            <h2>Password Changed!</h2>
            <p className="auth-subtitle">
              Your customer password has been updated securely. You can now log in with your new credentials.
            </p>
            <button className="auth-btn" onClick={onBackToLogin}>
              Sign In Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

import { createContext, useState, useContext, useEffect } from 'react'
import { getApiUrl } from '../config/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function fetchUser() {
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        logout()
      }
    } catch (err) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  async function login(username, password) {
    const res = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await res.json()
    if (data.success) {
      if (data.twoFactorRequired) {
        return {
          success: true,
          twoFactorRequired: true,
          twoFactorMethod: data.twoFactorMethod || 'authenticator',
          userId: data.userId,
          email: data.email
        }
      }
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      // Redirect to home page after successful login
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function verify2FA(userId, otp) {
    const res = await fetch(getApiUrl('/api/auth/verify-2fa'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp })
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  async function setupAuthenticator2FA() {
    const res = await fetch(getApiUrl('/api/auth/2fa/setup/authenticator'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  }

  async function verifySetupAuthenticator2FA(tokenCode) {
    const res = await fetch(getApiUrl('/api/auth/2fa/verify-setup/authenticator'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: tokenCode })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setUser(prev => ({ ...prev, twoFactorEnabled: true, twoFactorMethod: 'authenticator' }))
    }
    return data
  }

  async function setupEmail2FA() {
    const res = await fetch(getApiUrl('/api/auth/2fa/setup/email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  }

  async function verifySetupEmail2FA(tokenCode) {
    const res = await fetch(getApiUrl('/api/auth/2fa/verify-setup/email'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: tokenCode })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setUser(prev => ({ ...prev, twoFactorEnabled: true, twoFactorMethod: 'email' }))
    }
    return data
  }

  async function disable2FA(password) {
    const res = await fetch(getApiUrl('/api/auth/2fa/disable'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setUser(prev => ({ 
        ...prev, 
        twoFactorEnabled: false, 
        twoFactorMethod: data.twoFactorMethod || prev.twoFactorMethod,
        hasConfigured2FA: data.hasConfigured2FA !== undefined ? data.hasConfigured2FA : true
      }))
    }
    return data
  }

  async function reEnable2FA(tokenCode) {
    const res = await fetch(getApiUrl('/api/auth/2fa/re-enable'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token: tokenCode })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setUser(prev => ({ 
        ...prev, 
        twoFactorEnabled: true, 
        twoFactorMethod: data.twoFactorMethod || prev.twoFactorMethod,
        hasConfigured2FA: true
      }))
    }
    return data
  }

  async function reset2FA(password) {
    const res = await fetch(getApiUrl('/api/auth/2fa/reset'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setUser(prev => ({ 
        ...prev, 
        twoFactorEnabled: false, 
        twoFactorMethod: null,
        hasConfigured2FA: false
      }))
    }
    return data
  }

  async function register(username, email, password) {
    const res = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    const data = await res.json()
    if (data.success) {
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      // Redirect to home page after successful registration
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  function hasRole(role) {
    if (!user) return false
    const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : [])
    return userRoles.includes(role)
  }

  function hasAnyRole(roles) {
    if (!user) return false
    const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : [])
    return roles.some(role => userRoles.includes(role))
  }

  const value = {
    user,
    token,
    loading,
    login,
    verify2FA,
    setupAuthenticator2FA,
    verifySetupAuthenticator2FA,
    setupEmail2FA,
    verifySetupEmail2FA,
    disable2FA,
    reEnable2FA,
    reset2FA,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    isAdmin: hasAnyRole(['admin', 'superadmin']),
    isSuperAdmin: hasRole('superadmin'),
    isOrderManager: hasRole('ordermanager'),
    isDelivery: hasRole('delivery')
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

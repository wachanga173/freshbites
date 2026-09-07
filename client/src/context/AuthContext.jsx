import { createContext, useState, useContext, useEffect } from 'react'
import { getApiUrl } from '../config/api'
import { navigateTo } from '../utils/navigation'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('Failed to parse cached user:', err)
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => getStoredUser())
  // Only show full loading spinner if we have a token but haven't cached the user yet
  const [loading, setLoading] = useState(() => !getStoredUser() && !!localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      fetchUser(token)
    } else {
      setUser(null)
      localStorage.removeItem('user')
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function fetchUser(activeToken = token) {
    if (!activeToken) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      } else if (res.status === 401 || res.status === 403) {
        // Token is genuinely invalid or expired
        logout()
      } else {
        console.warn(`Auth check returned HTTP ${res.status}; retaining cached session.`)
      }
    } catch (err) {
      // Network failure, offline mode, or aborted request - do not destroy active session
      console.warn('Network issue during auth verification; retaining cached session:', err.message)
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
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setLoading(false)
      navigateTo('/')
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
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setLoading(false)
      navigateTo('/')
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
      setUser(prev => {
        const updated = { ...prev, twoFactorEnabled: true, twoFactorMethod: 'authenticator' }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
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
      setUser(prev => {
        const updated = { ...prev, twoFactorEnabled: true, twoFactorMethod: 'email' }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
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
      setUser(prev => {
        const updated = { 
          ...prev, 
          twoFactorEnabled: false, 
          twoFactorMethod: data.twoFactorMethod || prev?.twoFactorMethod,
          hasConfigured2FA: data.hasConfigured2FA !== undefined ? data.hasConfigured2FA : true
        }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
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
      setUser(prev => {
        const updated = { 
          ...prev, 
          twoFactorEnabled: true, 
          twoFactorMethod: data.twoFactorMethod || prev?.twoFactorMethod,
          hasConfigured2FA: true
        }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
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
      setUser(prev => {
        const updated = { 
          ...prev, 
          twoFactorEnabled: false, 
          twoFactorMethod: null,
          hasConfigured2FA: false
        }
        localStorage.setItem('user', JSON.stringify(updated))
        return updated
      })
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
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      setLoading(false)
      navigateTo('/')
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    navigateTo('/')
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

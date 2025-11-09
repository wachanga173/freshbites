import { createContext, useState, useContext, useEffect } from 'react'
import { getApiUrl } from '../config/api';

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
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.error }
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
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Helper function to check if user has a specific role
  function hasRole(role) {
    if (!user) return false
    const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : [])
    return userRoles.includes(role)
  }

  // Helper function to check if user has any of the specified roles
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './RoleSwitcher.css'

export default function RoleSwitcher() {
  const { user } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  
  // Get user roles (ensure it's an array)
  const userRoles = Array.isArray(user?.roles) ? user.roles : []
  
  // If user has only one role, don't show switcher
  if (userRoles.length <= 1) {
    return null
  }

  const getRoleIcon = (role) => {
    const icons = {
      customer: '🛒',
      admin: '👨‍💼',
      superadmin: '⭐',
      ordermanager: '📋',
      delivery: '🚴'
    }
    return icons[role] || '👤'
  }

  const getRoleLabel = (role) => {
    const labels = {
      customer: 'Customer',
      admin: 'Admin',
      superadmin: 'Super Admin',
      ordermanager: 'Order Manager',
      delivery: 'Delivery'
    }
    return labels[role] || role
  }

  const getRolePath = (role) => {
    const paths = {
      customer: '/',
      admin: '/admin',
      superadmin: '/admin',
      ordermanager: '/order-management',
      delivery: '/delivery'
    }
    return paths[role] || '/'
  }

  const handleRoleSwitch = (role) => {
    const path = getRolePath(role)
    window.history.pushState({}, '', path)
    window.location.href = path // Trigger navigation
    setShowDropdown(false)
  }

  // Determine current role based on current path
  const getCurrentRole = () => {
    const path = window.location.pathname
    if (path === '/admin') return userRoles.includes('superadmin') ? 'superadmin' : 'admin'
    if (path === '/order-management') return 'ordermanager'
    if (path === '/delivery') return 'delivery'
    return 'customer'
  }

  const currentRole = getCurrentRole()

  return (
    <div className="role-switcher">
      <button 
        className="current-role-btn"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="role-icon">{getRoleIcon(currentRole)}</span>
        <span className="role-text">
          Viewing as: <strong>{getRoleLabel(currentRole)}</strong>
        </span>
        <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
      </button>

      {showDropdown && (
        <div className="role-dropdown">
          <div className="dropdown-header">Switch to:</div>
          {userRoles.map(role => (
            <button
              key={role}
              className={`role-option ${role === currentRole ? 'active' : ''}`}
              onClick={() => handleRoleSwitch(role)}
            >
              <span className="role-icon">{getRoleIcon(role)}</span>
              <span>{getRoleLabel(role)}</span>
              {role === currentRole && <span className="check-mark">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

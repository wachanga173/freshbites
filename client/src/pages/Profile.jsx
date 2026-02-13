import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import './Auth.css'

export default function Profile() {
  const { user, logout } = useAuth()

  if (!user) {
    window.location.href = '/login'
    return null
  }

  // Get user roles
  const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['customer'])

  const getRoleIcon = (role) => {
    const icons = {
      customer: '🛒',
      admin: '👨‍💼',
      superadmin: '⭐',
      ordermanager: '📋',
      delivery: '🚴',
      feedback_manager: '💬'
    }
    return icons[role] || '👤'
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
              className="text-xl sm:text-2xl font-bold text-purple-600"
            >
              Fresh Bites Café
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all"
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-12 text-white text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-5xl">
              👤
            </div>
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-purple-100">{user.email}</p>
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {/* Account Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📋</span> Account Information
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
                <span>⭐</span> Your Roles & Dashboards
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userRoles.map(role => (
                  <div 
                    key={role}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg cursor-pointer"
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
                      <div className="text-purple-600 text-2xl">→</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {userRoles.length > 1 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> You have multiple roles! Use the Role Switcher at the top of any page to quickly switch between your dashboards.
                  </p>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/my-orders'}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-left group"
                >
                  <div className="text-3xl">📦</div>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-purple-600">My Orders</div>
                    <div className="text-sm text-gray-600">View order history</div>
                  </div>
                </button>
                <button
                  onClick={() => window.location.href = '/menu'}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-left group"
                >
                  <div className="text-3xl">🍽️</div>
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-purple-600">Browse Menu</div>
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
                🚪 Logout
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

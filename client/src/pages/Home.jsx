import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Footer from '../components/Footer'
import RoleSwitcher from '../components/RoleSwitcher'

export default function Home() {
  const { user, logout } = useAuth()
  const [showMobileNav, setShowMobileNav] = useState(false)

  const handleMenuClick = () => {
    window.history.pushState({}, '', '/menu')
    window.location.reload()
  }

  const handleContactClick = () => {
    window.history.pushState({}, '', '/contact')
    window.location.reload()
  }

  const handleAboutClick = () => {
    window.history.pushState({}, '', '/about')
    window.location.reload()
  }

  const handleLoginClick = () => {
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Role Switcher for logged-in users */}
      {user && <RoleSwitcher />}
      
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 flex-shrink-0">Fresh Bites Café</div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden flex flex-col gap-1.5 p-2 ml-auto bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
              onClick={() => setShowMobileNav(!showMobileNav)}
              aria-label="Toggle menu"
            >
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
            </button>

            {/* Desktop Navigation - Scrollable left section */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-1">
              <button onClick={() => window.location.href = '/'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Home</button>
              <button onClick={handleMenuClick} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Menu</button>
              <button onClick={handleAboutClick} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">About</button>
              <button onClick={handleContactClick} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Contact</button>
              {user && (
                <button onClick={() => window.location.href = '/my-orders'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">My Orders</button>
              )}
            </div>

            {/* Login/Logout - Fixed on right */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                <button onClick={logout} className="px-4 py-2 text-sm lg:text-base font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap">Logout</button>
              ) : (
                <>
                  <button onClick={handleLoginClick} className="px-4 py-2 text-sm lg:text-base font-semibold text-purple-600 border-2 border-purple-600 rounded-full hover:bg-purple-50 hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap">Login</button>
                  <button onClick={() => window.location.href = '/register'} className="px-4 py-2 text-sm lg:text-base font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap">Sign Up</button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {showMobileNav && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg flex flex-col p-4 space-y-2 border-t z-50">
              <button onClick={() => { window.location.href = '/'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all">Home</button>
              <button onClick={() => { handleMenuClick(); setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all">Menu</button>
              <button onClick={() => { handleAboutClick(); setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all">About</button>
              <button onClick={() => { handleContactClick(); setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all">Contact</button>
              {user ? (
                <>
                  <button onClick={() => { window.location.href = '/my-orders'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all">My Orders</button>
                  <button onClick={() => { logout(); setShowMobileNav(false) }} className="px-4 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-all">Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { handleLoginClick(); setShowMobileNav(false) }} className="px-4 py-3 font-semibold text-purple-600 border-2 border-purple-600 rounded-md hover:bg-purple-50 transition-all">Login</button>
                  <button onClick={() => { window.location.href = '/register'; setShowMobileNav(false) }} className="px-4 py-3 font-semibold text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-all">Sign Up</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white py-16 sm:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/A_modern,_stylish_café_interior_with_wooden_accent.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 drop-shadow-lg tracking-tight">Welcome to Fresh Bites Café</h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 opacity-95 drop-shadow-md">Delicious meals, delivered fresh to your door</p>
          <button onClick={handleMenuClick} className="inline-block px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold bg-purple-600 text-white rounded-full hover:-translate-y-1 hover:shadow-2xl hover:bg-purple-700 transition-all shadow-xl">
            Explore Menu
          </button>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">Our Story</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
            At Fresh Bites Café, we believe that great food brings people together. What started as a small passion project has evolved into a thriving community hub, serving delicious, freshly-prepared meals to food lovers across the region.
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed mb-6">
            Our journey began with a simple vision: to make quality, restaurant-grade food accessible to everyone, delivered right to their doorstep. Today, we continue to evolve, constantly improving our menu, service, and technology to serve you better.
          </p>
          <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
            From farm-fresh ingredients to cutting-edge delivery tracking, we&apos;re committed to excellence at every step. Join us in this delicious journey and experience the Fresh Bites difference!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Fresh Ingredients</h3>
              <p className="text-sm sm:text-base text-gray-600">Locally sourced, always fresh</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="text-5xl sm:text-6xl mb-4">🚚</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Fast Delivery</h3>
              <p className="text-sm sm:text-base text-gray-600">Hot meals delivered on time</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="text-5xl sm:text-6xl mb-4">⭐</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Quality Service</h3>
              <p className="text-sm sm:text-base text-gray-600">Exceptional customer experience</p>
            </div>
            <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl hover:-translate-y-2 hover:shadow-xl transition-all">
              <div className="text-5xl sm:text-6xl mb-4">💳</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Secure Payment</h3>
              <p className="text-sm sm:text-base text-gray-600">Safe and easy checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Preview */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 text-gray-800">Popular Items</h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12">Try our customer favorites</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all">
              <div className="text-6xl sm:text-7xl mb-4">🍔</div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Classic Burger</h4>
              <p className="text-sm sm:text-base text-gray-600">Juicy beef patty with fresh toppings</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all">
              <div className="text-6xl sm:text-7xl mb-4">🍝</div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Pasta Carbonara</h4>
              <p className="text-sm sm:text-base text-gray-600">Creamy Italian classic</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all">
              <div className="text-6xl sm:text-7xl mb-4">🍰</div>
              <h4 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Chocolate Cake</h4>
              <p className="text-sm sm:text-base text-gray-600">Rich and decadent dessert</p>
            </div>
          </div>
          <button onClick={handleMenuClick} className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold bg-purple-600 text-white rounded-full hover:-translate-y-1 hover:shadow-2xl hover:bg-purple-700 transition-all shadow-lg">
            View Full Menu
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

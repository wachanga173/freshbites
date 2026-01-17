import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import MenuItem from '../components/MenuItem'
import Cart from '../components/Cart'
import { getApiUrl } from '../config/api'

export default function Menu() {
  const { user, logout } = useAuth()
  const [menu, setMenu] = useState({ 
    appetizers: [], 
    breakfast: [], 
    lunch: [], 
    dinner: [], 
    desserts: [], 
    snacks: [], 
    drinks: [] 
  })
  const [cartItems, setCartItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [showCart, setShowCart] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(getApiUrl('/api/menu'))
      .then(r => {
        if (!r.ok) throw new Error(`Menu endpoint returned ${r.status}`)
        return r.json()
      })
      .then(data => {
        setMenu(data)
      })
      .catch(err => {
        setMessage(`Could not load menu: ${err.message}`)
      })
  }, [])

  const categories = [
    { id: 'all', name: 'All Menu', icon: '🍽️' },
    { id: 'appetizers', name: 'Appetizers', icon: '🥟' },
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'lunch', name: 'Lunch', icon: '🍔' },
    { id: 'dinner', name: 'Dinner', icon: '🍖' },
    { id: 'desserts', name: 'Desserts', icon: '🍰' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
    { id: 'drinks', name: 'Drinks', icon: '☕' }
  ]

  const filteredMenu = activeCategory === 'all' 
    ? [...menu.appetizers, ...menu.breakfast, ...menu.lunch, ...menu.dinner, ...menu.desserts, ...menu.snacks, ...menu.drinks]
    : menu[activeCategory] || []

  const addToCart = (item) => {
    if (!user) {
      setMessage('Please login to add items to cart')
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
      return
    }
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setMessage(`${item.name} added to cart!`)
    setTimeout(() => setMessage(''), 2000)
  }

  const removeFromCart = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index, delta) => {
    setCartItems(prev => {
      const updated = [...prev]
      updated[index].quantity += delta
      if (updated[index].quantity <= 0) {
        return updated.filter((_, i) => i !== index)
      }
      return updated
    })
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setMessage('Please add items to your cart')
      return
    }
    window.location.href = '/checkout'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="text-xl sm:text-2xl font-bold text-purple-600 flex-shrink-0">Fresh Bites Café</div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden flex flex-col gap-1.5 p-1 ml-auto"
              onClick={() => setShowMobileNav(!showMobileNav)}
            >
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
              <span className="w-6 h-0.5 bg-gray-800 rounded transition-all"></span>
            </button>

            {/* Desktop Navigation - Scrollable left section */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3 overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-1">
              <button onClick={() => window.location.href = '/'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Home</button>
              <button onClick={() => window.location.href = '/menu'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Menu</button>
              <button onClick={() => window.location.href = '/about'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">About</button>
              <button onClick={() => window.location.href = '/contact'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">Contact</button>
              {user && (
                <button onClick={() => window.location.href = '/my-orders'} className="px-3 py-2 text-sm lg:text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-purple-600 rounded-md transition-all whitespace-nowrap">My Orders</button>
              )}
            </div>

            {/* Login/Logout - Fixed on right */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <button onClick={logout} className="px-4 py-2 text-sm lg:text-base font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap">Logout</button>
              ) : (
                <button onClick={() => window.location.href = '/login'} className="px-4 py-2 text-sm lg:text-base font-semibold text-white bg-purple-600 rounded-full hover:bg-purple-700 hover:-translate-y-0.5 transition-all shadow-md whitespace-nowrap">Login</button>
              )}
            </div>

            {/* Cart Button */}
            <button 
              className="flex-shrink-0 bg-purple-600 text-white rounded-full w-11 h-11 flex items-center justify-center hover:bg-purple-700 hover:scale-105 transition-all shadow-lg relative ml-2"
              onClick={() => {
                if (!user) {
                  window.location.href = '/login'
                  return
                }
                setShowCart(!showCart)
              }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {showMobileNav && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg flex flex-col p-4 space-y-2 border-t">
              <button onClick={() => { window.location.href = '/'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-all">Home</button>
              <button onClick={() => { window.location.href = '/menu'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-all">Menu</button>
              <button onClick={() => { window.location.href = '/about'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-all">About</button>
              <button onClick={() => { window.location.href = '/contact'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-all">Contact</button>
              {user ? (
                <>
                  <button onClick={() => { window.location.href = '/my-orders'; setShowMobileNav(false) }} className="px-4 py-3 text-left font-medium text-gray-700 hover:bg-gray-100 hover:text-primary rounded-md transition-all">My Orders</button>
                  <button onClick={() => { logout(); setShowMobileNav(false) }} className="px-4 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-all">Logout</button>
                </>
              ) : (
                <button onClick={() => { window.location.href = '/login'; setShowMobileNav(false) }} className="px-4 py-3 font-semibold text-white bg-primary rounded-md hover:bg-primary-dark transition-all">Login</button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="relative bg-gray-900 text-white text-center py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 drop-shadow-lg">Our Menu</h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-95 drop-shadow-md">Explore our delicious selection</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b-2 border-gray-200 py-4 sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-primary hover:text-primary hover:-translate-y-0.5'
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="text-lg sm:text-xl">{cat.icon}</span>
                <span className="text-sm sm:text-base">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-24 right-4 sm:right-6 bg-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-xl z-50 animate-slide-in-right">
          {message}
        </div>
      )}

      {/* Menu Grid */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-gray-800">
            {categories.find(c => c.id === activeCategory)?.name || 'Menu'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredMenu.length > 0 ? (
              filteredMenu.map(item => (
                <MenuItem 
                  key={item.id} 
                  item={item} 
                  onAddToCart={addToCart}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-600 text-lg py-12">No items available in this category</p>
            )}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in" onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 w-full sm:w-96 max-w-full h-full bg-white shadow-2xl z-50 flex flex-col animate-slide-in-from-right">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b-2 border-gray-200 bg-gray-50">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Your Cart</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-600 hover:text-red-500 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Cart 
                items={cartItems}
                onRemove={removeFromCart}
                onCheckout={handleCheckout}
                onUpdateQuantity={updateQuantity}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-purple-400">Fresh Bites Café</h4>
              <p className="text-sm sm:text-base text-gray-300">Quality food delivered to your doorstep</p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-purple-400">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => window.location.href = '/'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">Home</button>
                <button onClick={() => window.location.href = '/menu'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">Menu</button>
                <button onClick={() => window.location.href = '/about'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">About</button>
                <button onClick={() => window.location.href = '/contact'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">Contact</button>
                <button onClick={() => window.location.href = '/privacy'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">Privacy Policy</button>
                <button onClick={() => window.location.href = '/terms'} className="block w-full sm:w-auto text-left text-sm sm:text-base text-gray-300 hover:text-purple-400 transition-colors">Terms & Conditions</button>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="text-lg sm:text-xl font-semibold mb-4 text-purple-400">Contact</h4>
              <p className="text-sm sm:text-base text-gray-300 mb-2">Email: info@freshbitescafe.com</p>
              <p className="text-sm sm:text-base text-gray-300">Location: Kenya</p>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-700">
            <p className="text-sm sm:text-base text-gray-400">&copy; 2026 Fresh Bites Café. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import MenuItem from '../components/MenuItem'
import Cart from '../components/Cart'
import Footer from '../components/Footer'
import RoleSwitcher from '../components/RoleSwitcher'
import { getApiUrl } from '../config/api'

const CART_STORAGE_KEY = 'freshbites-cart'

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
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      }
    } catch (err) {
      console.error('Failed to restore cart from storage:', err)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    fetch(getApiUrl('/api/menu'))
      .then(r => {
        if (!r.ok) throw new Error('Server error')
        const contentType = r.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server unavailable')
        }
        return r.json()
      })
      .then(data => {
        setMenu(data)
      })
      .catch(err => {
        console.error('Menu fetch error:', err)
        setMessage('Could not load menu from server')
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

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    window.location.href = '/checkout'
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--color-bg-light)'}}>
      {user && <RoleSwitcher />}
      
      {/* Navigation Bar */}
      <nav className="site-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="nav-brand">Fresh Bites Café</div>
            
            <button 
              className="hamburger-toggle ml-auto"
              onClick={() => setShowMobileNav(!showMobileNav)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

            <div className="hidden md:flex items-center gap-1 lg:gap-2 overflow-x-auto flex-1 pb-1">
              <button onClick={() => window.location.href = '/'} className="nav-link">Home</button>
              <button onClick={() => window.location.href = '/menu'} className="nav-link active">Menu</button>
              <button onClick={() => window.location.href = '/about'} className="nav-link">About</button>
              <button onClick={() => window.location.href = '/contact'} className="nav-link">Contact</button>
              {user && (
                <>
                  <button onClick={() => window.location.href = '/my-orders'} className="nav-link">My Orders</button>
                  <button onClick={() => window.location.href = '/profile'} className="nav-profile-btn">👤 Profile</button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                <button onClick={logout} className="nav-btn-solid">Logout</button>
              ) : (
                <>
                  <button onClick={() => window.location.href = '/login'} className="nav-btn-outline">Login</button>
                  <button onClick={() => window.location.href = '/register'} className="nav-btn-solid">Sign Up</button>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button 
              className="cart-btn-nav ml-2"
              onClick={() => {
                if (!user) {
                  window.location.href = '/login'
                  return
                }
                setShowCart(!showCart)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartItems.length > 0 && (
                <span className="cart-badge">{cartItems.length}</span>
              )}
            </button>
          </div>

          {showMobileNav && (
            <div className="mobile-nav-dropdown">
              <button onClick={() => { window.location.href = '/'; setShowMobileNav(false) }} className="nav-link">Home</button>
              <button onClick={() => { window.location.href = '/menu'; setShowMobileNav(false) }} className="nav-link active">Menu</button>
              <button onClick={() => { window.location.href = '/about'; setShowMobileNav(false) }} className="nav-link">About</button>
              <button onClick={() => { window.location.href = '/contact'; setShowMobileNav(false) }} className="nav-link">Contact</button>
              {user ? (
                <>
                  <button onClick={() => { window.location.href = '/my-orders'; setShowMobileNav(false) }} className="nav-link">📦 My Orders</button>
                  <button onClick={() => { window.location.href = '/profile'; setShowMobileNav(false) }} className="nav-profile-btn">👤 My Profile</button>
                  <button onClick={() => { logout(); setShowMobileNav(false) }} className="nav-btn-solid" style={{width: '100%', marginTop: '8px'}}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { window.location.href = '/login'; setShowMobileNav(false) }} className="nav-btn-outline" style={{width: '100%', marginTop: '8px'}}>Login</button>
                  <button onClick={() => { window.location.href = '/register'; setShowMobileNav(false) }} className="nav-btn-solid" style={{width: '100%'}}>Sign Up</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="relative text-white text-center py-20 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, rgba(27,27,31,0.82) 0%, rgba(45,45,51,0.72) 100%)'}}></div>
        <div className="relative z-10">
          <p className="text-sm font-medium mb-3 tracking-widest uppercase" style={{color: 'var(--color-accent)', fontFamily: 'var(--font-body)'}}>Explore</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 drop-shadow-lg" style={{fontFamily: 'var(--font-heading)'}}>Our Menu</h1>
          <p className="text-base sm:text-lg lg:text-xl opacity-90 drop-shadow-md" style={{fontFamily: 'var(--font-body)'}}>Discover our delicious selection</p>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="py-4 sticky top-[73px] z-40" style={{background: 'var(--color-surface-glass)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--color-border)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-600 hover:-translate-y-0.5'
                }`}
                style={activeCategory !== cat.id ? {background: 'var(--color-surface)', border: '1px solid var(--color-border)'} : {}}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="text-lg sm:text-xl">{cat.icon}</span>
                <span className="text-sm sm:text-base" style={{fontFamily: 'var(--font-body)'}}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-24 right-4 sm:right-6 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-xl z-50 animate-slide-in-right" style={{background: 'var(--color-success)', fontFamily: 'var(--font-body)'}}>
          {message}
        </div>
      )}

      {/* Menu Grid */}
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8" style={{color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)'}}>
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
              <p className="col-span-full text-center text-lg py-12" style={{color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)'}}>No items available in this category</p>
            )}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="fixed inset-0 z-50 animate-fade-in" style={{background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'}} onClick={() => setShowCart(false)} />
          <div className="fixed right-0 top-0 w-full sm:w-96 max-w-full h-full shadow-2xl z-50 flex flex-col animate-slide-in-from-right" style={{background: 'var(--color-surface)'}}>
            <div className="flex justify-between items-center p-4 sm:p-6" style={{borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-light)'}}>
              <h3 className="text-xl sm:text-2xl font-bold" style={{color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)'}}>Your Cart</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100">
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

      <Footer />
    </div>
  )
}

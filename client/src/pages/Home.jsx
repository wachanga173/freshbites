import { User, Package, Utensils, Truck, Star, CreditCard, Beef, Coffee } from 'lucide-react'
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
              <button onClick={() => window.location.href = '/'} className="nav-link active">Home</button>
              <button onClick={handleMenuClick} className="nav-link">Menu</button>
              <button onClick={handleAboutClick} className="nav-link">About</button>
              <button onClick={handleContactClick} className="nav-link">Contact</button>
              {user && (
                <>
                  <button onClick={() => window.location.href = '/my-orders'} className="nav-link">My Orders</button>
                  <button onClick={() => window.location.href = '/profile'} className="nav-profile-btn"><User size={18} className="inline-block mr-1" /> Profile</button>
                </>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {user ? (
                <button onClick={logout} className="nav-btn-solid">Logout</button>
              ) : (
                <>
                  <button onClick={handleLoginClick} className="nav-btn-outline">Login</button>
                  <button onClick={() => window.location.href = '/register'} className="nav-btn-solid">Sign Up</button>
                </>
              )}
            </div>
          </div>

          {showMobileNav && (
            <div className="mobile-nav-dropdown">
              <button onClick={() => { window.location.href = '/'; setShowMobileNav(false) }} className="nav-link active">Home</button>
              <button onClick={() => { handleMenuClick(); setShowMobileNav(false) }} className="nav-link">Menu</button>
              <button onClick={() => { handleAboutClick(); setShowMobileNav(false) }} className="nav-link">About</button>
              <button onClick={() => { handleContactClick(); setShowMobileNav(false) }} className="nav-link">Contact</button>
              {user ? (
                <>
                  <button onClick={() => { window.location.href = '/my-orders'; setShowMobileNav(false) }} className="nav-link"><Package size={18} className="inline-block mr-1" /> My Orders</button>
                  <button onClick={() => { window.location.href = '/profile'; setShowMobileNav(false) }} className="nav-profile-btn"><User size={18} className="inline-block mr-1" /> My Profile</button>
                  <button onClick={() => { logout(); setShowMobileNav(false) }} className="nav-btn-solid" style={{width: '100%', marginTop: '8px'}}>Logout</button>
                </>
              ) : (
                <>
                  <button onClick={() => { handleLoginClick(); setShowMobileNav(false) }} className="nav-btn-outline" style={{width: '100%', marginTop: '8px'}}>Login</button>
                  <button onClick={() => { window.location.href = '/register'; setShowMobileNav(false) }} className="nav-btn-solid" style={{width: '100%'}}>Sign Up</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/A_modern,_stylish_café_interior_with_wooden_accent.png')] bg-cover bg-center"></div>
        <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, rgba(27,27,31,0.82) 0%, rgba(45,45,51,0.72) 100%)'}}></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
          <p className="text-sm sm:text-base font-medium mb-4 tracking-widest uppercase" style={{color: 'var(--color-accent)', fontFamily: 'var(--font-body)'}}>Welcome to</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 drop-shadow-lg" style={{fontFamily: 'var(--font-heading)', letterSpacing: '-0.03em', lineHeight: '1.1'}}>
            Fresh Bites Café
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-10 font-light" style={{opacity: 0.9, fontFamily: 'var(--font-body)', maxWidth: '540px', margin: '0 auto 2.5rem'}}>
            Delicious meals crafted with passion, delivered fresh to your door
          </p>
          <button onClick={handleMenuClick} className="inline-block px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-white rounded-full transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl" style={{background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)', fontFamily: 'var(--font-body)'}}>
            Explore Our Menu →
          </button>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 lg:py-24" style={{background: 'linear-gradient(180deg, var(--color-bg-light) 0%, var(--color-accent-light) 50%, var(--color-bg-light) 100%)'}}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{color: 'var(--color-accent-dark)', fontFamily: 'var(--font-body)'}}>Our Story</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8" style={{fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)'}}>Crafted with Care, Served with Love</h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6" style={{fontFamily: 'var(--font-body)'}}>
            At Fresh Bites Café, we believe that great food brings people together. What started as a small passion project has evolved into a thriving community hub, serving delicious, freshly-prepared meals to food lovers across the region.
          </p>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-6" style={{fontFamily: 'var(--font-body)'}}>
            From farm-fresh ingredients to cutting-edge delivery tracking, we&apos;re committed to excellence at every step. Join us and experience the Fresh Bites difference!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24" style={{background: 'var(--color-surface)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{color: 'var(--color-accent-dark)', fontFamily: 'var(--font-body)'}}>Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)'}}>The Fresh Bites Experience</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: <Utensils size={18} className="inline-block mr-1" />, title: 'Fresh Ingredients', desc: 'Locally sourced, always fresh' },
              { icon: <Truck size={18} className="inline-block mr-1" />, title: 'Fast Delivery', desc: 'Hot meals delivered on time' },
              { icon: <Star size={18} className="inline-block mr-1" />, title: 'Quality Service', desc: 'Exceptional customer experience' },
              { icon: <CreditCard size={18} className="inline-block mr-1" />, title: 'Secure Payment', desc: 'Safe and easy checkout' }
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 sm:p-10 rounded-2xl transition-all duration-300 hover:-translate-y-2 cursor-default" style={{background: 'var(--color-bg-light)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)'}}>
                <div className="text-5xl sm:text-6xl mb-5">{feature.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)'}}>{feature.title}</h3>
                <p className="text-sm sm:text-base" style={{color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)'}}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Preview */}
      <section className="py-16 sm:py-20 lg:py-24 text-center" style={{background: 'var(--color-bg-light)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{color: 'var(--color-accent-dark)', fontFamily: 'var(--font-body)'}}>Customer Favorites</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)'}}>Popular Items</h2>
          <p className="text-base sm:text-lg mb-10 sm:mb-14" style={{color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)'}}>Try our most-loved dishes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-10 sm:mb-14">
            {[
              { icon: <Beef size={48} className="text-accent" />, name: 'Classic Burger', desc: 'Juicy beef patty with fresh toppings' },
              { icon: <Utensils size={48} className="text-accent" />, name: 'Pasta Carbonara', desc: 'Creamy Italian classic' },
              { icon: <Coffee size={48} className="text-accent" />, name: 'Chocolate Cake', desc: 'Rich and decadent dessert' }
            ].map((item, i) => (
              <div key={i} className="p-8 sm:p-10 rounded-2xl transition-all duration-300 hover:-translate-y-2 cursor-default" style={{background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)'}}>
                <div className="text-6xl sm:text-7xl mb-5">{item.icon}</div>
                <h4 className="text-lg sm:text-xl font-semibold mb-2" style={{color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)'}}>{item.name}</h4>
                <p className="text-sm sm:text-base" style={{color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)'}}>{item.desc}</p>
              </div>
            ))}
          </div>
          <button onClick={handleMenuClick} className="px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-semibold text-white rounded-full transition-all hover:-translate-y-1 hover:shadow-2xl" style={{background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%)', boxShadow: 'var(--shadow-lg)', fontFamily: 'var(--font-body)'}}>
            View Full Menu →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

import { useState, useEffect, useMemo } from 'react'
import { getApiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'
import './Checkout.css'

export default function Checkout({ items, total, onBack, onSuccess }) {
  const { user: _user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [orderType, setOrderType] = useState('dine-in') // 'delivery', 'pickup', 'dine-in'
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    phone: '',
    instructions: '',
    latitude: null,
    longitude: null
  })
  const [shippingFee, setShippingFee] = useState(0)
  const [hasDeliveryItems, setHasDeliveryItems] = useState(false)
  const [availableOrderTypes, setAvailableOrderTypes] = useState(['dine-in', 'pickup', 'delivery'])

  const safeItems = useMemo(() => Array.isArray(items) ? items : [], [items])
  
  // Determine available order types based on items in cart
  useEffect(() => {
    if (safeItems.length === 0) {
      setAvailableOrderTypes(['dine-in'])
      return
    }

    // Get order categories from all items
    // An order type is available only if ALL items support it
    const itemOrderCategories = safeItems.map(item => {
      // Handle both array and string formats for backward compatibility
      if (Array.isArray(item.orderCategory)) {
        return item.orderCategory
      } else if (item.orderCategory) {
        return [item.orderCategory]
      } else if (item.deliverable) {
        return ['dine-in', 'pickup', 'delivery']
      } else {
        return ['dine-in', 'pickup']
      }
    })

    // Find common order types across all items
    const commonOrderTypes = itemOrderCategories.reduce((common, itemCategories) => {
      return common.filter(type => itemCategories.includes(type))
    }, ['dine-in', 'pickup', 'delivery'])
    
    setAvailableOrderTypes(commonOrderTypes.length > 0 ? commonOrderTypes : ['dine-in'])

    // Auto-select the first available option if current selection is not available
    if (commonOrderTypes.length > 0 && !commonOrderTypes.includes(orderType)) {
      setOrderType(commonOrderTypes[0] || 'dine-in')
    }
  }, [safeItems, orderType])
  
  // Check if cart contains delivery items and calculate shipping fee
  useEffect(() => {
    const deliveryItems = safeItems.filter(item => item.deliverable)
    setHasDeliveryItems(deliveryItems.length > 0)
    
    // Calculate shipping fee based on items (you can customize this logic)
    if (orderType === 'delivery' && deliveryItems.length > 0) {
      setShippingFee(200) // Base shipping fee
    } else {
      setShippingFee(0)
    }
  }, [orderType, safeItems])

  // Get user's location for delivery
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDeliveryAddress(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Unable to get your location. Please enable location services.')
        }
      )
    }
  }
  const handlePayPalPayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Validate order type is selected
      if (!orderType) {
        setError('Please select an order type (Dine In, Pickup, or Delivery)')
        setLoading(false)
        return
      }

      // Validate order type is available
      if (!availableOrderTypes.includes(orderType)) {
        setError('Selected order type is not available for items in your cart')
        setLoading(false)
        return
      }

      // Validate delivery address if order type is delivery
      if (orderType === 'delivery' && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone)) {
        setError('Please fill in all delivery address fields')
        setLoading(false)
        return
      }

      // Prepare order details to store for use after PayPal redirect
      const orderDetails = {
        items: safeItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          deliverable: item.deliverable || false
        })),
        total: total,
        shippingFee: shippingFee,
        orderType: orderType,
        deliveryType: orderType === 'delivery' ? 'delivery' : 'pickup',
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : null
      }
      localStorage.setItem('pendingOrderDetails', JSON.stringify(orderDetails))

      // Create PayPal payment
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/payment/paypal/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderDetails)
      })

      const data = await response.json()
      
      if (data.success && data.approvalUrl) {
        // Redirect to PayPal for approval
        window.location.href = data.approvalUrl
      } else {
        setError(data.error || 'Failed to create PayPal payment')
      }
    } catch (err) {
      setError('Payment initialization failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone || mpesaPhone.length < 10) {
      setError('Please enter a valid M-Pesa phone number')
      return
    }

    // Validate order type is selected
    if (!orderType) {
      setError('Please select an order type (Dine In, Pickup, or Delivery)')
      return
    }

    // Validate order type is available
    if (!availableOrderTypes.includes(orderType)) {
      setError('Selected order type is not available for items in your cart')
      return
    }

    // Validate delivery address if order type is delivery
    if (orderType === 'delivery' && (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.phone)) {
      setError('Please fill in all delivery address fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/payment/mpesa/stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: mpesaPhone,
          amount: Math.round(total),
          shippingFee: shippingFee,
          orderType: orderType,
          deliveryType: orderType === 'delivery' ? 'delivery' : 'pickup',
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
          items: safeItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            deliverable: item.deliverable || false
          }))
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Show success message
        alert('Payment request sent! Please check your phone to complete the M-Pesa payment.')
        // Poll for payment status
        pollMpesaStatus(data.checkoutRequestID)
      } else {
        setError(data.error || 'Failed to initiate M-Pesa payment')
      }
    } catch (err) {
      setError('Payment initialization failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pollMpesaStatus = async (checkoutRequestID) => {
    let attempts = 0
    const maxAttempts = 20 // Poll for 1 minute (3 seconds * 20)

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setError('Payment confirmation timeout. Please check your M-Pesa messages.')
        return
      }

      try {
        const token = localStorage.getItem('token')
        const response = await fetch(getApiUrl(`/api/payment/mpesa/status/${checkoutRequestID}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()

        if (data.status === 'completed') {
          onSuccess(data.order)
          return
        } else if (data.status === 'failed') {
          setError('Payment failed. Please try again.')
          return
        }

        // Continue polling
        attempts++
        setTimeout(checkStatus, 3000)
      } catch (err) {
        setError('Error checking payment status')
      }
    }

    checkStatus()
  }

  const handlePayment = () => {
    if (!paymentMethod) {
      setError('Please select a payment method')
      return
    }

    if (paymentMethod === 'paypal') {
      handlePayPalPayment()
    } else if (paymentMethod === 'mpesa') {
      handleMpesaPayment()
    }
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBack}>← Back to Cart</button>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {/* Order Summary */}
          <section className="checkout-section">
            <h2>Order Summary</h2>
            <div className="order-items">
              {safeItems.map((item, idx) => (
                <div key={idx} className="checkout-item">
                  <img src={item.image} alt={item.name} className="checkout-item-img" />
                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                    {item.deliverable && <span className="delivery-badge">🚚 Deliverable</span>}
                  </div>
                  <div className="checkout-item-price">
                    KSH {(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Order Type Selection */}
          <section className="checkout-section">
            <h2>Order Type *</h2>
            <p className="info-text" style={{fontSize: '0.9em', color: '#666', marginBottom: '10px'}}>
              Select how you want to receive your order (based on available items)
            </p>
            
            {/* Selected Order Type Display */}
            {orderType && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#e8f5e9',
                border: '2px solid #4caf50',
                borderRadius: '8px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{fontSize: '1.2em'}}>✓</span>
                <span style={{fontWeight: '600', color: '#2e7d32'}}>
                  Selected: {orderType === 'dine-in' ? '🍽️ Dine In' : orderType === 'pickup' ? '🛍️ Pickup' : '🚚 Delivery'}
                  {orderType === 'dine-in' && ' - Eat at our restaurant'}
                  {orderType === 'pickup' && ' - Pick up your order'}
                  {orderType === 'delivery' && ' - Delivered to your location'}
                </span>
              </div>
            )}
            
            <div className="order-type-options">
              {availableOrderTypes.includes('dine-in') && (
                <div 
                  className={`order-type-card ${orderType === 'dine-in' ? 'selected' : ''}`}
                  onClick={() => setOrderType('dine-in')}
                  style={{position: 'relative'}}
                >
                  {orderType === 'dine-in' && (
                    <div style={{position: 'absolute', top: '10px', right: '10px', fontSize: '1.5em', color: '#4caf50'}}>✓</div>
                  )}
                  <div className="order-type-icon">🍽️</div>
                  <h3>Dine In</h3>
                  <p>Eat at our restaurant</p>
                </div>
              )}

              {availableOrderTypes.includes('pickup') && (
                <div 
                  className={`order-type-card ${orderType === 'pickup' ? 'selected' : ''}`}
                  onClick={() => setOrderType('pickup')}
                  style={{position: 'relative'}}
                >
                  {orderType === 'pickup' && (
                    <div style={{position: 'absolute', top: '10px', right: '10px', fontSize: '1.5em', color: '#4caf50'}}>✓</div>
                  )}
                  <div className="order-type-icon">🛍️</div>
                  <h3>Pickup</h3>
                  <p>Pick up your order</p>
                </div>
              )}

              {availableOrderTypes.includes('delivery') && (
                <div 
                  className={`order-type-card ${orderType === 'delivery' ? 'selected' : ''}`}
                  onClick={() => setOrderType('delivery')}
                  style={{position: 'relative'}}
                >
                  {orderType === 'delivery' && (
                    <div style={{position: 'absolute', top: '10px', right: '10px', fontSize: '1.5em', color: '#4caf50'}}>✓</div>
                  )}
                  <div className="order-type-icon">🚚</div>
                  <h3>Delivery</h3>
                  <p>Delivered to your location</p>
                </div>
              )}
            </div>
            {availableOrderTypes.length === 0 && (
              <p className="error-message">⚠️ No valid order type available for the items in your cart.</p>
            )}
            {!orderType && (
              <p className="error-message">⚠️ Please select an order type to continue.</p>
            )}
          </section>

          {/* Delivery Address - Only show for delivery orders */}
          {orderType === 'delivery' && hasDeliveryItems && (
            <section className="checkout-section">
              <h2>Delivery Address</h2>
              <div className="delivery-address-form">
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    id="street"
                    type="text"
                    placeholder="Enter your street address"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={deliveryAddress.city}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="delivery-phone">Phone Number *</label>
                  <input
                    id="delivery-phone"
                    type="tel"
                    placeholder="0712345678"
                    value={deliveryAddress.phone}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, phone: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="instructions">Delivery Instructions (Optional)</label>
                  <textarea
                    id="instructions"
                    placeholder="Any special instructions for delivery"
                    value={deliveryAddress.instructions}
                    onChange={(e) => setDeliveryAddress({...deliveryAddress, instructions: e.target.value})}
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                <button 
                  type="button" 
                  className="location-btn"
                  onClick={getUserLocation}
                >
                  📍 Get My Location
                </button>
                {deliveryAddress.latitude && deliveryAddress.longitude && (
                  <p className="location-confirmed">✓ Location captured</p>
                )}
              </div>
            </section>
          )}

          {/* Payment Method Selection */}
          <section className="checkout-section">
            <h2>Select Payment Method</h2>
            <div className="payment-methods">
              <div 
                className={'payment-card disabled'}
                style={{opacity: 0.6, cursor: 'not-allowed'}}
                title="Payment option will be integrated soon"
              >
                <div className="payment-icon">💳</div>
                <h3>PayPal</h3>
                <p>Payment option will be integrated soon</p>
                <span className="coming-soon-badge">Coming Soon</span>
              </div>

              <div 
                className={`payment-card ${paymentMethod === 'mpesa' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="payment-icon">📱</div>
                <h3>M-Pesa</h3>
                <p>Pay with M-Pesa STK Push</p>
              </div>
            </div>

            {/* M-Pesa Phone Input */}
            {paymentMethod === 'mpesa' && (
              <div className="mpesa-input-section">
                <label htmlFor="mpesa-phone">M-Pesa Phone Number</label>
                <input
                  id="mpesa-phone"
                  type="tel"
                  placeholder="07XXXXXXXX or 254XXXXXXXXX"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="mpesa-phone-input"
                />
                <small>Enter phone number starting with 07 or 254</small>
              </div>
            )}
          </section>

          {error && (
            <div className="checkout-error">
              {error}
            </div>
          )}
        </div>

        {/* Order Total Sidebar */}
        <aside className="checkout-sidebar">
          <div className="checkout-summary">
            <h3>Payment Details</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>KSH {total.toFixed(0)}</span>
            </div>
            {orderType === 'delivery' && shippingFee > 0 && (
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>KSH {shippingFee.toFixed(0)}</span>
              </div>
            )}
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>KSH {(total + shippingFee).toFixed(0)}</span>
            </div>

            <button 
              className="pay-now-btn"
              onClick={handlePayment}
              disabled={loading || !paymentMethod}
            >
              {loading ? 'Processing...' : `Pay KSH ${(total + shippingFee).toFixed(0)}`}
            </button>

            <div className="secure-payment">
              <span className="lock-icon">🔒</span>
              <small>Secure payment processing</small>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

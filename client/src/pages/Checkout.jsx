import { useState } from 'react'
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext'
import './Checkout.css'

export default function Checkout({ items, total, onBack, onSuccess }) {
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mpesaPhone, setMpesaPhone] = useState('')

  const safeItems = Array.isArray(items) ? items : []
  const handlePayPalPayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Create PayPal payment
      const token = localStorage.getItem('token')
  const response = await fetch(getApiUrl('/api/payment/paypal/create'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: safeItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: total
        })
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

    setLoading(true)
    setError('')

    try {
      let formattedPhone = mpesaPhone;
      if (/^07\d{8}$/.test(mpesaPhone)) {
        formattedPhone = '254' + mpesaPhone.slice(1);
      }
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/payment/mpesa/stkpush'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          amount: Math.round(total),
          items: safeItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Show success message
        alert('Payment request sent! Please check your phone to complete the M-Pesa payment.');
        // Poll for payment status
        pollMpesaStatus(data.checkoutRequestID);
      } else {
        setError(data.error || 'Failed to initiate M-Pesa payment');
      }
    } catch (err) {
      setError('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
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
                  </div>
                  <div className="checkout-item-price">
                    KSH {(item.price * item.quantity).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method Selection */}
          <section className="checkout-section">
            <h2>Select Payment Method</h2>
            <div className="payment-methods">
              <div 
                className={`payment-card ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="payment-icon">💳</div>
                <h3>PayPal</h3>
                <p>Pay securely with PayPal</p>
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
                  placeholder="254712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="mpesa-phone-input"
                />
                <small>Enter phone number in format: 254XXXXXXXXX</small>
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
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>KSH 200</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>KSH {(total + 200).toFixed(0)}</span>
            </div>

            <button 
              className="pay-now-btn"
              onClick={handlePayment}
              disabled={loading || !paymentMethod}
            >
              {loading ? 'Processing...' : `Pay KSH ${(total + 200).toFixed(0)}`}
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


import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import './PaymentResult.css'


export default function PaymentSuccess() {
  const { user } = useAuth();
  const [status, setStatus] = useState('processing');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Try to get order details from localStorage (set before redirect to PayPal)
  function getOrderDetailsFromStorage() {
    try {
      const data = localStorage.getItem('pendingOrderDetails');
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const PayerID = urlParams.get('PayerID');
    const orderDetails = getOrderDetailsFromStorage();

    if (paymentId && PayerID && orderDetails) {
      executePayment(paymentId, PayerID, orderDetails);
    } else {
      setError('Invalid payment parameters or missing order details');
      setStatus('error');
    }
  }, []);

  const executePayment = async (paymentId, PayerID, orderDetails) => {
    try {
      const token = localStorage.getItem('token');
      const url = getApiUrl('/api/payment/paypal/execute');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentId,
          PayerID,
          ...orderDetails
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
        setStatus('success');
        // Clean up localStorage
        localStorage.removeItem('pendingOrderDetails');
      } else {
        setError(data.error || 'Payment execution failed');
        setStatus('error');
      }
    } catch (err) {
      setError('Failed to complete payment');
      setStatus('error');
    }
  };

  const goToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        {status === 'processing' && (
          <div className="processing">
            <div className="spinner"></div>
            <h2>Processing Payment...</h2>
            <p>Please wait while we confirm your payment</p>
          </div>
        )}

        {status === 'success' && (
          <div className="success">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your order has been confirmed</p>
            {order && (
              <div className="order-details">
                <p className="order-id">Order ID: {order.id}</p>
                <p className="order-date">{new Date(order.completedAt).toLocaleString()}</p>
              </div>
            )}
            <button className="home-btn" onClick={goToHome}>
              Back to Home
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="error">
            <div className="error-icon">✕</div>
            <h2>Payment Failed</h2>
            <p>{error}</p>
            <button className="home-btn" onClick={goToHome}>
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

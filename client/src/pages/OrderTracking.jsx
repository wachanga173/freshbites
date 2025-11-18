import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import DeliveryMap from '../components/DeliveryMap'
import './OrderTracking.css'

export default function OrderTracking() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyOrders()
  }, [])

  useEffect(() => {
    if (selectedOrder && (selectedOrder.deliveryType === 'delivery' || selectedOrder.orderType === 'delivery') && selectedOrder.status === 'out_for_delivery') {
      // Poll for location updates every 5 seconds
      const interval = setInterval(() => {
        fetchTrackingInfo(selectedOrder.orderId)
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [selectedOrder])

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl('/api/orders/my-orders')
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setOrders(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load orders')
      setLoading(false)
    }
  }

  const fetchTrackingInfo = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/delivery/track/${orderId}`)
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setTracking(data.tracking)
    } catch (err) {
      console.error('Failed to fetch tracking info')
    }
  }

  const handleConfirmCompletion = async (orderId) => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/orders/${orderId}/confirm-completion`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        alert('Order marked as completed!')
        fetchMyOrders()
        setSelectedOrder(null)
      }
    } catch (err) {
      alert('Failed to confirm completion')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      confirmed: '#4169e1',
      preparing: '#9370db',
      ready: '#32cd32',
      out_for_delivery: '#ff6347',
      delivered: '#00ff00',
      picked_up: '#00ff00',
      dined: '#00ff00',
      completed: '#228b22',
      failed: '#dc143c',
      cancelled: '#696969'
    }
    return colors[status] || '#000'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '✓',
      out_for_delivery: '🚴',
      delivered: '📦',
      picked_up: '🛍️',
      dined: '🍽️',
      completed: '✔✔',
      failed: '❌',
      cancelled: '🚫'
    }
    return icons[status] || '📋'
  }

  const getStatusMessage = (order) => {
    switch(order.status) {
      case 'delivered':
        return {
          title: '📦 Order Delivered',
          message: 'Your order has been delivered to your location.',
          action: 'If you have any issues, please contact customer support.'
        }
      case 'picked_up':
        return {
          title: '🛍️ Order Picked Up',
          message: 'Your order has been picked up from our restaurant.',
          action: 'If you have any issues, please contact customer support.'
        }
      case 'dined':
        return {
          title: '🍽️ Dine-In Complete',
          message: 'You have enjoyed your meal at our restaurant.',
          action: 'Thank you for dining with us! For any feedback, please contact customer support.'
        }
      default:
        return null
    }
  }

  if (loading) {
    return <div className="loading-container">Loading your orders...</div>
  }

  return (
    <div className="order-tracking-container">
      <h1>My Orders</h1>

      {error && <div className="error-message">{error}</div>}

  {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-layout">
          {/* Orders List */}
          <div className="orders-list">
            {(Array.isArray(orders) ? orders : []).map((order) => (
              <div
                key={order.orderId}
                className={`order-card ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedOrder(order)
                  if ((order.orderType || order.deliveryType) === 'delivery') {
                    fetchTrackingInfo(order.orderId)
                  }
                }}
              >
                <div className="order-card-header">
                  <span className="order-id">#{order.orderId}</span>
                  <span 
                    className="order-status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusIcon(order.status)} {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="order-card-body">
                  <p><strong>{order.items.length}</strong> items</p>
                  <p><strong>KSH {order.grandTotal}</strong></p>
                  <p className="order-type">
                    {(order.orderType || order.deliveryType) === 'delivery' ? '🚚 Delivery' : 
                     (order.orderType || order.deliveryType) === 'pickup' ? '🏪 Pickup' : '🍽️ Dine-In'}
                  </p>
                </div>
                <div className="order-card-footer">
                  <small>{new Date(order.createdAt).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          {selectedOrder && (
            <div className="order-details">
              <h2>Order Details</h2>
              
              {/* Order Info */}
              <div className="detail-section">
                <h3>Order #{selectedOrder.orderId}</h3>
                <p className="order-date">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <div className="current-status" style={{ borderLeftColor: getStatusColor(selectedOrder.status) }}>
                  <span className="status-icon">{getStatusIcon(selectedOrder.status)}</span>
                  <div>
                    <strong>Status: {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}</strong>
                    {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                      <p className="status-update-time">
                        Last updated: {new Date(selectedOrder.statusHistory[selectedOrder.statusHistory.length - 1].timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="detail-section">
                <h3>Items</h3>
                <div className="order-items-list">
                  {(selectedOrder && Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <img src={item.image} alt={item.name} />
                      <div className="item-info">
                        <strong>{item.name}</strong>
                        <span>x{item.quantity}</span>
                      </div>
                      <span className="item-price">KSH {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryType === 'delivery' && selectedOrder.deliveryAddress && (
                <div className="detail-section">
                  <h3>Delivery Address</h3>
                  <p>{selectedOrder.deliveryAddress.street}</p>
                  <p>{selectedOrder.deliveryAddress.city}</p>
                  <p>Phone: {selectedOrder.deliveryAddress.phone}</p>
                  {selectedOrder.deliveryAddress.instructions && (
                    <p className="instructions">Instructions: {selectedOrder.deliveryAddress.instructions}</p>
                  )}
                </div>
              )}

              {/* Live Tracking Map */}
              {selectedOrder.deliveryType === 'delivery' && 
               selectedOrder.status === 'out_for_delivery' && 
               tracking && (
                <div className="detail-section">
                  <h3>🗺️ Live Tracking</h3>
                  <DeliveryMap 
                    deliveryLocation={tracking.currentLocation}
                    destinationAddress={selectedOrder.deliveryAddress}
                  />
                  {selectedOrder.assignedTo && (
                    <div className="delivery-person-info">
                      <p><strong>Delivery Person:</strong> {selectedOrder.assignedTo.username}</p>
                      <p><strong>Phone:</strong> {selectedOrder.assignedTo.phone}</p>
                      <a 
                        href={`tel:${selectedOrder.assignedTo.phone}`}
                        className="call-delivery-btn"
                      >
                        📞 Call Delivery Person
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="detail-section">
                  <h3>Status History</h3>
                  <div className="status-timeline">
                    {(selectedOrder && Array.isArray(selectedOrder.statusHistory) ? selectedOrder.statusHistory : []).map((history, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-dot" style={{ backgroundColor: getStatusColor(history.status) }}></div>
                        <div className="timeline-content">
                          <strong>{history.status.replace(/_/g, ' ').toUpperCase()}</strong>
                          <p className="timeline-time">{new Date(history.timestamp).toLocaleString()}</p>
                          {history.note && <p className="timeline-note">{history.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="detail-section">
                <h3>Payment</h3>
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>KSH {selectedOrder.total}</span>
                  </div>
                  {selectedOrder.shippingFee > 0 && (
                    <div className="summary-row">
                      <span>Shipping Fee:</span>
                      <span>KSH {selectedOrder.shippingFee}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span><strong>Total:</strong></span>
                    <span><strong>KSH {selectedOrder.grandTotal}</strong></span>
                  </div>
                  <p className="payment-method">Payment: {selectedOrder.paymentMethod.toUpperCase()}</p>
                </div>
              </div>

              {/* Status message for completed orders */}
              {(selectedOrder.status === 'delivered' || selectedOrder.status === 'picked_up' || selectedOrder.status === 'dined') && (
                <div className="order-status-message">
                  <h3>{getStatusMessage(selectedOrder).title}</h3>
                  <p>{getStatusMessage(selectedOrder).message}</p>
                  <p className="support-info">{getStatusMessage(selectedOrder).action}</p>
                  <div className="support-contact">
                    <h4>📞 Customer Support</h4>
                    <p>Phone: <a href="tel:+254712345678">+254 712 345 678</a></p>
                    <p>Email: <a href="mailto:support@freshbites.com">support@freshbites.com</a></p>
                    <p>Hours: Monday - Sunday, 8:00 AM - 10:00 PM</p>
                  </div>
                  {selectedOrder.completedAt && (
                    <p className="completed-time">
                      Completed on: {new Date(selectedOrder.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              {(selectedOrder.status === 'delivered' || 
                (selectedOrder.deliveryType === 'pickup' && selectedOrder.status === 'ready')) && (
                <div className="detail-section">
                  <button 
                    className="confirm-completion-btn"
                    onClick={() => handleConfirmCompletion(selectedOrder.orderId)}
                  >
                    ✓ Confirm Order Completion
                  </button>
                  <p className="completion-note">
                    {selectedOrder.deliveryType === 'pickup' 
                      ? 'Click after picking up your order' 
                      : 'Click after receiving your delivery'}
                  </p>
                </div>
              )}

              {selectedOrder.status === 'completed' && (
                <div className="completion-message">
                  ✅ This order has been completed!
                  {selectedOrder.completedAt && (
                    <p>Completed on: {new Date(selectedOrder.completedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

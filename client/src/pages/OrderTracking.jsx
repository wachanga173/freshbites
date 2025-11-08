import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
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
    if (selectedOrder && selectedOrder.deliveryType === 'delivery' && selectedOrder.status === 'out_for_delivery') {
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
      const response = await fetch('/api/orders/my-orders', {
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
      const response = await fetch(`/api/delivery/track/${orderId}`, {
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
      const response = await fetch(`/api/orders/${orderId}/confirm-completion`, {
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
      completed: '✔✔',
      failed: '❌',
      cancelled: '🚫'
    }
    return icons[status] || '📋'
  }

  if (loading) {
    return <div className="loading-container">Loading your orders...</div>
  }

  return (
    <div className="order-tracking-container">
      <h1>My Orders</h1>

      {error && <div className="error-message">{error}</div>}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-layout">
          {/* Orders List */}
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className={`order-card ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedOrder(order)
                  if (order.deliveryType === 'delivery') {
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
                  <p className="order-type">{order.deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</p>
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
                  {selectedOrder.items.map((item, idx) => (
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
                    {selectedOrder.statusHistory.map((history, idx) => (
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

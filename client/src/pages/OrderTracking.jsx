import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import GPSTracker from '../components/GPSTracker'
import './OrderTracking.css'

export default function OrderTracking() {
  const { user: _user } = useAuth()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleGoBack = () => {
    window.location.href = '/'
  }

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

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesType = filterType === 'all' || (order.orderType || order.deliveryType) === filterType
    const matchesSearch = searchQuery === '' || 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesStatus && matchesType && matchesSearch
  })

  // Get order statistics
  const orderStats = {
    total: orders.length,
    active: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
    completed: orders.filter(o => ['delivered', 'picked_up', 'dined', 'completed'].includes(o.status)).length,
    cancelled: orders.filter(o => ['cancelled', 'failed'].includes(o.status)).length
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    )
  }

  return (
    <div className="order-tracking-container">
      {/* Enhanced Header */}
      <div className="order-tracking-header">
        <div className="header-content">
          <button className="back-to-home-btn" onClick={handleGoBack}>
            ← Back
          </button>
          <div className="header-text">
            <h1>📦 My Orders</h1>
            <p className="header-subtitle">Track and manage your orders</p>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!Array.isArray(orders) || orders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📭</div>
          <h2>No Orders Yet</h2>
          <p>You haven&apos;t placed any orders yet.</p>
          <button onClick={() => window.location.href = '/menu'} className="browse-menu-btn">
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="order-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.total}</div>
                <div className="stat-label">Total Orders</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.active}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚫</div>
              <div className="stat-content">
                <div className="stat-value">{orderStats.cancelled}</div>
                <div className="stat-label">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="filters-section">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by order ID or item name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filters">
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select 
                className="filter-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="pickup">🏪 Pickup</option>
                <option value="dine-in">🍽️ Dine-In</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No orders found</h3>
              <p>Try adjusting your filters or search query</p>
              <button onClick={() => {
                setFilterStatus('all')
                setFilterType('all')
                setSearchQuery('')
              }} className="reset-filters-btn">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="orders-layout">
              {/* Orders List */}
              <div className="orders-list">
                <div className="orders-list-header">
                  <h3>Orders ({filteredOrders.length})</h3>
                </div>
                {filteredOrders.map((order) => (
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
                      <div className="order-info-row">
                        <span className="info-label">Items:</span>
                        <span className="info-value">{order.items.length}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="info-label">Total:</span>
                        <span className="info-value price">KSH {order.grandTotal}</span>
                      </div>
                      <div className="order-info-row">
                        <span className="info-label">Type:</span>
                        <span className="order-type">
                          {(order.orderType || order.deliveryType) === 'delivery' ? '🚚 Delivery' : 
                            (order.orderType || order.deliveryType) === 'pickup' ? '🏪 Pickup' : '🍽️ Dine-In'}
                        </span>
                      </div>
                    </div>
                    <div className="order-card-footer">
                      <span className="order-date-badge">📅 {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span className="order-time-badge">🕐 {new Date(order.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Details */}
              {selectedOrder ? (
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
               tracking && tracking.currentLocation && (
                    <div className="detail-section">
                      <h3>🗺️ Live GPS Tracking</h3>
                      <GPSTracker 
                        deliveryLocation={tracking.currentLocation}
                        destinationLocation={{
                          latitude: selectedOrder.deliveryAddress?.latitude || 0,
                          longitude: selectedOrder.deliveryAddress?.longitude || 0
                        }}
                        showControls={false}
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
              ) : (
                <div className="no-selection">
                  <div className="no-selection-icon">👈</div>
                  <h3>Select an order</h3>
                  <p>Click on any order from the list to view its details</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import './OrderManagementDashboard.css'

export default function OrderManagementDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [orderError, setOrderError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
    fetchDeliveryPersonnel()
    const interval = setInterval(fetchOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const fetchOrders = async () => {
    try {
      setOrderError(null)
      const token = localStorage.getItem('token')
      const endpoint = filter === 'all' ? '/api/orders/manage' : `/api/orders/manage?status=${filter}`
      const url = getApiUrl(endpoint)
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
        setOrderError(
          (data && data.error) ? `Error: ${data.error}` : 'Unexpected response from server.'
        )
      }
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setOrderError('Failed to fetch orders. See console for details.')
      setLoading(false)
    }
  }

  const fetchDeliveryPersonnel = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl('/api/delivery-personnel')
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        // The new endpoint returns only delivery personnel
        setDeliveryPersonnel(data)
      } else {
        console.error('Failed to fetch delivery personnel:', data.error)
      }
    } catch (err) {
      console.error('Failed to fetch delivery personnel:', err)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/orders/${orderId}/status`)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, note })
      })
      
      if (response.ok) {
        fetchOrders()
        if (selectedOrder?.orderId === orderId) {
          const updated = await response.json()
          setSelectedOrder(updated.order)
        }
        alert(`Order status updated to: ${newStatus}`)
      }
    } catch (err) {
      alert('Failed to update order status')
    }
  }

  const assignDelivery = async (orderId, deliveryPersonId) => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/orders/${orderId}/assign`)
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryPersonId })
      })
      
      if (response.ok) {
        fetchOrders()
        alert('Order assigned successfully!')
      }
    } catch (err) {
      alert('Failed to assign order')
    }
  }

  const markPickupDone = async (orderId, orderType = 'pickup') => {
    const typeLabel = orderType === 'dine-in' ? 'Dine-In' : 'Pickup'
    const action = orderType === 'dine-in' ? 'finished dining' : 'collected the order'
    const confirmMsg = `Confirm that customer has ${action}?\n\n` +
                      `Order: #${orderId}\n` +
                      `Type: ${typeLabel}\n\n` +
                      '⚠️ This action CANNOT be undone.'

    if (!confirm(confirmMsg)) return

    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/orders/${orderId}/complete`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completionType: orderType })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        alert(`✅ ${typeLabel} confirmed!\n\nOrder is now completed.`)
        fetchOrders()
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(data.order)
        }
      } else {
        alert(`Failed: ${data.error || 'Could not complete order'}`)
      }
    } catch (err) {
      alert('Failed to complete order')
    }
  }

  const confirmPayment = async (orderId) => {
    const confirmMsg = `Confirm that payment has been received for order #${orderId}?\n\n` +
                      'This will change the order status from pending to confirmed/ready.\n\n' +
                      '⚠️ Only confirm if you have verified the payment.'

    if (!confirm(confirmMsg)) return

    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/orders/${orderId}/confirm-payment`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        alert(`✅ Payment confirmed!\n\nOrder status updated to ${data.order.status}.`)
        fetchOrders()
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(data.order)
        }
      } else {
        alert(`Failed: ${data.error || 'Could not confirm payment'}`)
      }
    } catch (err) {
      alert('Failed to confirm payment')
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

  return (
    <div className="order-mgmt-dashboard">
      <header className="dashboard-header">
        <h1>📋 Order Management</h1>
        <p>Welcome, {user?.username}</p>
      </header>

      <div className="filter-bar">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All Orders
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Pending
        </button>
        <button className={filter === 'confirmed' ? 'active' : ''} onClick={() => setFilter('confirmed')}>
          Confirmed
        </button>
        <button className={filter === 'preparing' ? 'active' : ''} onClick={() => setFilter('preparing')}>
          Preparing
        </button>
        <button className={filter === 'ready' ? 'active' : ''} onClick={() => setFilter('ready')}>
          Ready
        </button>
        <button className={filter === 'out_for_delivery' ? 'active' : ''} onClick={() => setFilter('out_for_delivery')}>
          Out for Delivery
        </button>
      </div>

      <div className="dashboard-content">
        <div className="orders-grid">
          {loading ? (
            <p>Loading orders...</p>
          ) : orderError ? (
            <p style={{ color: 'red' }}>{orderError}</p>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <p>No orders found</p>
          ) : (
            (Array.isArray(orders) ? orders : []).map(order => (
              <div
                key={order.orderId}
                className={`order-card ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-header">
                  <strong>#{order.orderId}</strong>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="order-info">
                  <p><strong>{order.username}</strong></p>
                  <p>{order.deliveryType === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}</p>
                  <p><strong>KSH {order.grandTotal}</strong></p>
                  <p className="order-time">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedOrder && (
          <div className="order-details-panel">
            <h2>Order #{selectedOrder.orderId}</h2>
            
            <div className="detail-section">
              <h3>Customer</h3>
              <p><strong>{selectedOrder.username}</strong></p>
              {selectedOrder.userId?.phone && <p>📞 {selectedOrder.userId.phone}</p>}
            </div>

            {selectedOrder.deliveryType === 'delivery' && selectedOrder.deliveryAddress && (
              <div className="detail-section">
                <h3>Delivery Address</h3>
                <p>{selectedOrder.deliveryAddress.street}</p>
                <p>{selectedOrder.deliveryAddress.city}</p>
                <p>📞 {selectedOrder.deliveryAddress.phone}</p>
                {selectedOrder.deliveryAddress.instructions && (
                  <p className="instructions">Note: {selectedOrder.deliveryAddress.instructions}</p>
                )}
              </div>
            )}

            <div className="detail-section">
              <h3>Items ({selectedOrder.items.length})</h3>
              {(selectedOrder && Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, idx) => (
                <div key={idx} className="item-row">
                  <span>{item.name} x{item.quantity}</span>
                  <span>KSH {item.price * item.quantity}</span>
                </div>
              ))}
              <div className="total-row">
                <strong>Total:</strong>
                <strong>KSH {selectedOrder.grandTotal}</strong>
              </div>
            </div>

            <div className="detail-section">
              <h3>Update Status</h3>
              <div className="status-actions">
                {selectedOrder.status === 'pending' && (
                  <button 
                    className="confirm-payment-btn"
                    onClick={() => confirmPayment(selectedOrder.orderId)}
                    style={{ backgroundColor: '#28a745', marginBottom: '10px' }}
                  >
                    💰 Confirm Payment Received
                  </button>
                )}
                {selectedOrder.status !== 'completed' && selectedOrder.canReuse !== false && (
                  <>
                    <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'confirmed')}>
                      ✓ Confirm Order
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'preparing')}>
                      👨‍🍳 Start Preparing
                    </button>
                    <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'ready')}>
                      ✓ Mark Ready
                    </button>
                    {selectedOrder.deliveryType === 'delivery' && (
                      <>
                        <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'out_for_delivery')}>
                          🚴 Out for Delivery
                        </button>
                        <button onClick={() => updateOrderStatus(selectedOrder.orderId, 'delivered')}>
                          📦 Delivered
                        </button>
                      </>
                    )}
                    {((selectedOrder.orderType === 'pickup' || selectedOrder.deliveryType === 'pickup') && selectedOrder.status === 'ready') && (
                      <button 
                        className="complete-pickup-btn"
                        onClick={() => markPickupDone(selectedOrder.orderId, 'pickup')}
                      >
                        ✅ Customer Collected (Mark Picked Up)
                      </button>
                    )}
                    {selectedOrder.orderType === 'dine-in' && selectedOrder.status === 'ready' && (
                      <button 
                        className="complete-pickup-btn"
                        onClick={() => markPickupDone(selectedOrder.orderId, 'dine-in')}
                      >
                        ✅ Customer Finished (Mark Dined)
                      </button>
                    )}
                    <button 
                      className="cancel-btn"
                      onClick={() => {
                        const reason = prompt('Cancellation reason:')
                        if (reason) updateOrderStatus(selectedOrder.orderId, 'cancelled', reason)
                      }}
                    >
                      ✕ Cancel Order
                    </button>
                  </>
                )}

                {selectedOrder.status === 'completed' || selectedOrder.canReuse === false ? (
                  <div className="order-locked-message">
                    <strong>🔒 Order Completed & Locked</strong>
                    <p>This order has been completed and cannot be modified or reused.</p>
                    {selectedOrder.completedAt && (
                      <p className="completion-details">
                        Completed: {new Date(selectedOrder.completedAt).toLocaleString()}
                      </p>
                    )}
                    {selectedOrder.completedByRole && (
                      <p className="completion-details">
                        Completed by: {selectedOrder.completedByRole === 'delivery' ? 'Delivery Person' : 
                          selectedOrder.completedByRole === 'ordermanager' ? 'Order Manager' : 
                            'Customer'}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {selectedOrder.deliveryType === 'delivery' && selectedOrder.status === 'ready' && (
              <div className="detail-section">
                <h3>Assign Delivery Person</h3>
                <select 
                  className="delivery-select"
                  onChange={(e) => e.target.value && assignDelivery(selectedOrder.orderId, e.target.value)}
                  defaultValue=""
                >
                  <option value="">Select delivery person...</option>
                  {(Array.isArray(deliveryPersonnel) ? deliveryPersonnel : []).map(person => (
                    <option key={person.id} value={person.id}>
                      {person.username} {person.phone && `- ${person.phone}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOrder.assignedTo && (
              <div className="detail-section">
                <h3>Assigned To</h3>
                <p><strong>{selectedOrder.assignedTo.username}</strong></p>
                <p>📞 {selectedOrder.assignedTo.phone}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

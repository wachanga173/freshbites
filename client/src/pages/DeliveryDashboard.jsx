import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import DeliveryMap from '../components/DeliveryMap'
import './DeliveryDashboard.css'

export default function DeliveryDashboard() {
  const { user } = useAuth()
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [locationTracking, setLocationTracking] = useState(false)
  const [watchId, setWatchId] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyDeliveries()
    // Refresh deliveries every 30 seconds
    const interval = setInterval(fetchMyDeliveries, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Start tracking when delivery is selected
    if (selectedDelivery && !locationTracking) {
      startLocationTracking()
    }
    
    // Stop tracking when no delivery selected
    if (!selectedDelivery && locationTracking) {
      stopLocationTracking()
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [selectedDelivery])

  const fetchMyDeliveries = async () => {
    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl('/api/delivery/my-deliveries')
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setActiveDeliveries(data)
    } catch (err) {
      setError('Failed to load deliveries')
    }
  }

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLocationTracking(true)
    
    // Get current position first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)
        updateLocationOnServer(location)
      },
      (err) => {
        console.error('Error getting location:', err)
        setError('Failed to get your location. Please enable GPS.')
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )

    // Watch position continuously
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        setCurrentLocation(location)
        updateLocationOnServer(location)
      },
      (err) => {
        console.error('Watch position error:', err)
        setError('GPS tracking error. Please check your device settings.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000
      }
    )

    setWatchId(id)
  }

  const stopLocationTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setLocationTracking(false)
    setCurrentLocation(null)
  }

  const updateLocationOnServer = async (location) => {
    if (!selectedDelivery) return

    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl('/api/delivery/update-location')
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedDelivery._id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        })
      })
    } catch (err) {
      console.error('Failed to update location:', err)
    }
  }

  const handleMarkArrived = async () => {
    if (!selectedDelivery) return

    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl(`/api/delivery/${selectedDelivery.orderId}/arrive`)
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Marked as arrived! Waiting for customer confirmation.')
        stopLocationTracking()
        fetchMyDeliveries()
        setSelectedDelivery(null)
      }
    } catch (err) {
      alert('Failed to mark arrival')
    }
  }

  const handleMarkDeliveryDone = async () => {
    if (!selectedDelivery) return

    if (!currentLocation) {
      alert('Please wait while we get your location for verification...')
      return
    }

    const confirmMsg = `Are you sure you want to mark this delivery as DONE?\n\n` +
                      `Order: #${selectedDelivery.orderId}\n` +
                      `Customer: ${selectedDelivery.username}\n\n` +
                      `Your location will be verified against the delivery address.\n\n` +
                      `⚠️ This action CANNOT be undone.`

    if (!confirm(confirmMsg)) return

    try {
      const token = localStorage.getItem('token')
      const url = getApiUrl('/api/delivery/confirm-delivery')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: selectedDelivery.orderId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        })
      })
      const data = await response.json()
      
      if (response.ok && data.success) {
        let message = '✅ Delivery completed successfully!\n\n'
        if (data.locationVerified) {
          message += '✓ Location verified - You were at the delivery address'
        } else if (data.distance) {
          message += `⚠️ Location verification: You were ${data.distance}m from the delivery address`
        } else {
          message += '⚠️ Customer did not provide delivery location coordinates'
        }
        alert(message)
        stopLocationTracking()
        fetchMyDeliveries()
        setSelectedDelivery(null)
      } else {
        alert(`Failed: ${data.error || 'Could not confirm delivery'}`)
      }
    } catch (err) {
      console.error('Confirm delivery error:', err)
      alert('Failed to confirm delivery')
    }
  }

  const openNavigation = (address) => {
    if (!currentLocation) {
      alert('Getting your location...')
      return
    }

    // Open Google Maps or Apple Maps for navigation
    const destination = encodeURIComponent(`${address.street}, ${address.city}`)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      // Apple Maps
      window.open(`maps://maps.apple.com/?daddr=${destination}`)
    } else {
      // Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`)
    }
  }

  const callCustomer = (phone) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="delivery-dashboard">
      <header className="delivery-header">
        <h1>🚴 My Deliveries</h1>
        {locationTracking && (
          <div className="tracking-indicator">
            <span className="tracking-pulse"></span>
            GPS Active
          </div>
        )}
      </header>

      {error && <div className="error-message">{error}</div>}

      {activeDeliveries.length === 0 ? (
        <div className="no-deliveries">
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <h2>No Active Deliveries</h2>
            <p>You'll see your assigned deliveries here</p>
          </div>
        </div>
      ) : (
        <div className="deliveries-container">
          {/* Delivery Cards */}
          <div className="deliveries-grid">
            {activeDeliveries.map((delivery) => (
              <div
                key={delivery.orderId}
                className={`delivery-card ${selectedDelivery?.orderId === delivery.orderId ? 'active' : ''}`}
                onClick={() => setSelectedDelivery(delivery)}
              >
                <div className="delivery-card-header">
                  <span className="order-number">#{delivery.orderId}</span>
                  <span className={`status-badge ${delivery.status}`}>
                    {delivery.status === 'ready' ? '📦 Ready' : '🚴 In Transit'}
                  </span>
                </div>
                
                <div className="delivery-card-body">
                  <div className="customer-info">
                    <strong>{delivery.username}</strong>
                    <p className="customer-phone">📞 {delivery.deliveryAddress?.phone}</p>
                  </div>
                  
                  <div className="delivery-address">
                    <span className="location-icon">📍</span>
                    <div>
                      <p>{delivery.deliveryAddress?.street}</p>
                      <p className="city">{delivery.deliveryAddress?.city}</p>
                    </div>
                  </div>

                  <div className="order-items-preview">
                    <strong>{delivery.items.length} items</strong>
                    <span className="order-total">KSH {delivery.grandTotal}</span>
                  </div>
                </div>

                <div className="delivery-card-footer">
                  <small>{new Date(delivery.createdAt).toLocaleTimeString()}</small>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Delivery Details */}
          {selectedDelivery && (
            <div className="delivery-details-panel">
              <h2>Delivery Details</h2>

              {/* Current Location Status */}
              {currentLocation && (
                <div className="location-status">
                  <div className="status-item">
                    <span className="label">Your Location:</span>
                    <span className="value">
                      {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="label">Accuracy:</span>
                    <span className="value">{Math.round(currentLocation.accuracy)}m</span>
                  </div>
                  <div className="tracking-status-indicator">
                    <span className="green-dot"></span> Location tracking active
                  </div>
                </div>
              )}

              {/* Customer Information */}
              <div className="details-section">
                <h3>Customer</h3>
                <div className="customer-details">
                  <p><strong>{selectedDelivery.username}</strong></p>
                  <button 
                    className="call-btn"
                    onClick={() => callCustomer(selectedDelivery.deliveryAddress?.phone)}
                  >
                    📞 Call Customer
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="details-section">
                <h3>🗺️ Delivery Address & Map</h3>
                {currentLocation && selectedDelivery.deliveryAddress && (
                  <DeliveryMap 
                    deliveryLocation={currentLocation}
                    destinationAddress={selectedDelivery.deliveryAddress}
                  />
                )}
                <div className="address-details">
                  <p className="address-line">{selectedDelivery.deliveryAddress?.street}</p>
                  <p className="address-line">{selectedDelivery.deliveryAddress?.city}</p>
                  <p className="address-phone">📞 Phone: {selectedDelivery.deliveryAddress?.phone}</p>
                  {selectedDelivery.deliveryAddress?.instructions && (
                    <div className="special-instructions">
                      <strong>📝 Special Instructions:</strong>
                      <p>{selectedDelivery.deliveryAddress.instructions}</p>
                    </div>
                  )}
                  <div className="navigation-buttons">
                    <button 
                      className="navigate-btn"
                      onClick={() => openNavigation(selectedDelivery.deliveryAddress)}
                    >
                      🗺️ Open in Google Maps
                    </button>
                    <a 
                      href={`tel:${selectedDelivery.deliveryAddress?.phone}`}
                      className="call-customer-btn"
                    >
                      📞 Call Customer
                    </a>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="details-section">
                <h3>Items to Deliver</h3>
                <div className="items-list">
                  {selectedDelivery.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <strong>{item.name}</strong>
                        <span className="quantity">x{item.quantity}</span>
                      </div>
                      <span className="item-price">KSH {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-total-display">
                  <strong>Total to Collect: KSH {selectedDelivery.grandTotal}</strong>
                  <p className="payment-note">✓ Already paid via {selectedDelivery.paymentMethod}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="details-section">
                <h3>Actions</h3>
                <div className="action-buttons">
                  {selectedDelivery.status === 'ready' && (
                    <p className="info-message">
                      📍 Start your delivery to begin GPS tracking
                    </p>
                  )}
                  
                  {selectedDelivery.status === 'out_for_delivery' && (
                    <>
                      <button 
                        className="arrive-btn"
                        onClick={handleMarkArrived}
                        disabled={!locationTracking}
                      >
                        📍 I've Arrived at Customer Location
                      </button>
                      
                      <button 
                        className="complete-delivery-btn"
                        onClick={handleMarkDeliveryDone}
                        disabled={!locationTracking}
                      >
                        ✅ Mark Delivery as DONE (Cannot Reuse)
                      </button>
                    </>
                  )}

                  {selectedDelivery.status === 'delivered' && (
                    <button 
                      className="complete-delivery-btn"
                      onClick={handleMarkDeliveryDone}
                    >
                      ✅ Confirm Delivery DONE (Cannot Reuse)
                    </button>
                  )}

                  {selectedDelivery.status === 'completed' && (
                    <div className="completed-message">
                      ✅ This delivery has been completed and locked
                      {selectedDelivery.completedAt && (
                        <p className="completion-time">
                          Completed: {new Date(selectedDelivery.completedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {!locationTracking && selectedDelivery.status === 'out_for_delivery' && (
                    <p className="warning-message">
                      ⚠️ GPS tracking must be active to complete actions
                    </p>
                  )}
                </div>
              </div>

              {/* GPS Info */}
              <div className="details-section gps-info">
                <h4>📡 GPS Tracking Info</h4>
                <ul>
                  <li>Your location is being shared with the customer and admin</li>
                  <li>Updates are sent every 10 seconds</li>
                  <li>Customer can see your real-time location on their map</li>
                  <li>Keep this page open during delivery</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions for first time users */}
      {activeDeliveries.length === 0 && (
        <div className="instructions-panel">
          <h3>How It Works</h3>
          <ol>
            <li>Wait for an order manager to assign you a delivery</li>
            <li>Select the delivery to see customer details</li>
            <li>GPS tracking starts automatically</li>
            <li>Use "Open in Maps" for navigation</li>
            <li>Mark "I've Arrived" when you reach the customer</li>
            <li>Customer confirms receipt to complete the order</li>
          </ol>
        </div>
      )}
    </div>
  )
}

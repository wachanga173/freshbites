import { useEffect, useState } from 'react'
import './GPSTracker.css'

export default function GPSTracker({ 
  deliveryLocation, 
  destinationLocation, 
  onLocationUpdate: _onLocationUpdate,
  showControls = false 
}) {
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const [speed, setSpeed] = useState(0) // eslint-disable-line no-unused-vars
  const [bearing, setBearing] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    if (deliveryLocation && destinationLocation) {
      calculateDistanceAndDuration()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deliveryLocation, destinationLocation])

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distance in kilometers
    
    return distance
  }

  // Calculate bearing (direction) between two points
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = toRadians(lon2 - lon1)
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2))
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
              Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon)
    const bearing = toDegrees(Math.atan2(y, x))
    
    return (bearing + 360) % 360 // Normalize to 0-360
  }

  const toRadians = (degrees) => degrees * (Math.PI / 180)
  const toDegrees = (radians) => radians * (180 / Math.PI)

  const calculateDistanceAndDuration = () => {
    const dist = calculateDistance(
      deliveryLocation.latitude,
      deliveryLocation.longitude,
      destinationLocation.latitude,
      destinationLocation.longitude
    )

    setDistance(dist)

    // Calculate bearing
    const bear = calculateBearing(
      deliveryLocation.latitude,
      deliveryLocation.longitude,
      destinationLocation.latitude,
      destinationLocation.longitude
    )
    setBearing(bear)

    // Estimate duration based on average delivery speed
    // Assume average speed: 20 km/h for motorbike, 15 km/h for bicycle
    const averageSpeed = speed > 0 ? speed : 15 // km/h
    const estimatedDuration = (dist / averageSpeed) * 60 // minutes

    setDuration(Math.ceil(estimatedDuration))
    setLastUpdate(new Date())
  }

  const getDirectionName = (bearing) => {
    if (bearing === null) return 'Unknown'
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(bearing / 45) % 8
    return directions[index]
  }

  const formatDistance = (dist) => {
    if (dist === null) return 'Calculating...'
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`
    }
    return `${dist.toFixed(2)} km`
  }

  const formatDuration = (dur) => {
    if (dur === null) return 'Calculating...'
    if (dur < 60) {
      return `${dur} min`
    }
    const hours = Math.floor(dur / 60)
    const minutes = dur % 60
    return `${hours}h ${minutes}m`
  }

  const openInMaps = () => {
    if (!destinationLocation) return
    
    // Open in device's default map app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destinationLocation.latitude},${destinationLocation.longitude}`
    window.open(url, '_blank')
  }

  return (
    <div className="gps-tracker">
      <div className="tracker-header">
        <h3>📍 Live GPS Tracking</h3>
        {lastUpdate && (
          <span className="last-update">
            Updated: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="tracker-stats">
        <div className="stat-card">
          <div className="stat-icon">📏</div>
          <div className="stat-content">
            <div className="stat-label">Distance</div>
            <div className="stat-value">{formatDistance(distance)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">ETA</div>
            <div className="stat-value">{formatDuration(duration)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🧭</div>
          <div className="stat-content">
            <div className="stat-label">Direction</div>
            <div className="stat-value">{getDirectionName(bearing)}</div>
          </div>
        </div>
      </div>

      <div className="location-details">
        <div className="location-section">
          <h4>🚴 Delivery Person Location</h4>
          {deliveryLocation ? (
            <div className="coordinates">
              <span>Lat: {deliveryLocation.latitude.toFixed(6)}</span>
              <span>Lng: {deliveryLocation.longitude.toFixed(6)}</span>
              {deliveryLocation.accuracy && (
                <span className="accuracy">±{Math.round(deliveryLocation.accuracy)}m</span>
              )}
            </div>
          ) : (
            <p className="no-location">Waiting for location...</p>
          )}
        </div>

        <div className="location-section">
          <h4>🏠 Destination</h4>
          {destinationLocation ? (
            <div className="coordinates">
              <span>Lat: {destinationLocation.latitude.toFixed(6)}</span>
              <span>Lng: {destinationLocation.longitude.toFixed(6)}</span>
            </div>
          ) : (
            <p className="no-location">No destination set</p>
          )}
        </div>
      </div>

      {showControls && (
        <div className="tracker-actions">
          <button 
            className="open-maps-btn"
            onClick={openInMaps}
            disabled={!destinationLocation}
          >
            🗺️ Open in Maps
          </button>
        </div>
      )}

      <div className="tracker-info">
        <div className="info-item">
          <span className="info-icon">ℹ️</span>
          <span>GPS tracking updates every 5-10 seconds</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⚡</span>
          <span>ETA calculated based on average delivery speed (15-20 km/h)</span>
        </div>
        <div className="info-item">
          <span className="info-icon">📡</span>
          <span>Accuracy depends on GPS signal strength</span>
        </div>
      </div>
    </div>
  )
}

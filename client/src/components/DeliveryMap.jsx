import { useEffect, useRef, useState } from 'react'
import './DeliveryMap.css'

export default function DeliveryMap({ deliveryLocation, destinationAddress }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [deliveryMarker, setDeliveryMarker] = useState(null)
  const [destinationMarker, setDestinationMarker] = useState(null)
  const [directionsRenderer, setDirectionsRenderer] = useState(null)
  const [error, setError] = useState('')

  // Google Maps API Key from environment variable
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    // Check if API key is configured
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to client/.env file.')
      return
    }

    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = () => setError('Failed to load Google Maps. Please check your API key.')
      document.head.appendChild(script)
    } else {
      initMap()
    }
  }, [])

  useEffect(() => {
    if (map && deliveryLocation) {
      updateDeliveryLocation(deliveryLocation)
    }
  }, [map, deliveryLocation])

  const initMap = () => {
    if (!window.google) {
      setError('Google Maps not loaded')
      return
    }

    try {
      // Default center (Nairobi, Kenya)
      const defaultCenter = { lat: -1.2921, lng: 36.8219 }
      const center = deliveryLocation 
        ? { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude }
        : defaultCenter

      const newMap = new window.google.maps.Map(mapRef.current, {
        zoom: 14,
        center: center,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      setMap(newMap)

      // Create directions renderer for route
      const renderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: true, // We'll add custom markers
      })
      setDirectionsRenderer(renderer)

      // Add delivery person marker
      if (deliveryLocation) {
        const marker = new window.google.maps.Marker({
          position: { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude },
          map: newMap,
          title: 'Delivery Person',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            text: '🚴',
            fontSize: '18px',
          },
        })
        setDeliveryMarker(marker)
      }

      // Geocode destination address
      if (destinationAddress) {
        geocodeAddress(destinationAddress, newMap)
      }
    } catch (err) {
      console.error('Map initialization error:', err)
      setError('Failed to initialize map')
    }
  }

  const geocodeAddress = (address, mapInstance) => {
    const geocoder = new window.google.maps.Geocoder()
    const fullAddress = `${address.street}, ${address.city}, Kenya`

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location
        
        // Add destination marker
        const marker = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          title: 'Delivery Destination',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#EA4335',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
          label: {
            text: '📍',
            fontSize: '18px',
          },
        })
        setDestinationMarker(marker)

        // Draw route if delivery location exists
        if (deliveryLocation) {
          calculateRoute(deliveryLocation, location)
        }
      } else {
        console.error('Geocoding failed:', status)
      }
    })
  }

  const calculateRoute = (origin, destination) => {
    if (!directionsRenderer) return

    const directionsService = new window.google.maps.DirectionsService()

    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.latitude, origin.longitude),
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result)
          
          // Add custom markers on top of the route
          updateDeliveryMarkerPosition(origin)
        } else {
          console.error('Directions request failed:', status)
        }
      }
    )
  }

  const updateDeliveryLocation = (location) => {
    if (!deliveryMarker) return

    const newPosition = { lat: location.latitude, lng: location.longitude }
    deliveryMarker.setPosition(newPosition)

    // Smooth pan to new location
    map.panTo(newPosition)

    // Update route if destination exists
    if (destinationMarker) {
      calculateRoute(location, destinationMarker.getPosition())
    }
  }

  const updateDeliveryMarkerPosition = (location) => {
    if (deliveryMarker) {
      deliveryMarker.setPosition({ lat: location.latitude, lng: location.longitude })
    }
  }

  if (error) {
    return (
      <div className="map-error">
        <p>❌ {error}</p>
        <p className="error-hint">
          To enable Google Maps:
          <br />1. Get a Google Maps API key from Google Cloud Console
          <br />2. Enable Maps JavaScript API, Directions API, and Geocoding API
          <br />3. Add your API key to <code>client/.env</code>:
          <br /><code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
          <br />4. Restart the development server
        </p>
        <div className="fallback-info">
          <p><strong>Current Location:</strong></p>
          <p>Lat: {deliveryLocation?.latitude}</p>
          <p>Lng: {deliveryLocation?.longitude}</p>
          {destinationAddress && (
            <>
              <p><strong>Destination:</strong></p>
              <p>{destinationAddress.street}, {destinationAddress.city}</p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="delivery-map-container">
      <div ref={mapRef} className="map-canvas" />
      {deliveryLocation && (
        <div className="map-info-overlay">
          <div className="location-info">
            <span className="location-icon">🚴</span>
            <div>
              <strong>Delivery Person</strong>
              <p className="location-coords">
                {deliveryLocation.latitude.toFixed(6)}, {deliveryLocation.longitude.toFixed(6)}
              </p>
              <p className="location-time">
                Updated: {new Date(deliveryLocation.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

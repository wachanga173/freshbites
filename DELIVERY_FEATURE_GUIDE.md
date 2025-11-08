# 🚚 Delivery & Order Tracking Feature Implementation Guide

## Overview
This guide documents the comprehensive delivery and order tracking system for the Fresh Bites Café application.

## ✅ Backend Implementation (COMPLETED)

### 1. Database Models Updated

#### MenuItem Model
- Added `deliverable` field (Boolean) - Admin sets which items can be delivered

#### User Model
- Added roles: `ordermanager` and `delivery`
- Added `phone` field for delivery personnel

#### Order Model
- Added `shippingFee`, `grandTotal`
- Added `deliveryType` (pickup/delivery)
- Added `deliveryAddress` object (street, city, phone, instructions)
- Added `status` enum: pending, confirmed, preparing, ready, out_for_delivery, delivered, completed, failed, cancelled
- Added `assignedTo` - references delivery person
- Added `deliveryPersonLocation` - GPS coordinates
- Added `statusHistory` - array tracking all status changes

#### New DeliveryTracking Model
- Real-time GPS tracking for deliveries
- `currentLocation` - latest GPS coordinates
- `locationHistory` - array of all GPS points
- `estimatedArrival`, `actualArrival` times

### 2. API Endpoints Added

#### Order Management (for ordermanager/admin)
- `GET /api/orders/manage` - Get all orders with filters
- `PATCH /api/orders/:orderId/status` - Update order status
- `PATCH /api/orders/:orderId/assign` - Assign order to delivery person
- `GET /api/orders/:orderId/details` - Get full order details with tracking

#### Customer Orders
- `GET /api/orders/my-orders` - Get customer's orders
- `POST /api/orders/:orderId/confirm-completion` - Customer confirms order completion

#### Delivery Tracking
- `POST /api/delivery/update-location` - Delivery person updates GPS location
- `GET /api/delivery/track/:orderId` - Get real-time tracking info
- `GET /api/delivery/my-deliveries` - Delivery person's active deliveries
- `POST /api/delivery/:orderId/arrive` - Mark arrival at destination

### 3. Payment Flow Updates
- PayPal and M-Pesa now save orders with delivery info
- Orders include delivery address and shipping fee
- Status automatically set based on delivery type:
  - Pickup orders: status = "ready"
  - Delivery orders: status = "confirmed"

### 4. Environment Configuration
- Added `SHIPPING_FEE=150` to .env

## 📋 Frontend Components Needed

### 1. Update Checkout Component
The existing Checkout.jsx needs these additions:

```jsx
// Add state for delivery
const [deliveryType, setDeliveryType] = useState('pickup')
const [deliveryAddress, setDeliveryAddress] = useState({
  street: '',
  city: '',
  phone: '',
  instructions: ''
})
const [hasDeliverableItems, setHasDeliverableItems] = useState(false)

// Check if cart has deliverable items
useEffect(() => {
  const hasDeliverable = items.some(item => item.deliverable)
  setHasDeliverableItems(hasDeliverable)
  if (!hasDeliverable) {
    setDeliveryType('pickup')
  }
}, [items])

// Calculate shipping
const shippingFee = deliveryType === 'delivery' ? 150 : 0
const grandTotal = total + shippingFee

// Add delivery address form section before payment method
```

### 2. Order Tracking Page (CREATED ✅)
- File: `client/src/pages/OrderTracking.jsx`
- Features:
  - List all customer orders
  - Real-time delivery tracking with GPS
  - Order status timeline
  - Confirm order completion
  - Live location updates every 5 seconds

### 3. Order Management Dashboard
Create `client/src/pages/OrderManagement.jsx` for ordermanager role:
- View all orders with filters (status, delivery type)
- Update order status
- Assign orders to delivery personnel
- View order details
- Track all active deliveries

### 4. Delivery Person App Interface
Create `client/src/pages/DeliveryDashboard.jsx` for delivery role:
- View assigned deliveries
- Update GPS location (use navigator.geolocation)
- Mark arrival at destination
- View customer address and contact
- Navigation integration (Google Maps/Apple Maps)

### 5. Admin Dashboard Updates
Update `client/src/pages/AdminDashboard.jsx`:
- Add "Deliverable" checkbox when adding/editing menu items
- Add section to create ordermanager and delivery users
- View delivery analytics

## 🔄 Order Status Flow

### Pickup Orders:
1. **pending** → Payment initiated
2. **ready** → Payment confirmed, ready for pickup
3. **completed** → Customer confirms pickup

### Delivery Orders:
1. **pending** → Payment initiated
2. **confirmed** → Payment confirmed
3. **preparing** → Kitchen preparing order
4. **ready** → Order ready for delivery
5. **out_for_delivery** → Assigned to delivery person, tracking active
6. **delivered** → Delivery person arrived
7. **completed** → Customer confirms receipt

## 📱 Live GPS Tracking Implementation

### Backend (✅ DONE)
- DeliveryTracking model stores GPS coordinates
- `/api/delivery/update-location` endpoint receives GPS updates
- `/api/delivery/track/:orderId` provides real-time location

### Frontend (TO DO)
1. **Delivery Person App** - Use HTML5 Geolocation API:
```javascript
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords
    // Send to backend every 10 seconds
    updateLocation(orderId, latitude, longitude, accuracy)
  },
  (error) => console.error(error),
  { enableHighAccuracy: true, maximumAge: 10000 }
)
```

2. **Customer Tracking View** - Poll for updates:
```javascript
// Already implemented in OrderTracking.jsx
// Polls every 5 seconds when order is out_for_delivery
```

3. **Map Integration** (RECOMMENDED):
   - Install Google Maps or Mapbox SDK
   - Display delivery person location on map
   - Show route from delivery person to customer
   - Calculate ETA

Example with Google Maps:
```bash
npm install @react-google-maps/api
```

## 🔐 Role-Based Access

### Roles:
- **customer** - Place orders, track own orders
- **admin** - Manage menu, view all orders
- **superadmin** - Full system access
- **ordermanager** - Manage orders, assign deliveries
- **delivery** - Update location, view assigned deliveries

### Middleware:
The `requireRole` middleware already supports multiple roles:
```javascript
requireRole(['admin', 'ordermanager'])
```

## 📊 Next Steps

### High Priority:
1. ✅ Update Checkout.jsx with delivery options
2. ✅ Integrate OrderTracking.jsx into App.jsx routing
3. ⬜ Create OrderManagement.jsx for order managers
4. ⬜ Create DeliveryDashboard.jsx for delivery personnel
5. ⬜ Update AdminDashboard.jsx for deliverable checkbox
6. ⬜ Integrate Google Maps or Mapbox for live tracking

### Medium Priority:
7. ⬜ Add push notifications for order status updates
8. ⬜ SMS notifications for delivery updates
9. ⬜ QR code generation for order verification
10. ⬜ Calculate ETA based on distance
11. ⬜ Add delivery person ratings

### Nice to Have:
12. ⬜ Delivery zones with different shipping fees
13. ⬜ Scheduled delivery times
14. ⬜ Multi-stop route optimization
15. ⬜ Delivery person earnings dashboard
16. ⬜ Customer delivery preferences

## 🧪 Testing Checklist

### Backend:
- [x] Models updated and migrated
- [ ] Test order creation with delivery
- [ ] Test GPS location updates
- [ ] Test status changes
- [ ] Test role-based access

### Frontend:
- [ ] Test delivery option selection
- [ ] Test address input validation
- [ ] Test shipping fee calculation
- [ ] Test live tracking updates
- [ ] Test order completion confirmation
- [ ] Test different user roles

## 📱 Mobile Considerations
For production, consider:
- React Native app for delivery personnel
- Better GPS tracking (background location)
- Offline support for delivery app
- Battery optimization for continuous GPS

## 🔒 Security Notes
- GPS coordinates should only be visible to:
  - The customer who placed the order
  - Order managers and admins
  - The assigned delivery person
- Implement rate limiting on location updates
- Validate GPS coordinates (reasonable ranges)
- Encrypt sensitive delivery information

## 📈 Analytics to Track
- Average delivery time
- Delivery success rate
- Customer satisfaction ratings
- Delivery person performance
- Popular delivery zones
- Peak delivery times

---

## Quick Start for Frontend Developer

1. **Update Checkout Page:**
   - Add delivery type selection
   - Add address form
   - Update payment to include shipping fee

2. **Add Routing:**
   ```jsx
   <Route path="/orders" element={<OrderTracking />} />
   <Route path="/order-management" element={<OrderManagement />} />
   <Route path="/delivery" element={<DeliveryDashboard />} />
   ```

3. **Test Flow:**
   - Customer: Browse → Add to cart → Select delivery → Enter address → Pay → Track
   - Order Manager: View orders → Assign to delivery → Update status
   - Delivery: View assigned → Navigate → Update location → Mark delivered
   - Customer: Confirm receipt → Rate delivery

---

**Status:** Backend complete ✅ | Frontend 40% complete ⚙️
**Last Updated:** November 8, 2025

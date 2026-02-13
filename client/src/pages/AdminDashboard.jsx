import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { token, user, isSuperAdmin } = useAuth()
  const [menu, setMenu] = useState({ appetizers: [], breakfast: [], lunch: [], dinner: [], desserts: [], snacks: [], drinks: [] })
  
  // Set default tab based on user role
  const getDefaultTab = () => {
    if (!user?.roles) return 'settings'
    if (user.roles.includes('superadmin') || user.roles.includes('admin')) return 'menu'
    if (user.roles.includes('ordermanager')) return 'orders'
    if (user.roles.includes('delivery')) return 'delivery'
    if (user.roles.includes('feedback_manager')) return 'feedback'
    return 'settings'
  }
  
  const [activeTab, setActiveTab] = useState(getDefaultTab())
  const [users, setUsers] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('appetizers')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  
  // Feedback management state
  const [feedbacks, setFeedbacks] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  
  // Order management state
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([])
  const [orderFilter, setOrderFilter] = useState('all')
  
  // Delivery state
  const [activeDeliveries, setActiveDeliveries] = useState([])

  useEffect(() => {
    loadMenu()
    if (isSuperAdmin) {
      loadUsers()
    }
    if (activeTab === 'feedback') {
      loadFeedbacks()
    }
    if (activeTab === 'orders') {
      loadOrders()
      loadDeliveryPersonnel()
    }
    if (activeTab === 'delivery') {
      loadActiveDeliveries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, statusFilter, categoryFilter, orderFilter])

  async function loadMenu() {
    const res = await fetch(getApiUrl('/api/menu'))
    const data = await res.json()
    setMenu(data)
  }

  async function loadUsers() {
    const res = await fetch(getApiUrl('/api/superadmin/users'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
   

  async function loadFeedbacks() {
    try {
      const queryParams = new URLSearchParams()
      if (statusFilter !== 'all') queryParams.append('status', statusFilter)
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter)
      
      const res = await fetch(getApiUrl(`/api/feedback/all?${queryParams}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        const data = await res.json()
        setFeedbacks(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Failed to load feedbacks:', error)
    }
  }

  async function handleRespondToFeedback(feedbackId) {
    if (!responseMessage.trim()) {
      alert('Please enter a response message')
      return
    }

    try {
      const res = await fetch(getApiUrl(`/api/feedback/${feedbackId}/respond`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: responseMessage,
          status: 'in_progress'
        })
      })

      const data = await res.json()

      if (data.success) {
        alert('Response sent successfully!')
        setResponseMessage('')
        setSelectedFeedback(null)
        loadFeedbacks()
      } else {
        alert(data.error || 'Failed to send response')
      }
    } catch (error) {
      console.error('Respond to feedback error:', error)
      alert('Failed to send response')
    }
  }

  async function handleUpdateFeedbackStatus(feedbackId, newStatus) {
    try {
      const res = await fetch(getApiUrl(`/api/feedback/${feedbackId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await res.json()

      if (data.success) {
        loadFeedbacks()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      alert('Failed to update status')
    }
  }

  const getCategoryIcon = (category) => {
    const icons = {
      food_quality: '🍽️',
   

  async function loadOrders() {
    try {
      const endpoint = orderFilter === 'all' ? '/api/orders/manage' : `/api/orders/manage?status=${orderFilter}`
      const res = await fetch(getApiUrl(endpoint), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  async function loadDeliveryPersonnel() {
    try {
      const res = await fetch(getApiUrl('/api/delivery-personnel'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setDeliveryPersonnel(data)
      }
    } catch (error) {
      console.error('Failed to load delivery personnel:', error)
    }
  }

  async function loadActiveDeliveries() {
    try {
      const res = await fetch(getApiUrl('/api/delivery/my-deliveries'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setActiveDeliveries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load deliveries:', error)
    }
  }

  async function updateOrderStatus(orderId, newStatus, note = '') {
    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, note })
      })
      
      if (res.ok) {
        alert(`Order status updated to: ${newStatus}`)
        loadOrders()
        if (selectedOrder?.orderId === orderId) {
          setSelectedOrder(null)
        }
      }
    } catch (error) {
      alert('Failed to update order status')
    }
  }

  async function assignDelivery(orderId, deliveryPersonId) {
    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}/assign`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ deliveryPersonId })
      })
      
      if (res.ok) {
        alert('Delivery person assigned successfully')
        loadOrders()
      }
    } catch (error) {
      alert('Failed to assign delivery person')
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
      completed: '#228b22'
    }
    return colors[status] || '#666'
  }   service: '👨‍💼',
      delivery: '🚚',
      general: '💬',
      complaint: '⚠️',
      suggestion: '💡'
    }
    return icons[category] || '💬'
  }   const data = await res.json()
      setUsers(data)
    }
  }

  async function handleImageUpload(file) {
    if (!file) return null
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch(getApiUrl('/api/admin/upload'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      
      const data = await res.json()
      if (data.success) {
        return data.imageUrl
      }
    } catch (err) {
      alert('Image upload failed')
    } finally {
      setUploadingImage(false)
    }
    return null
  }

  async function handleAddItem(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    let imageUrl = formData.get('imageUrl')
    const imageFile = formData.get('imageFile')
    
    if (imageFile && imageFile.size > 0) {
      imageUrl = await handleImageUpload(imageFile)
    }

    // Collect selected order categories from checkboxes
    const orderCategories = []
    const categoryCheckboxes = e.target.querySelectorAll('input[name="orderCategory"]:checked')
    categoryCheckboxes.forEach(cb => orderCategories.push(cb.value))
    
    // Default to dine-in if nothing selected
    const finalCategories = orderCategories.length > 0 ? orderCategories : ['dine-in']

    const item = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      image: imageUrl,
      available: formData.get('available') !== 'false',
      orderCategory: finalCategories, // Array of categories
      deliverable: finalCategories.includes('delivery'),
      shippingFee: finalCategories.includes('delivery') ? parseFloat(formData.get('shippingFee') || 200) : 0
    }

    const res = await fetch(getApiUrl(`/api/admin/menu/${selectedCategory}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })

    if (res.ok) {
      loadMenu()
      setShowAddForm(false)
      setImagePreview(null)
      e.target.reset()
    }
  }

  async function handleEditItem(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    let imageUrl = editingItem.image
    const imageFile = formData.get('imageFile')
    
    if (imageFile && imageFile.size > 0) {
      imageUrl = await handleImageUpload(imageFile)
    } else if (formData.get('imageUrl')) {
      imageUrl = formData.get('imageUrl')
    }

    // Collect selected order categories from checkboxes
    const orderCategories = []
    const categoryCheckboxes = e.target.querySelectorAll('input[name="orderCategory"]:checked')
    categoryCheckboxes.forEach(cb => orderCategories.push(cb.value))
    
    // Default to dine-in if nothing selected
    const finalCategories = orderCategories.length > 0 ? orderCategories : ['dine-in']

    const item = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      image: imageUrl,
      available: formData.get('available') !== 'false',
      orderCategory: finalCategories,
      deliverable: finalCategories.includes('delivery'),
      shippingFee: finalCategories.includes('delivery') ? parseFloat(formData.get('shippingFee') || 200) : 0
    }

    await handleUpdateItem(editingItem.category, editingItem.id, item)
  }

  function handleImageFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleUpdateItem(category, id, item) {
    const res = await fetch(getApiUrl(`/api/admin/menu/${category}/${id}`), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    })

    if (res.ok) {
      loadMenu()
      setEditingItem(null)
      setImagePreview(null)
    }
  }

  function openEditModal(item, category) {
    setEditingItem({ ...item, category })
    setImagePreview(item.image)
  }

  async function handleDeleteItem(category, id) {
    if (!confirm('Are you sure you want to delete this item?')) return

    const res = await fetch(getApiUrl(`/api/admin/menu/${category}/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (res.ok) {
      loadMenu()
    }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    // Collect selected roles from checkboxes
    const selectedRoles = []
    const checkboxes = e.target.querySelectorAll('input[name="roles"]:checked')
    checkboxes.forEach(cb => selectedRoles.push(cb.value))
    
    if (selectedRoles.length === 0) {
      alert('Please select at least one role')
      return
    }
    
    const res = await fetch(getApiUrl('/api/superadmin/create-admin'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        roles: selectedRoles,
        phone: formData.get('phone')
      })
    })

    const data = await res.json()
    
    if (res.ok) {
      loadUsers()
      e.target.reset()
      alert(`User created successfully with roles: ${data.user.roles.join(', ')}`)
    } else {
      alert(`Failed to create user: ${data.error}`)
    }
  }

  async function handleDeleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return

    const res = await fetch(getApiUrl(`/api/superadmin/users/${id}`), {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    const data = await res.json()
    
    if (res.ok) {
      loadUsers()
      alert('User deleted successfully')
    } else {
      alert(`Failed to delete user: ${data.error}`)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordMessage('')

    const formData = new FormData(e.target)
    const currentPassword = formData.get('currentPassword')
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }

    const res = await fetch(getApiUrl('/api/auth/change-password'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    })

    const data = await res.json()

    if (res.ok) {
      setPasswordMessage('✅ Password changed successfully!')
      e.target.reset()
      setTimeout(() => {
        setShowChangePassword(false)
        setPasswordMessage('')
      }, 2000)
    } else {
      setPasswordMessage(`❌ ${data.error || 'Failed to change password'}`)
    }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user?.username} ({user?.roles?.join(', ') || user?.role})</p>
      </header>

      <nav className="admin-nav">
        {/* Menu Management - Admin and SuperAdmin */}
        {(user?.roles?.includes('admin') || isSuperAdmin) && (
          <button
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => setActiveTab('menu')}
          >
            Menu Management
          </button>
        )}
        
        {/* User Management - SuperAdmin only */}
        {isSuperAdmin && (
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        )}
        
        {/* Order Management - Admin, SuperAdmin, OrderManager */}
        {(user?.roles?.includes('admin') || 
          user?.roles?.includes('ordermanager') || 
          isSuperAdmin) && (
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
        )}
        
        {/* Delivery - SuperAdmin and Delivery Personnel */}
        {(user?.roles?.includes('delivery') || isSuperAdmin) && (
          <button
            className={activeTab === 'delivery' ? 'active' : ''}
            onClick={() => setActiveTab('delivery')}
          >
            🚚 Delivery
          </button>
        )}
        
        {/* Feedback - Admin, SuperAdmin, Feedback Manager */}
        {(user?.roles?.includes('admin') || 
          user?.roles?.includes('feedback_manager') || 
          isSuperAdmin) && (
          <button
            className={activeTab === 'feedback' ? 'active' : ''}
            onClick={() => setActiveTab('feedback')}
          >
            💬 Feedback
          </button>
        )}
        
        {/* Settings - Everyone */}
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      {/* Menu Management - Admin and SuperAdmin only */}
      {activeTab === 'menu' && (user?.roles?.includes('admin') || isSuperAdmin) && (
        <div className="admin-content">
          <div className="admin-toolbar">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="appetizers">🥟 Appetizers</option>
              <option value="breakfast">🍳 Breakfast</option>
              <option value="lunch">🍔 Lunch</option>
              <option value="dinner">🍖 Dinner</option>
              <option value="desserts">🍰 Desserts</option>
              <option value="snacks">🍿 Snacks</option>
              <option value="drinks">☕ Drinks</option>
            </select>
            <button className="add-btn" onClick={() => setShowAddForm(true)}>
              + Add Item
            </button>
          </div>

          {showAddForm && (
            <div className="modal-overlay" onClick={() => { setShowAddForm(false); setImagePreview(null) }}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Add New Item</h3>
                <form onSubmit={handleAddItem}>
                  <input name="name" placeholder="Item name" required />
                  <textarea name="description" placeholder="Description" required />
                  <input name="price" type="number" step="0.01" placeholder="Price (KSH)" required />
                  <div className="image-upload-section">
                    <label>Upload Image:</label>
                    <input 
                      type="file" 
                      name="imageFile" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                    <span>OR</span>
                    <input name="imageUrl" placeholder="Image URL (optional)" />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <div className="availability-section">
                    <label>
                      <input type="checkbox" name="available" defaultChecked />
                      Available (uncheck to mark unavailable)
                    </label>
                  </div>
                  <div className="order-category-section">
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Order Type (select all that apply):</label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="dine-in" defaultChecked />
                      🍽️ Dine-In
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="pickup" />
                      🛍️ Pickup
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="delivery" onChange={(e) => {
                        const feeSection = document.getElementById('shippingFeeSection')
                        if (feeSection) feeSection.style.display = e.target.checked ? 'block' : 'none'
                      }} />
                      🚚 Delivery
                    </label>
                    <div id="shippingFeeSection" style={{marginLeft: '24px', marginTop: '5px', display: 'none'}}>
                      <input 
                        type="number" 
                        name="shippingFee" 
                        placeholder="Shipping Fee (KSH)" 
                        defaultValue="200"
                        step="0.01"
                        style={{width: '180px', padding: '5px'}}
                      />
                    </div>
                  </div>
                  <div className="modal-buttons">
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Order Type (select all that apply):</label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="dine-in" defaultChecked />
                      🍽️ Dine-In
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="pickup" />
                      🛍️ Pickup
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input type="checkbox" name="orderCategory" value="delivery" id="deliveryCheckbox" />
                      🚚 Delivery
                    </label>
                    <div id="shippingFeeSection" style={{marginLeft: '24px', marginTop: '5px', display: 'none'}}>
                      <input 
                        type="number" 
                        name="shippingFee" 
                        placeholder="Shipping Fee (KSH)" 
                        defaultValue="200"
                        step="0.01"
                        style={{width: '180px'}}
                      />
                    </div>
                  </div>
                  <script dangerouslySetInnerHTML={{__html: `
                    document.getElementById('deliveryCheckbox')?.addEventListener('change', function(e) {
                      document.getElementById('shippingFeeSection').style.display = e.target.checked ? 'block' : 'none';
                    });
                  `}} />
                  <div className="modal-buttons">
                    <button type="submit" disabled={uploadingImage}>
                      {uploadingImage ? 'Uploading...' : 'Add Item'}
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null) }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {editingItem && (
            <div className="modal-overlay" onClick={() => { setEditingItem(null); setImagePreview(null) }}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                <h3>Edit Item</h3>
                <form onSubmit={handleEditItem}>
                  <input name="name" defaultValue={editingItem.name} placeholder="Item name" required />
                  <textarea name="description" defaultValue={editingItem.description} placeholder="Description" required />
                  <input name="price" type="number" step="0.01" defaultValue={editingItem.price} placeholder="Price (KSH)" required />
                  <div className="image-upload-section">
                    <label>Upload New Image:</label>
                    <input 
                      type="file" 
                      name="imageFile" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                    />
                    <span>OR</span>
                    <input name="imageUrl" defaultValue={editingItem.image} placeholder="Image URL" />
                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                  </div>
                  <div className="availability-section">
                    <label>
                      <input type="checkbox" name="available" defaultChecked={editingItem.available !== false} />
                      Available (uncheck to mark unavailable)
                    </label>
                  </div>
                  <div className="order-category-section">
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Order Type (select all that apply):</label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="dine-in" 
                        defaultChecked={Array.isArray(editingItem.orderCategory) ? editingItem.orderCategory.includes('dine-in') : true}
                      />
                      🍽️ Dine-In
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="pickup"
                        defaultChecked={Array.isArray(editingItem.orderCategory) && editingItem.orderCategory.includes('pickup')}
                      />
                      🛍️ Pickup
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="delivery" 
                        defaultChecked={Array.isArray(editingItem.orderCategory) && editingItem.orderCategory.includes('delivery')}
                        onChange={(e) => {
                          const feeSection = document.getElementById('editShippingFeeSection')
                          if (feeSection) feeSection.style.display = e.target.checked ? 'block' : 'none'
                        }}
                      />
                      🚚 Delivery
                    </label>
                    <div id="editShippingFeeSection" style={{marginLeft: '24px', marginTop: '5px', display: editingItem.deliverable ? 'block' : 'none'}}>
                      <input 
                        type="number" 
                        name="shippingFee" 
                        placeholder="Shipping Fee (KSH)" 
                        defaultValue={editingItem.shippingFee || 200}
                        step="0.01"
                        style={{width: '180px', padding: '5px'}}
                      />
                    </div>
                  </div>
                  <div className="modal-buttons">
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>Order Type (select all that apply):</label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="dine-in" 
                        defaultChecked={Array.isArray(editingItem.orderCategory) ? editingItem.orderCategory.includes('dine-in') : true}
                      />
                      🍽️ Dine-In
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="pickup"
                        defaultChecked={Array.isArray(editingItem.orderCategory) && editingItem.orderCategory.includes('pickup')}
                      />
                      🛍️ Pickup
                    </label>
                    <label style={{display: 'block', marginBottom: '5px'}}>
                      <input 
                        type="checkbox" 
                        name="orderCategory" 
                        value="delivery" 
                        id="editDeliveryCheckbox"
                        defaultChecked={Array.isArray(editingItem.orderCategory) && editingItem.orderCategory.includes('delivery')}
                      />
                      🚚 Delivery
                    </label>
                    <div id="editShippingFeeSection" style={{marginLeft: '24px', marginTop: '5px', display: editingItem.deliverable ? 'block' : 'none'}}>
                      <input 
                        type="number" 
                        name="shippingFee" 
                        placeholder="Shipping Fee (KSH)" 
                        defaultValue={editingItem.shippingFee || 200}
                        step="0.01"
                        style={{width: '180px'}}
                      />
                    </div>
                  </div>
                  <script dangerouslySetInnerHTML={{__html: `
                    document.getElementById('editDeliveryCheckbox')?.addEventListener('change', function(e) {
                      document.getElementById('editShippingFeeSection').style.display = e.target.checked ? 'block' : 'none';
                    });
                  `}} />
                  <div className="modal-buttons">
                    <button type="submit" disabled={uploadingImage}>
                      {uploadingImage ? 'Uploading...' : 'Update Item'}
                    </button>
                    <button type="button" onClick={() => { setEditingItem(null); setImagePreview(null) }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="menu-items-grid">
            {menu[selectedCategory]?.map(item => (
              <div key={item.id} className="admin-item-card">
                {item.image && <img src={item.image} alt={item.name} />}
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p className="price">KSH {item.price.toFixed(0)}</p>
                </div>
                <div className="item-actions">
                  <button onClick={() => openEditModal(item, selectedCategory)}>Edit</button>
                  <button onClick={() => handleDeleteItem(selectedCategory, item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && isSuperAdmin && (
        <div className="admin-content">
          <div className="admin-panel">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateAdmin} className="admin-form">
              <input name="username" placeholder="Username" required />
              <input name="email" type="email" placeholder="Email" required />
              <input name="password" type="password" placeholder="Password (min 6 chars)" required />
              <input name="phone" type="tel" placeholder="Phone (optional for delivery)" />
              
              <div className="roles-section">
                <label className="section-label">Select Roles (one or more):</label>
                <div className="role-checkboxes">
                  <label className="role-checkbox-label">
                    <input type="checkbox" name="roles" value="admin" />
                    <span>👨‍💼 Admin - Full menu & order management</span>
                  </label>
                  <label className="role-checkbox-label">
                    <input type="checkbox" name="roles" value="ordermanager" />
                    <span>📋 Order Manager - Manage orders only</span>
                  </label>
                  <label className="role-checkbox-label">
                    <input type="checkbox" name="roles" value="delivery" />
                    <span>🚴 Delivery Person - View & deliver orders</span>
                  </label>
                  <label className="role-checkbox-label">
                    <input type="checkbox" name="roles" value="customer" />
                    <span>🛒 Customer - Place orders only</span>
                  </label>
                </div>
              </div>
              
              <button type="submit">Create User</button>
            </form>
            <p className="info-note">
              ℹ️ Only superadmin has all privileges. Users can have multiple roles to access different dashboards.
            </p>
          </div>

          <div className="users-list">
            <h3>All Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const userRoles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : [])
                  const isSuperadmin = userRoles.includes('superadmin')
                  
                  return (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '-'}</td>
                      <td>
                        <div className="roles-badges">
                          {userRoles.map(role => (
                            <span key={role} className={`role-badge ${role}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        {isSuperadmin ? (
                          <span className="protected-badge">🔒 Protected</span>
                        ) : u.id !== user.id ? (
                          <button onClick={() => handleDeleteUser(u.id)} className="delete-btn">Delete</button>
                        ) : (
                          <span className="self-badge">You</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Management - Admin, SuperAdmin, OrderManager only */}
      {activeTab === 'orders' && 
       (user?.roles?.includes('admin') || 
        user?.roles?.includes('ordermanager') || 
        isSuperAdmin) && (
        <div className="admin-content">
          <div className="orders-header">
            <h2>📦 Order Management</h2>
            <div className="orders-stats">
              <div className="stat-card">
                <span className="stat-number">{orders.filter(o => o.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{orders.filter(o => o.status === 'preparing').length}</span>
                <span className="stat-label">Preparing</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{orders.filter(o => o.status === 'ready').length}</span>
                <span className="stat-label">Ready</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{orders.filter(o => o.status === 'out_for_delivery').length}</span>
                <span className="stat-label">Delivering</span>
              </div>
            </div>
          </div>

          <div className="orders-filters">
            <select 
              value={orderFilter} 
              onChange={(e) => setOrderFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
            </select>
            <button onClick={loadOrders} className="refresh-btn">🔄 Refresh</button>
          </div>

          {orders.length === 0 ? (
            <div className="no-data">No orders found</div>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <h3>Order #{order.orderId}</h3>
                    <span 
                      className="order-status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.customerName || order.username}</p>
                    <p><strong>Items:</strong> {order.items.length}</p>
                    <p><strong>Total:</strong> KSH {order.grandTotal}</p>
                    <p><strong>Type:</strong> {order.orderType || order.deliveryType}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>

                  {order.deliveryAddress && (
                    <div className="delivery-info">
                      <strong>📍 Delivery Address:</strong>
                      <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                      <p>📞 {order.deliveryAddress.phone}</p>
                    </div>
                  )}

                  <div className="order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready">Ready</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="completed">Completed</option>
                    </select>

                    {(order.orderType === 'delivery' || order.deliveryType === 'delivery') && 
                     order.status !== 'delivered' && 
                     order.status !== 'completed' && (
                      <select
                        value={order.assignedTo?._id || ''}
                        onChange={(e) => assignDelivery(order.orderId, e.target.value)}
                        className="delivery-select"
                      >
                        <option value="">Assign Driver</option>
                        {deliveryPersonnel.map(person => (
                          <option key={person._id} value={person._id}>
                            {person.username}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {order.assignedTo && (
                    <div className="assigned-driver">
                      <strong>🚴 Driver:</strong> {order.assignedTo.username}
                      {order.assignedTo.phone && <span> • 📞 {order.assignedTo.phone}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
       /* Delivery Management - SuperAdmin and Delivery Personnel only */}
      {activeTab === 'delivery' && 
       (user?.roles?.includes('delivery') || isSuperAdmin)
        </div>
      )}

      {activeTab === 'delivery' && (
        <div className="admin-content">
          <div className="delivery-header">
            <h2>🚚 Active Deliveries</h2>
            <div className="delivery-stats">
              <div className="stat-card">
                <span className="stat-number">{activeDeliveries.length}</span>
                <span className="stat-label">Active Deliveries</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{activeDeliveries.filter(d => d.status === 'out_for_delivery').length}</span>
                <span className="stat-label">In Transit</span>
              </div>
            </div>
          </div>

          <button onClick={loadActiveDeliveries} className="refresh-btn">🔄 Refresh</button>

          {activeDeliveries.length === 0 ? (
            <div className="no-data">
              <p>No active deliveries at the moment</p>
            </div>
          ) : (
            <div className="deliveries-grid">
              {activeDeliveries.map(delivery => (
                <div key={delivery._id} className="delivery-card">
                  <div className="delivery-card-header">
                    <h3>Order #{delivery.orderId}</h3>
                    <span 
                      className="delivery-status-badge" 
                      style={{ backgroundColor: getStatusColor(delivery.status) }}
                    >
                      {delivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="delivery-details">
                    <p><strong>Customer:</strong> {delivery.customerName}</p>
                    <p><strong>Total:</strong> KSH {delivery.grandTotal}</p>
                    {delivery.deliveryAddress && (
                      <>
                        <p><strong>📍 Address:</strong></p>
                        <p>{delivery.deliveryAddress.street}</p>
                        <p>{delivery.deliveryAddress.city}</p>
                        <p>📞 {delivery.deliveryAddress.phone}</p>
                      </>
                    )}
                    {delivery.assignedTo && (
                      <p><strong>🚴 Driver:</strong> {delivery.assignedTo.username}</p>
                    )}
                  </div>

                  <div className="delivery-items">
                    <strong>Items:</strong>
                    <ul>
                      {delivery.items.map((item, idx) => (
                        <li key={idx}>{item.name} x{item.quantity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )/* Feedback Management - Admin, SuperAdmin, Feedback Manager only */}
      {activeTab === 'feedback' && 
       (user?.roles?.includes('admin') || 
        user?.roles?.includes('feedback_manager') || 
        isSuperAdmin)

      {activeTab === 'feedback' && (
        <div className="admin-content">
          <div className="feedback-header">
            <h2>📋 Customer Feedback</h2>
            <div className="feedback-stats">
              <div className="stat-card">
                <span className="stat-number">{feedbacks.filter(f => f.status === 'pending').length}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{feedbacks.filter(f => f.status === 'in_progress').length}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{feedbacks.filter(f => f.status === 'resolved').length}</span>
                <span className="stat-label">Resolved</span>
              </div>
            </div>
          </div>

          <div className="feedback-filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="food_quality">Food Quality</option>
              <option value="service">Service</option>
              <option value="delivery">Delivery</option>
              <option value="general">General</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
            </select>

            <button onClick={loadFeedbacks} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>

          {feedbacks.length === 0 ? (
            <div className="no-data">No feedback found</div>
          ) : (
            <div className="feedbacks-grid">
              {feedbacks.map(feedback => (
                <div key={feedback._id} className="feedback-card">
                  <div className="feedback-card-header">
                    <div className="feedback-meta">
                      <span className="feedback-category">
                        {getCategoryIcon(feedback.category)} {feedback.category.replace('_', ' ')}
                      </span>
                      <span className={`feedback-status status-${feedback.status}`}>
                        {feedback.status.replace('_', ' ')}
                      </span>
                    </div>
                    {feedback.rating && (
                      <div className="feedback-rating">
                        {'⭐'.repeat(feedback.rating)}
                      </div>
                    )}
                  </div>

                  <h3 className="feedback-subject">{feedback.subject}</h3>
                  <p className="feedback-message">{feedback.message}</p>

                  <div className="feedback-user-info">
                    <span>👤 {feedback.username}</span>
                    <span>📅 {new Date(feedback.createdAt).toLocaleDateString()}</span>
                  </div>

                  {feedback.response && (
                    <div className="feedback-response">
                      <strong>Response:</strong>
                      <p>{feedback.response.message}</p>
                      <small>
                        Responded on {new Date(feedback.response.respondedAt).toLocaleDateString()}
                      </small>
                    </div>
                  )}

                  <div className="feedback-actions">
                    {!feedback.response && (
                      <button 
                        onClick={() => setSelectedFeedback(feedback)}
                        className="btn-respond"
                      >
                        💬 Respond
                      </button>
                    )}
                    
                    <select
                      value={feedback.status}
                      onChange={(e) => handleUpdateFeedbackStatus(feedback.feedbackId, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Response Modal */}
          {selectedFeedback && (
            <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Respond to Feedback</h2>
                  <button onClick={() => setSelectedFeedback(null)} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                  <div className="feedback-details">
                    <h3>{selectedFeedback.subject}</h3>
                    <p><strong>From:</strong> {selectedFeedback.username}</p>
                    <p><strong>Category:</strong> {selectedFeedback.category}</p>
                    <p><strong>Message:</strong></p>
                    <p className="original-message">{selectedFeedback.message}</p>
                  </div>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Type your response here..."
                    rows="6"
                    className="response-textarea"
                  />
                </div>
                <div className="modal-footer">
                  <button onClick={() => setSelectedFeedback(null)} className="btn-cancel">
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleRespondToFeedback(selectedFeedback.feedbackId)}
                    className="btn-send"
                  >
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="admin-content">
          <div className="settings-container">
            <div className="settings-section">
              <h3>Account Settings</h3>
              <div className="account-info">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Roles:</strong> 
                  {user?.roles?.map(role => (
                    <span key={role} className={`role-badge ${role}`} style={{ marginLeft: '0.5rem' }}>
                      {role}
                    </span>
                  )) || <span className={`role-badge ${user?.role}`}>{user?.role}</span>}
                </p>
              </div>
            </div>

            <div className="settings-section">
              <h3>Change Password</h3>
              {!showChangePassword ? (
                <button 
                  className="change-password-btn"
                  onClick={() => setShowChangePassword(true)}
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      name="currentPassword" 
                      placeholder="Enter current password" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      name="newPassword" 
                      placeholder="Enter new password (min 6 characters)" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      placeholder="Re-enter new password" 
                      required 
                    />
                  </div>

                  {passwordMessage && (
                    <div className={`password-message ${passwordMessage.includes('✅') ? 'success' : 'error'}`}>
                      {passwordMessage}
                    </div>
                  )}

                  <div className="form-buttons">
                    <button type="submit">Update Password</button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowChangePassword(false)
                        setPasswordMessage('')
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Role-based Privileges Section */}
            <div className="settings-section">
              <h3>🔐 Your Access & Privileges</h3>
              <p><strong>Roles:</strong> {user?.roles?.join(', ') || user?.role}</p>
              <p>You have access to:</p>
              <ul>
                {(user?.roles?.includes('admin') || isSuperAdmin) && (
                  <li>✅ Menu Management - Add, edit, delete menu items</li>
                )}
                {isSuperAdmin && (
                  <li>✅ User Management - Create and manage admin accounts</li>
                )}
                {(user?.roles?.includes('admin') || 
                  user?.roles?.includes('ordermanager') || 
                  isSuperAdmin) && (
                  <li>✅ Order Management - View and manage all orders</li>
                )}
                {(user?.roles?.includes('delivery') || isSuperAdmin) && (
                  <li>✅ Delivery Management - Track and manage deliveries</li>
                )}
                {(user?.roles?.includes('admin') || 
                  user?.roles?.includes('feedback_manager') || 
                  isSuperAdmin) && (
                  <li>✅ Feedback Management - View and respond to customer feedback</li>
                )}
                <li>✅ Settings - Change your credentials</li>
              </ul>
              {isSuperAdmin && (
                <div className="superadmin-badge">
                  <strong>⭐ Super Admin</strong> - You have full system access
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getApiUrl } from '../config/api'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { token, user, isSuperAdmin } = useAuth()
  const [menu, setMenu] = useState({ appetizers: [], breakfast: [], lunch: [], dinner: [], desserts: [], snacks: [], drinks: [] })
  const [activeTab, setActiveTab] = useState('menu')
  const [users, setUsers] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('appetizers')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  useEffect(() => {
    loadMenu()
    if (isSuperAdmin) {
      loadUsers()
    }
  }, [])

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
      const data = await res.json()
      setUsers(data)
    }
  }

  async function handleImageUpload(file) {
    if (!file) return null
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/admin/upload', {
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

    const item = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      image: imageUrl
    }

    const res = await fetch(`/api/admin/menu/${selectedCategory}`, {
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

    const item = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      image: imageUrl
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
    const res = await fetch(`/api/admin/menu/${category}/${id}`, {
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

    const res = await fetch(`/api/admin/menu/${category}/${id}`, {
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
    
    const res = await fetch('/api/superadmin/create-admin', {
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

    const res = await fetch(`/api/superadmin/users/${id}`, {
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

    const res = await fetch('/api/auth/change-password', {
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
        <p>Welcome, {user?.username} ({user?.role})</p>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'menu' ? 'active' : ''}
          onClick={() => setActiveTab('menu')}
        >
          Menu Management
        </button>
        {isSuperAdmin && (
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        )}
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      {activeTab === 'menu' && (
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
            <div className="modal-overlay" onClick={() => { setShowAddForm(false); setImagePreview(null); }}>
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

                  <div className="modal-buttons">
                    <button type="submit" disabled={uploadingImage}>
                      {uploadingImage ? 'Uploading...' : 'Add Item'}
                    </button>
                    <button type="button" onClick={() => { setShowAddForm(false); setImagePreview(null); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {editingItem && (
            <div className="modal-overlay" onClick={() => { setEditingItem(null); setImagePreview(null); }}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
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

                  <div className="modal-buttons">
                    <button type="submit" disabled={uploadingImage}>
                      {uploadingImage ? 'Uploading...' : 'Update Item'}
                    </button>
                    <button type="button" onClick={() => { setEditingItem(null); setImagePreview(null); }}>
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

      {activeTab === 'settings' && (
        <div className="admin-content">
          <div className="settings-container">
            <div className="settings-section">
              <h3>Account Settings</h3>
              <div className="account-info">
                <p><strong>Username:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> <span className={`role-badge ${user?.role}`}>{user?.role}</span></p>
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

            {isSuperAdmin && (
              <div className="settings-section">
                <h3>⚠️ Super Admin Privileges</h3>
                <p>You have full access to:</p>
                <ul>
                  <li>Menu Management - Add, edit, delete items</li>
                  <li>User Management - Create and manage admin accounts</li>
                  <li>Settings - Change your credentials</li>
                  <li>Order History - View all orders</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

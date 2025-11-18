import { useState, useEffect } from 'react'
import { getApiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'
import './FeedbackManagerDashboard.css'

export default function FeedbackManagerDashboard() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [responseMessage, setResponseMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchFeedbacks()
  }, [statusFilter, categoryFilter])

  const fetchFeedbacks = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const queryParams = new URLSearchParams()
      if (statusFilter !== 'all') queryParams.append('status', statusFilter)
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter)
      
      const response = await fetch(getApiUrl(`/api/feedback/all?${queryParams}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setFeedbacks(Array.isArray(data) ? data : [])
      } else {
        setError(data.error || 'Failed to fetch feedback')
      }
    } catch (error) {
      console.error('Fetch feedbacks error:', error)
      setError('Failed to load feedbacks')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToFeedback = async (feedbackId) => {
    if (!responseMessage.trim()) {
      alert('Please enter a response message')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/api/feedback/${feedbackId}/respond`), {
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

      const data = await response.json()

      if (data.success) {
        alert('Response sent successfully!')
        setResponseMessage('')
        setSelectedFeedback(null)
        fetchFeedbacks()
      } else {
        alert(data.error || 'Failed to send response')
      }
    } catch (error) {
      console.error('Respond to feedback error:', error)
      alert('Failed to send response')
    }
  }

  const handleUpdateStatus = async (feedbackId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/api/feedback/${feedbackId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        fetchFeedbacks()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      alert('Failed to update status')
    }
  }

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      in_progress: 'status-in-progress',
      resolved: 'status-resolved',
      closed: 'status-closed'
    }
    return classes[status] || ''
  }

  const getCategoryIcon = (category) => {
    const icons = {
      food_quality: '🍽️',
      service: '👨‍💼',
      delivery: '🚚',
      general: '💬',
      complaint: '⚠️',
      suggestion: '💡'
    }
    return icons[category] || '💬'
  }

  if (!user || (!user.roles?.includes('feedback_manager') && !user.roles?.includes('superadmin'))) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="feedback-manager-container">
      <div className="feedback-manager-header">
        <h1>📋 Feedback Management</h1>
        <div className="header-stats">
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

        <button onClick={fetchFeedbacks} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading feedbacks...</div>
      ) : feedbacks.length === 0 ? (
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
                  <span className={`feedback-status ${getStatusBadgeClass(feedback.status)}`}>
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
                  onChange={(e) => handleUpdateStatus(feedback.feedbackId, e.target.value)}
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
  )
}

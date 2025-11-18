import { useState, useEffect, useRef } from 'react'
import { getApiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'
import './FeedbackChatbot.css'

export default function FeedbackChatbot() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('feedback') // 'feedback' or 'diet'
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    subject: '',
    category: 'general',
    rating: 0,
    orderId: ''
  })
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          sender: 'bot',
          message: activeTab === 'feedback' 
            ? 'Hello! I\'m here to help you with your feedback. Please share your experience or concern.'
            : 'Hello! I\'m your AI diet assistant. Ask me anything about nutrition, calories, allergies, or dietary recommendations!',
          timestamp: new Date()
        }
      ])
    }
  }, [isOpen, activeTab])

  const handleSubmitFeedback = async () => {
    if (!inputMessage.trim() || !feedbackForm.subject.trim()) {
      alert('Please provide a subject and message')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: feedbackForm.subject,
          message: inputMessage,
          category: feedbackForm.category,
          rating: feedbackForm.rating || null,
          orderId: feedbackForm.orderId || null
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessages([...messages, 
          { sender: 'user', message: inputMessage, timestamp: new Date() },
          { 
            sender: 'bot', 
            message: 'Thank you for your feedback! We\'ve received it and our team will review it shortly. You can check the status in your feedback history.',
            timestamp: new Date() 
          }
        ])
        setInputMessage('')
        setFeedbackForm({
          subject: '',
          category: 'general',
          rating: 0,
          orderId: ''
        })
      } else {
        alert(data.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Submit feedback error:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDietQuery = async () => {
    if (!inputMessage.trim()) return

    const userMessage = { sender: 'user', message: inputMessage, timestamp: new Date() }
    setMessages([...messages, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/api/ai/diet-assistant'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: inputMessage
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          message: data.response,
          disclaimer: data.disclaimer,
          timestamp: new Date()
        }])
      } else {
        setMessages(prev => [...prev, {
          sender: 'bot',
          message: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error('Diet query error:', error)
      setMessages(prev => [...prev, {
        sender: 'bot',
        message: 'Sorry, I\'m having trouble connecting. Please try again later.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = () => {
    if (activeTab === 'feedback') {
      handleSubmitFeedback()
    } else {
      handleDietQuery()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) return null

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-tabs">
              <button 
                className={`chatbot-tab ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('feedback')
                  setMessages([])
                }}
              >
                💭 Feedback
              </button>
              <button 
                className={`chatbot-tab ${activeTab === 'diet' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('diet')
                  setMessages([])
                }}
              >
                🥗 Diet AI
              </button>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-bubble">
                  {msg.message}
                  {msg.disclaimer && (
                    <div className="message-disclaimer">
                      <small>{msg.disclaimer}</small>
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {activeTab === 'feedback' && (
            <div className="feedback-form">
              <input
                type="text"
                placeholder="Subject *"
                value={feedbackForm.subject}
                onChange={(e) => setFeedbackForm({...feedbackForm, subject: e.target.value})}
                className="feedback-input"
              />
              <select
                value={feedbackForm.category}
                onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                className="feedback-select"
              >
                <option value="general">General</option>
                <option value="food_quality">Food Quality</option>
                <option value="service">Service</option>
                <option value="delivery">Delivery</option>
                <option value="complaint">Complaint</option>
                <option value="suggestion">Suggestion</option>
              </select>
              <div className="rating-section">
                <span>Rating: </span>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-btn ${feedbackForm.rating >= star ? 'active' : ''}`}
                    onClick={() => setFeedbackForm({...feedbackForm, rating: star})}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={activeTab === 'feedback' ? 'Share your feedback...' : 'Ask about diet, nutrition, allergies...'}
              rows="2"
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !inputMessage.trim()}
              className="send-btn"
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

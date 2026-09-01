import { Utensils, Pill, User, Sparkles, BookOpen, ArrowRight } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '../config/api'
import ArticleDetail from './ArticleDetail'
import './News.css'

function News() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('diet')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(getApiUrl(`/api/news?category=${encodeURIComponent(category)}`))
      const data = await response.json()
      
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        setArticles(data.articles)
      } else {
        setError('No news articles found for this category.')
      }
    } catch (err) {
      console.error('Fetch news error:', err)
      setError('Unable to load latest news.')
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // If viewing an in-depth article, render ArticleDetail page
  if (selectedArticle) {
    return (
      <ArticleDetail 
        article={selectedArticle} 
        onBack={() => {
          setSelectedArticle(null)
          window.scrollTo(0, 0)
        }} 
      />
    )
  }

  return (
    <div className="news-page">
      {/* Header */}
      <div className="news-header">
        <div className="news-header-content">
          <div className="news-ai-badge-top">
            <Sparkles size={16} className="inline-block mr-1" /> AI-Powered Diet & Nutrition Hub
          </div>
          <h1 className="news-title">Food & Diet News</h1>
          <p className="news-subtitle">
            Explore live nutrition headlines, healthy eating trends, and generate full in-depth AI articles with matching Fresh Bites Café dishes.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="news-filters">
        <div className="filter-container">
          <button 
            className={`filter-btn ${category === 'diet' ? 'active' : ''}`}
            onClick={() => setCategory('diet')}
          >
            <Utensils size={18} className="inline-block mr-1" /> Diet & Weight
          </button>
          <button 
            className={`filter-btn ${category === 'nutrition' ? 'active' : ''}`}
            onClick={() => setCategory('nutrition')}
          >
            <Pill size={18} className="inline-block mr-1" /> Nutrition & Science
          </button>
          <button 
            className={`filter-btn ${category === 'healthy eating' ? 'active' : ''}`}
            onClick={() => setCategory('healthy eating')}
          >
            <Utensils size={18} className="inline-block mr-1" /> Healthy Eating
          </button>
          <button 
            className={`filter-btn ${category === 'food' ? 'active' : ''}`}
            onClick={() => setCategory('food')}
          >
            <BookOpen size={18} className="inline-block mr-1" /> Food Trends
          </button>
          <button 
            className={`filter-btn ${category === 'recipes' ? 'active' : ''}`}
            onClick={() => setCategory('recipes')}
          >
            <User size={18} className="inline-block mr-1" /> Culinary & Recipes
          </button>
        </div>
      </div>

      {/* News Content */}
      <div className="news-content">
        {loading ? (
          <div className="news-loading">
            <div className="spinner"></div>
            <p>Fetching live food & diet topics...</p>
          </div>
        ) : error && articles.length === 0 ? (
          <div className="news-error">
            <p>{error}</p>
            <button className="filter-btn active mt-4" onClick={() => fetchNews()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="news-grid">
            {articles.map((article, index) => (
              <article 
                key={article.id || index} 
                className="news-card clickable-card"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="news-card-image">
                  <img 
                    src={article.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'} 
                    alt={article.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
                    }}
                  />
                  <div className="news-card-overlay">
                    <span className="news-source">{article.source?.name || 'Fresh Bites Health'}</span>
                  </div>
                  <div className="news-card-ai-badge">
                    <Sparkles size={12} className="inline-block mr-1" /> Full AI Guide
                  </div>
                </div>
                <div className="news-card-content">
                  <div className="news-meta">
                    <span className="news-date">{formatDate(article.publishedAt)}</span>
                    <span className="news-badge-category">{article.category || category}</span>
                  </div>
                  <h2 className="news-card-title">{article.title}</h2>
                  <p className="news-card-description">{article.description}</p>
                  
                  <button 
                    type="button"
                    className="news-read-more-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedArticle(article)
                    }}
                  >
                    Read Full In-Depth Guide
                    <ArrowRight size={16} className="inline-block ml-1" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Back to Home */}
      <div className="news-footer">
        <button 
          className="back-home-btn"
          onClick={() => { window.location.href = '/' }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default News

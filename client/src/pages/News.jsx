import { useState, useEffect, useCallback } from 'react'
import './News.css'

function News() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('food')

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Using gnews.io free API (no API key required for basic usage)
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=${category}&lang=en&max=10&apikey=demo`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }
      
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (err) {
      setError(err.message)
      // Fallback to mock data if API fails
      setArticles([
        {
          title: '10 Superfoods You Should Include in Your Diet',
          description: 'Discover the health benefits of incorporating these nutrient-rich superfoods into your daily meals.',
          url: '#',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
          publishedAt: new Date().toISOString(),
          source: { name: 'Health & Nutrition Today' }
        },
        {
          title: 'The Mediterranean Diet: A Guide to Healthy Eating',
          description: 'Learn how the Mediterranean diet can improve your health and well-being with delicious, balanced meals.',
          url: '#',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
          publishedAt: new Date().toISOString(),
          source: { name: 'Nutrition Weekly' }
        },
        {
          title: 'Plant-Based Protein Sources for Vegetarians',
          description: 'Explore the best plant-based protein options to meet your nutritional needs on a vegetarian diet.',
          url: '#',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
          publishedAt: new Date().toISOString(),
          source: { name: 'Vegan Life Magazine' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="news-page">
      {/* Header */}
      <div className="news-header">
        <div className="news-header-content">
          <h1 className="news-title">Food & Diet News</h1>
          <p className="news-subtitle">Stay updated with the latest trends in food, nutrition, and healthy eating</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="news-filters">
        <div className="filter-container">
          <button 
            className={`filter-btn ${category === 'food' ? 'active' : ''}`}
            onClick={() => setCategory('food')}
          >
            🍽️ Food
          </button>
          <button 
            className={`filter-btn ${category === 'diet' ? 'active' : ''}`}
            onClick={() => setCategory('diet')}
          >
            🥗 Diet
          </button>
          <button 
            className={`filter-btn ${category === 'nutrition' ? 'active' : ''}`}
            onClick={() => setCategory('nutrition')}
          >
            💊 Nutrition
          </button>
          <button 
            className={`filter-btn ${category === 'healthy eating' ? 'active' : ''}`}
            onClick={() => setCategory('healthy eating')}
          >
            🥑 Healthy Eating
          </button>
          <button 
            className={`filter-btn ${category === 'recipes' ? 'active' : ''}`}
            onClick={() => setCategory('recipes')}
          >
            👨‍🍳 Recipes
          </button>
        </div>
      </div>

      {/* News Content */}
      <div className="news-content">
        {loading ? (
          <div className="news-loading">
            <div className="spinner"></div>
            <p>Loading latest news...</p>
          </div>
        ) : error && articles.length === 0 ? (
          <div className="news-error">
            <p>Unable to load news. Please try again later.</p>
          </div>
        ) : (
          <div className="news-grid">
            {articles.map((article, index) => (
              <article key={index} className="news-card">
                <div className="news-card-image">
                  <img 
                    src={article.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'} 
                    alt={article.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'
                    }}
                  />
                  <div className="news-card-overlay">
                    <span className="news-source">{article.source?.name || 'News Source'}</span>
                  </div>
                </div>
                <div className="news-card-content">
                  <div className="news-meta">
                    <span className="news-date">{formatDate(article.publishedAt)}</span>
                  </div>
                  <h2 className="news-card-title">{article.title}</h2>
                  <p className="news-card-description">{article.description}</p>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="news-read-more"
                  >
                    Read Full Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
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
          onClick={() => window.location.href = '/'}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default News

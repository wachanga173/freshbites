import { useState, useEffect, useCallback } from 'react'
import './News.css'

function News() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [category, setCategory] = useState('food')

  const getMockArticles = (cat) => {
    const mockData = {
      'food': [
        {
          title: 'The Rise of Sustainable Food Practices in Restaurants',
          description: 'How modern restaurants are adopting eco-friendly practices and sourcing locally to reduce their carbon footprint.',
          url: 'https://www.theguardian.com/food',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Food Industry News' }
        },
        {
          title: 'Global Food Trends for 2026: What to Expect',
          description: 'From fermented foods to alternative proteins, explore the culinary trends shaping the future of dining.',
          url: 'https://www.bbc.com/food',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'Culinary Times' }
        },
        {
          title: 'Street Food Revolution: How Food Trucks Are Changing Cities',
          description: 'The mobile food industry is booming, bringing diverse flavors to urban streets worldwide.',
          url: 'https://www.seriouseats.com/',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'Street Eats Weekly' }
        }
      ],
      'diet': [
        {
          title: 'Intermittent Fasting: Benefits and Common Mistakes',
          description: 'Understanding the science behind intermittent fasting and how to implement it safely for optimal health.',
          url: 'https://www.healthline.com/nutrition',
          image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Diet & Wellness Today' }
        },
        {
          title: 'The Flexitarian Diet: Best of Both Worlds',
          description: 'How a flexible approach to vegetarianism is helping people transition to healthier eating habits.',
          url: 'https://www.healthline.com/nutrition',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'Healthy Living Magazine' }
        },
        {
          title: 'Debunking Common Diet Myths in 2026',
          description: 'Separating fact from fiction in the world of diets and weight loss strategies.',
          url: 'https://www.webmd.com/diet',
          image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'Science of Nutrition' }
        }
      ],
      'nutrition': [
        {
          title: 'Understanding Micronutrients: The Essential Vitamins Guide',
          description: 'A comprehensive look at essential vitamins and minerals your body needs for optimal function.',
          url: 'https://www.nutritionsource.hsph.harvard.edu/',
          image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Nutrition Science Journal' }
        },
        {
          title: 'Gut Health: The Key to Overall Wellness',
          description: 'New research reveals how the gut microbiome affects everything from immunity to mental health.',
          url: 'https://www.ncbi.nlm.nih.gov/',
          image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'Medical Nutrition Review' }
        },
        {
          title: 'Protein Requirements: How Much Do You Really Need?',
          description: 'Breaking down protein needs by age, activity level, and health goals for optimal nutrition.',
          url: 'https://www.eatright.org/',
          image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'Dietitian Today' }
        }
      ],
      'healthy eating': [
        {
          title: 'Meal Prep Mastery: Save Time While Eating Healthy',
          description: 'Expert tips for planning and preparing nutritious meals for the entire week ahead.',
          url: 'https://www.eatingwell.com/',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Healthy Eating Guide' }
        },
        {
          title: 'Rainbow Diet: Eating Colorful for Better Health',
          description: 'Why eating a variety of colorful fruits and vegetables is the key to getting essential nutrients.',
          url: 'https://www.health.com/',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'Wellness Weekly' }
        },
        {
          title: 'Smart Snacking: Healthy Options for Busy Lifestyles',
          description: 'Nutritious snack ideas that keep you energized throughout your day without compromising health.',
          url: 'https://www.cookinglight.com/',
          image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'Smart Nutrition Tips' }
        }
      ],
      'recipes': [
        {
          title: '15-Minute Healthy Dinner Recipes for Busy Weeknights',
          description: 'Quick and nutritious dinner ideas that take less than 15 minutes to prepare from start to finish.',
          url: 'https://www.allrecipes.com/',
          image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800',
          publishedAt: new Date(Date.now() - 86400000).toISOString(),
          source: { name: 'Quick Kitchen' }
        },
        {
          title: 'Plant-Based Comfort Food: Vegan Versions of Classics',
          description: 'Delicious vegan takes on traditional comfort foods that everyone will love.',
          url: 'https://minimalistbaker.com/',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
          publishedAt: new Date(Date.now() - 172800000).toISOString(),
          source: { name: 'Plant-Based Kitchen' }
        },
        {
          title: 'Mediterranean Bowl Recipes: Fresh & Flavorful',
          description: 'Colorful and nutritious Mediterranean-inspired bowl recipes packed with flavor and nutrients.',
          url: 'https://www.loveandlemons.com/',
          image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
          publishedAt: new Date(Date.now() - 259200000).toISOString(),
          source: { name: 'Recipe Collection' }
        }
      ]
    }
    
    return mockData[cat] || mockData['food']
  }

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // GNews API - Free tier: 100 requests/day
      // Register at https://gnews.io/ to get your free API key
      const API_KEY = import.meta.env.VITE_GNEWS_API_KEY || '4fd5ac21e9d5dd3166cd51dcb9a5efdb'
      
      // Map categories to relevant search queries
      const searchQueries = {
        'food': 'food OR restaurant OR culinary OR cuisine',
        'diet': 'diet OR weight loss OR dieting OR healthy diet',
        'nutrition': 'nutrition OR vitamins OR minerals OR nutrients',
        'healthy eating': 'healthy eating OR organic food OR wellness food',
        'recipes': 'recipes OR cooking OR meal prep OR chef'
      }
      
      const query = searchQueries[category] || searchQueries['food']
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${API_KEY}`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.articles && data.articles.length > 0) {
        // Filter articles to ensure they're food/health related
        const filteredArticles = data.articles.filter(article => {
          const text = `${article.title} ${article.description}`.toLowerCase()
          const foodKeywords = ['food', 'diet', 'nutrition', 'eating', 'meal', 'recipe', 'cook', 'health', 'restaurant', 'cuisine', 'culinary', 'ingredient', 'vitamin', 'protein', 'vegetable', 'fruit', 'organic', 'chef', 'dining']
          return foodKeywords.some(keyword => text.includes(keyword))
        })
        
        setArticles(filteredArticles.length > 0 ? filteredArticles : data.articles)
      } else {
        // Fallback to mock data if API fails or returns no results
        setArticles(getMockArticles(category))
      }
    } catch (err) {
      // Fallback to mock data on error
      setArticles(getMockArticles(category))
      setError('Using cached articles')
    }
    
    setLoading(false)
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

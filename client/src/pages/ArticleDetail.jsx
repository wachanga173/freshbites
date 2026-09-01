import { ArrowLeft, Clock, Calendar, Sparkles, BookOpen, Utensils, ShieldAlert, Share2, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getApiUrl } from '../config/api'
import './ArticleDetail.css'

export default function ArticleDetail({ article: initialArticle, onBack }) {
  const [article, setArticle] = useState(initialArticle)
  const [loading, setLoading] = useState(!initialArticle?.content)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // If article already has full AI content, don't refetch
    if (article?.content) {
      setLoading(false)
      return
    }

    const generateFullArticle = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(getApiUrl('/api/news/generate-article'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: initialArticle.id,
            title: initialArticle.title,
            description: initialArticle.description,
            category: initialArticle.category,
            image: initialArticle.image,
            source: initialArticle.source,
            publishedAt: initialArticle.publishedAt
          })
        })

        const data = await response.json()
        if (data.success && data.article) {
          setArticle(data.article)
        } else {
          setError(data.error || 'Failed to generate full article.')
        }
      } catch (err) {
        console.error('Error fetching generated article:', err)
        setError('Connection error while generating article.')
      } finally {
        setLoading(false)
      }
    }

    if (initialArticle?.title) {
      generateFullArticle()
    }
  }, [initialArticle, article?.content])

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Helper to parse sections from formatted plain text
  const renderFormattedContent = (content) => {
    if (!content) return null

    const paragraphs = content.split(/\n\n+/)

    return paragraphs.map((para, idx) => {
      const trimmed = para.trim()
      if (!trimmed) return null

      // Section header detection (all uppercase or numbered section)
      const isHeader = /^([A-Z0-9\s,&/:'-]{4,60})$/.test(trimmed) && !trimmed.startsWith('•') && !trimmed.startsWith('-')

      if (isHeader) {
        return (
          <h2 key={idx} className="article-section-title">
            <Sparkles size={20} className="section-icon inline-block mr-2" />
            {trimmed}
          </h2>
        )
      }

      // Bullet lists
      if (trimmed.includes('\n•') || trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const lines = trimmed.split('\n').filter(l => l.trim().length > 0)
        return (
          <ul key={idx} className="article-bullet-list">
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^[-•]\s*/, '').trim()
              return (
                <li key={lineIdx} className="article-bullet-item">
                  <span className="bullet-bullet">•</span>
                  <span>{cleanLine}</span>
                </li>
              )
            })}
          </ul>
        )
      }

      return (
        <p key={idx} className="article-paragraph">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="article-detail-page">
      {/* Top Navigation Bar */}
      <div className="article-nav-bar">
        <div className="article-nav-container">
          <button className="nav-back-btn" onClick={onBack}>
            <ArrowLeft size={18} className="inline-block mr-1" /> Back to News & Diet
          </button>
          <div className="nav-actions">
            <button className="nav-action-btn" onClick={handleShare} title="Share Article">
              {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="article-main-container">
        {/* Category & AI Badge */}
        <div className="article-badges">
          <span className="badge-category">{article.category?.toUpperCase() || 'DIET & NUTRITION'}</span>
          <span className="badge-ai">
            <Sparkles size={14} className="inline-block mr-1" /> Fresh Bites AI In-Depth Guide
          </span>
        </div>

        {/* Title */}
        <h1 className="article-headline">{article.title}</h1>

        {/* Metadata */}
        <div className="article-meta-row">
          <div className="meta-left">
            <span className="meta-source">{article.source?.name || 'Fresh Bites Café Health Journal'}</span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <Calendar size={14} className="inline-block mr-1" /> {formatDate(article.publishedAt)}
            </span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <Clock size={14} className="inline-block mr-1" /> {article.readTime || '3 min read'}
            </span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="article-hero-wrap">
          <img
            src={article.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200'}
            alt={article.title}
            className="article-hero-img"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200'
            }}
          />
        </div>

        {/* Article Summary Box */}
        {article.description && (
          <div className="article-summary-callout">
            <div className="callout-header">
              <BookOpen size={18} className="inline-block mr-2 text-accent" />
              <span>Article Overview</span>
            </div>
            <p>{article.description}</p>
          </div>
        )}

        {/* Body Content */}
        <div className="article-body">
          {loading ? (
            <div className="ai-generating-container">
              <div className="ai-generating-spinner"></div>
              <h3 className="generating-title">Analyzing topic & menu pairings...</h3>
              <p className="generating-subtitle">Our AI nutritionist is crafting a personalized, comprehensive article with dietary tips and matching café dishes.</p>
              
              <div className="skeleton-group">
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line short"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-box"></div>
              </div>
            </div>
          ) : error ? (
            <div className="article-error-box">
              <p>{error}</p>
              <button className="btn-retry" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="article-rendered-text">
              {renderFormattedContent(article.content)}
            </div>
          )}
        </div>

        {/* Live Menu CTA Card */}
        {!loading && (
          <div className="menu-cta-card">
            <div className="cta-icon-wrap">
              <Utensils size={32} />
            </div>
            <div className="cta-content">
              <h3>Hungry for Healthier Choices?</h3>
              <p>Explore our Fresh Bites Café menu for freshly made salads, protein bowls, balanced meals, and natural juices.</p>
              <a href="/menu" className="btn-explore-menu">
                View Full Café Menu →
              </a>
            </div>
          </div>
        )}

        {/* Medical & Dietary Disclaimer */}
        <div className="article-disclaimer-box">
          <ShieldAlert size={20} className="disclaimer-icon" />
          <p>
            <strong>Disclaimer:</strong> {article.disclaimer || 'The dietary information in this article is for educational purposes only. Always consult a healthcare professional, registered dietitian, or certified physician for individual medical, dietary, or allergy advice.'}
          </p>
        </div>

        {/* Bottom Back Button */}
        <div className="article-bottom-actions">
          <button className="bottom-back-btn" onClick={onBack}>
            <ArrowLeft size={18} className="inline-block mr-1" /> Back to Food & Diet News
          </button>
        </div>
      </main>
    </div>
  )
}

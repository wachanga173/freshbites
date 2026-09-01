import { ArrowLeft, Clock, Calendar, Sparkles, Utensils, ShieldAlert, Share2, Check, ExternalLink, Globe, RotateCw } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getApiUrl } from '../config/api'
import './ArticleDetail.css'

export default function ArticleDetail({ article: initialArticle, onBack }) {
  const [article, setArticle] = useState(initialArticle)
  const [loading, setLoading] = useState(!initialArticle?.content)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const generateFullArticle = useCallback(async () => {
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
          publishedAt: initialArticle.publishedAt,
          url: initialArticle.url
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
  }, [initialArticle])

  useEffect(() => {
    if (!article?.content && initialArticle?.title) {
      generateFullArticle()
    }
  }, [article?.content, generateFullArticle, initialArticle?.title])

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

  const sourceUrl = article.url || initialArticle.url
  const hasValidImage = (article.image || initialArticle.image) && !imageFailed

  return (
    <div className="article-detail-page">
      {/* Top Navigation Bar */}
      <div className="article-nav-bar">
        <div className="article-nav-container">
          <button className="nav-back-btn" onClick={onBack}>
            <ArrowLeft size={18} className="inline-block mr-1" /> Back to News & Diet
          </button>
          <div className="nav-actions">
            {sourceUrl && (
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-action-btn source-btn"
                title="View original article on publisher's website"
              >
                <ExternalLink size={15} />
                <span>Original Source</span>
              </a>
            )}
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
            <Sparkles size={14} className="inline-block mr-1" /> Fresh Bites In-Depth Nutrition Guide
          </span>
        </div>

        {/* Title */}
        <h1 className="article-headline">{article.title}</h1>

        {/* Metadata */}
        <div className="article-meta-row">
          <div className="meta-left">
            <span className="meta-source">{article.source?.name || 'Fresh Bites Health Journal'}</span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <Calendar size={14} className="inline-block mr-1" /> {formatDate(article.publishedAt)}
            </span>
            <span className="meta-dot">•</span>
            <span className="meta-item">
              <Clock size={14} className="inline-block mr-1" /> {article.readTime || '4 min read'}
            </span>
          </div>

          {sourceUrl && (
            <div className="meta-right">
              <a 
                href={sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="meta-source-link"
              >
                <Globe size={14} className="inline-block mr-1" /> Read on {article.source?.name || 'Publisher'} ↗
              </a>
            </div>
          )}
        </div>

        {/* Hero Image - only if provided by source article */}
        {hasValidImage && (
          <div className="article-hero-wrap">
            <img
              src={article.image || initialArticle.image}
              alt={article.title}
              className="article-hero-img"
              onError={() => setImageFailed(true)}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="article-body">
          {loading ? (
            <div className="ai-generating-container">
              <div className="ai-generating-spinner"></div>
              <h3 className="generating-title">Analyzing topic & menu pairings...</h3>
              <p className="generating-subtitle">Our AI nutritionist is conducting an in-depth scientific analysis with practical daily protocols and matching café dishes.</p>
              
              <div className="skeleton-group">
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-line short"></div>
                <div className="skeleton skeleton-line"></div>
                <div className="skeleton skeleton-box"></div>
              </div>
            </div>
          ) : error ? (
            <div className="article-fallback-source-box">
              <div className="fallback-header">
                <Globe size={24} className="text-accent" />
                <div>
                  <h3>Viewing Source Summary</h3>
                  <p>AI deep dive is currently unavailable. You can read the original report directly from the source.</p>
                </div>
              </div>

              {article.description && (
                <div className="fallback-description">
                  <p>{article.description}</p>
                </div>
              )}

              <div className="fallback-actions">
                {sourceUrl ? (
                  <a 
                    href={sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-open-source-primary"
                  >
                    Read Full Story on {article.source?.name || 'Publisher Website'} <ExternalLink size={16} className="inline-block ml-1" />
                  </a>
                ) : null}
                <button 
                  type="button"
                  className="btn-retry-generation" 
                  onClick={generateFullArticle}
                  disabled={loading}
                >
                  <RotateCw size={15} className={`inline-block mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Retry AI Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="article-rendered-text">
              {renderFormattedContent(article.content)}
            </div>
          )}
        </div>

        {/* Source Reference Card */}
        {sourceUrl && (
          <div className="source-reference-card">
            <div className="source-card-left">
              <Globe size={24} className="text-accent mr-3 flex-shrink-0" />
              <div>
                <h4>Want to read the original source?</h4>
                <p>Explore the full report directly from <strong>{article.source?.name || 'the original news publisher'}</strong>.</p>
              </div>
            </div>
            <a 
              href={sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-visit-source"
            >
              Open Original Article <ExternalLink size={16} className="inline-block ml-1" />
            </a>
          </div>
        )}

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

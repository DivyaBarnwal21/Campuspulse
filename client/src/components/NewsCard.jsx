import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Newspaper, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const NewsCard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMock, setIsMock] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/dashboard/news');
      if (response.data.success) {
        setNews(response.data.data);
        setIsMock(!!response.data.isMock);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch tech news.');
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="dash-card card-news">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon-container">
            <Newspaper size={20} />
          </div>
          <span>Tech Headlines</span>
        </div>
        <button
          className="btn-card-action"
          onClick={fetchNews}
          disabled={loading}
          title="Refresh news"
          style={{ width: '32px', height: '32px', borderRadius: '8px' }}
        >
          <RefreshCw size={14} className={loading ? 'loading-spinner' : ''} style={loading ? { animation: 'spin 1s linear infinite', borderWidth: '0px', borderTopColor: 'transparent' } : {}} />
        </button>
      </div>

      {loading && (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Fetching latest publications...</div>
        </div>
      )}

      {!loading && error && (
        <div className="card-error">
          <AlertCircle size={32} />
          <p className="card-error-msg">{error}</p>
          <button className="btn-retry" onClick={fetchNews}>
            Retry Fetch
          </button>
        </div>
      )}

      {!loading && !error && news.length === 0 && (
        <div className="weather-placeholder">
          <Newspaper size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No headlines currently available</p>
        </div>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="card-scroll-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span>Top tech insights:</span>
            {isMock && (
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '10px', color: '#c7d2fe' }}>
                Simulated feed
              </span>
            )}
          </div>
          {news.map((item, idx) => (
            <div className="news-item" key={item.title + idx}>
              <div className="news-source">{item.source}</div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-title-link"
              >
                <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <ExternalLink size={12} style={{ opacity: 0.6, flexShrink: 0, marginTop: '3px' }} />
                </span>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCard;

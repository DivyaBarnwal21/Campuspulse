import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Github, Search, Star, ExternalLink, AlertCircle, Folder } from 'lucide-react';

const GitHubCard = () => {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('last_github_username') || 'torvalds';
  });
  const [inputVal, setInputVal] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRepos = async (userToFetch) => {
    if (!userToFetch.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/dashboard/github?username=${userToFetch}`);
      if (response.data.success) {
        setRepos(response.data.data);
        localStorage.setItem('last_github_username', userToFetch);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch repositories.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial profile on mount
  useEffect(() => {
    fetchRepos(username);
    setInputVal(username);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setUsername(inputVal.trim());
      fetchRepos(inputVal.trim());
    }
  };

  return (
    <div className="dash-card card-github">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon-container">
            <Github size={20} />
          </div>
          <span>GitHub Activity</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card-input-wrapper">
        <input
          type="text"
          className="card-input"
          placeholder="GitHub Username (e.g. torvalds)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn-card-action" disabled={loading} title="Search profile">
          <Search size={18} />
        </button>
      </form>

      {loading && (
        <div className="spinner-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Crawling repositories...</div>
        </div>
      )}

      {!loading && error && (
        <div className="card-error">
          <AlertCircle size={32} />
          <p className="card-error-msg">{error}</p>
          <button className="btn-retry" onClick={() => fetchRepos(username)}>
            Retry Search
          </button>
        </div>
      )}

      {!loading && !error && repos.length === 0 && (
        <div className="weather-placeholder">
          <Github size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>No repositories found for @{username}</p>
        </div>
      )}

      {!loading && !error && repos.length > 0 && (
        <div className="card-scroll-area">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Viewing repositories for <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(var(--color-warning-rgb), 0.2)', border: '1px solid rgba(var(--color-warning-rgb), 0.3)', borderRadius: '10px', color: 'var(--color-warning)', verticalAlign: 'middle' }}>@{username}</span>:
          </div>
          {repos.map((repo, idx) => (
            <div className="repo-item" key={repo.name + idx}>
              <div className="repo-name-link">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-name-link"
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Folder size={14} style={{ display: 'inline', marginRight: '0.25rem', color: 'var(--color-primary)' }} />
                    {repo.name}
                    <ExternalLink size={12} style={{ opacity: 0.6 }} />
                  </span>
                </a>
                <span className="repo-stars">
                  <Star size={12} style={{ color: 'var(--color-warning)' }} />
                  {repo.stars}
                </span>
              </div>
              <p className="repo-desc">{repo.description}</p>
              <div className="repo-footer">
                <span className="repo-lang-badge">{repo.language}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubCard;

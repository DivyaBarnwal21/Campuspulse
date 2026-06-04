import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import GitHubCard from '../components/GitHubCard';
import WeatherCard from '../components/WeatherCard';
import NewsCard from '../components/NewsCard';
import SkillGapAnalyzer from '../components/SkillGapAnalyzer';
import { Activity, LogOut, User, Cpu, Award, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [appCount, setAppCount] = useState(0);
  const [lastResumeScore, setLastResumeScore] = useState(null);

  // Fetch placement and resume stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/tracker');
        if (response.data.success) {
          setAppCount(response.data.data.length);
        }
      } catch (err) {
        console.error('Failed to load application count:', err);
      }

      const score = localStorage.getItem('last_resume_score');
      if (score) {
        setLastResumeScore(score);
      }
    };

    fetchStats();
  }, []);

  // Get dynamic greeting based on local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Top Glassmorphic Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Activity className="logo-icon" style={{ strokeWidth: 2.5, color: '#38bdf8' }} />
          <span>PlaceMate</span>
        </div>

        <div className="navbar-links">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/resume-checker" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Resume Checker
          </NavLink>
          <NavLink to="/tracker" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Placement Tracker
          </NavLink>
        </div>
        
        <div className="navbar-user">
          <div className="user-tag" title={user?.email}>
            <User size={14} style={{ color: '#38bdf8' }} />
            <span>{user?.name || 'Developer'}</span>
          </div>
          
          <button className="btn-logout" onClick={logout} title="Sign out of CampusPulse">
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard */}
      <main className="dashboard-main">
        {/* Banner with Greeting & Stats */}
        <section className="dashboard-header-section">
          <h1 className="dashboard-title">
            {getGreeting()}, {user?.name || 'Developer'}!
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} style={{ color: '#a78bfa' }} />
              <p className="dashboard-subtitle">
                System feeds synchronized.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span className="user-tag" style={{ background: 'rgba(56, 189, 248, 0.08)', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                <Briefcase size={12} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.85rem' }}>Tracked Applications: <strong>{appCount}</strong></span>
              </span>
              
              <span className="user-tag" style={{ background: 'rgba(16, 185, 129, 0.08)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <Award size={12} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '0.85rem' }}>
                  Last Resume Score:{' '}
                  <strong>{lastResumeScore ? `${lastResumeScore}/100` : 'Not analyzed'}</strong>
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* 3-Column Premium Card Layout */}
        <section className="dashboard-grid">
          <GitHubCard />
          <WeatherCard />
          <NewsCard />
        </section>

        {/* AI Skill Gap Analyzer Section */}
        <section style={{ marginTop: '2.5rem' }}>
          <SkillGapAnalyzer />
        </section>
      </main>
    </>
  );
};

export default Dashboard;

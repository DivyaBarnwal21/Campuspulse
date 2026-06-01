import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Building,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Award,
  ListPlus,
  Compass,
  Activity,
  LogOut,
  User,
} from 'lucide-react';

const ResumeChecker = () => {
  const { user, logout } = useAuth();
  const [company, setCompany] = useState('');
  const [fileName, setFileName] = useState('');
  const [pdfBase64, setPdfBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  // File Selector Handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    setError('');
    setResults(null);

    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Invalid file type. Only standard PDF documents (.pdf) are supported.');
      setFileName('');
      setPdfBase64('');
      return;
    }

    // Read file as Data URL (Base64)
    const reader = new FileReader();
    reader.onload = () => {
      setPdfBase64(reader.result);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setError('FileReader encountered an error while parsing this document.');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!pdfBase64) {
      setError('Please upload your resume document first.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await api.post('/resume/analyze', {
        pdf: pdfBase64,
        company: company.trim(),
      });

      if (response.data.success) {
        setResults(response.data.data);
        localStorage.setItem('last_resume_score', response.data.data.atsScore);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Resume parsing service failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Top Glassmorphic Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Activity className="logo-icon" style={{ strokeWidth: 2.5, color: '#38bdf8' }} />
          <span>CampusPulse</span>
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

      <main className="dashboard-main" style={{ maxWidth: '1200px' }}>
        {/* Title Header */}
        <section className="dashboard-header-section">
          <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award className="logo-icon" style={{ strokeWidth: 2, color: '#38bdf8' }} />
            AI Resume Checker & ATS Audit
          </h1>
          <p className="dashboard-subtitle">
            Submit your resume PDF to receive an instant ATS compatibility score and targeted keywords advice.
          </p>
        </section>

        {/* Main Grid: Left Upload, Right diagnostics */}
        <section className="upload-container">
          {/* Upload form Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="dash-card" style={{ height: 'auto', gap: '1rem' }}>
              <div className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <UploadCloud size={16} style={{ color: '#38bdf8' }} />
                Upload Document
              </div>

              <div
                className={`upload-area ${dragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                <UploadCloud size={36} style={{ color: '#38bdf8', opacity: 0.8 }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {fileName ? 'Click to swap file' : 'Drag & Drop PDF or Click to Browse'}
                </div>
                <div className="file-specs">Supports standard single PDF up to 8MB</div>
                
                {fileName && (
                  <div className="selected-file-pill" title={fileName}>
                    <FileText size={14} />
                    <span>{fileName}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building size={14} style={{ color: '#38bdf8' }} />
                    Target Company (Optional)
                  </label>
                  <input
                    type="text"
                    className="card-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Google, Microsoft, Infosys"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="alert-error" style={{ marginBottom: 0 }}>
                    <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: '0.5rem' }}
                  disabled={loading || !pdfBase64}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                      <span>Processing Resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Analyze My Resume</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {loading && (
              <div className="dash-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner-container">
                  <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
                  <div className="loading-text" style={{ fontSize: '1rem', fontWeight: 600 }}>Analyzing with CampusPulse LLM Engine...</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Extracting structural blocks, calculating ATS scoring coefficients, and compiling recommendations...</div>
                </div>
              </div>
            )}

            {!loading && !results && (
              <div className="dash-card" style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
                <FileText size={64} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Waiting for Upload
                </h3>
                <p style={{ maxWidth: '400px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Select your resume in the panel to trigger diagnostic metrics, missing keyword scans, and career coaching reviews.
                </p>
              </div>
            )}

            {!loading && results && (
              <div className="dash-card" style={{ height: 'auto', gap: '1.5rem', animation: 'fadeIn 0.6s ease-out' }}>
                {/* Score section */}
                <div className="ats-score-section">
                  <div className="ats-score-gauge" style={{ '--score-angle': `${(results.atsScore / 100) * 360}deg` }}>
                    <span className="ats-score-value">{results.atsScore}</span>
                  </div>
                  <div>
                    <h3 className="ats-score-title">ATS Match Coefficient</h3>
                    <p className="ats-score-desc">
                      {results.atsScore >= 80
                        ? 'Excellent compatibility score! Your resume has structural clarity and relevant keywords.'
                        : results.atsScore >= 65
                        ? 'Moderate compatibility. Add missing keywords and rewrite metrics descriptors to increase matches.'
                        : 'Low compatibility score. Critical layout restructuring and substantial wording improvements recommended.'}
                    </p>
                  </div>
                </div>

                {/* Company Specific Tips (If company provided) */}
                {results.companytips && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="checklist-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c7d2fe' }}>
                      <Compass size={16} style={{ color: '#a78bfa' }} />
                      Targeting Tips: {company || 'Target Profile'}
                    </div>
                    <div className="tip-box">{results.companytips}</div>
                  </div>
                )}

                {/* Strong vs Weak keywords list */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div className="checklist-container">
                    <div className="checklist-title" style={{ color: '#34d399' }}>Strong Elements</div>
                    {results.strongPoints && results.strongPoints.map((point, idx) => (
                      <div className="checklist-item" key={idx}>
                        <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '3px' }} />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="checklist-container">
                    <div className="checklist-title" style={{ color: '#fca5a5' }}>Missing Keywords / Gaps</div>
                    {results.missingKeywords && results.missingKeywords.map((gap, idx) => (
                      <div className="checklist-item warning" key={idx}>
                        <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '3px' }} />
                        <span>{gap}</span>
                      </div>
                    ))}
                    {(!results.missingKeywords || results.missingKeywords.length === 0) && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None found. Perfect match!</span>
                    )}
                  </div>
                </div>

                {/* Suggestions */}
                <div className="checklist-container" style={{ marginTop: '0.5rem' }}>
                  <div className="checklist-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ListPlus size={16} style={{ color: '#38bdf8' }} />
                    Actionable Improvement Suggestions
                  </div>
                  {results.improvements && results.improvements.map((imp, idx) => (
                    <div className="checklist-item danger" key={idx}>
                      <ArrowRight size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '3px' }} />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default ResumeChecker;

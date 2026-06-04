import React, { useState } from 'react';
import api from '../services/api';
import { Cpu, Search, Sparkles, CheckCircle2, AlertCircle, Clock, BookOpen } from 'lucide-react';

const SkillGapAnalyzer = () => {
  const [skills, setSkills] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const cleanText = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1')
               .replace(/\*(.*?)\*/g, '$1')
               .replace(/^\d+\.\s/, '');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!skills.trim() || !target.trim()) {
      setError('Please provide both your skills and target role.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await api.post('/skills/analyze', { skills, target });
      if (response.data.success) {
        setAnalysis(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Skill gap evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skills-analyzer-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="card-icon-container" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
            <Cpu size={20} />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800 }}>AI Career Skill Gap Analyzer</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(139, 92, 246, 0.15)', padding: '0.3rem 0.6rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <Sparkles size={12} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', uppercase: 'true' }}>AI Powered</span>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="skills-form-grid">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Your Current Skills</label>
          <input
            type="text"
            className="card-input"
            style={{ width: '100%', padding: '0.8rem 1rem' }}
            placeholder="e.g. React, Python, MongoDB, JavaScript"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Dream Company & Role</label>
          <input
            type="text"
            className="card-input"
            style={{ width: '100%', padding: '0.8rem 1rem' }}
            placeholder="e.g. Google SDE, Amazon Backend, Data Analyst"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{ height: '46px', padding: '0 1.5rem', marginTop: 0, width: 'auto', flexShrink: 0 }}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Analyze Career Gap</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="alert-error" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '1rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: '#fbbf24' }} />
              Estimated Timeline to Readiness: <span style={{ color: '#fbbf24' }}>{analysis.timeEstimate}</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div className="checklist-title" style={{ color: '#34d399' }}>Skills You Have</div>
              <div className="skill-badges-container">
                {analysis.hasSkills && analysis.hasSkills.map((skill, idx) => (
                  <span className="skill-badge has" key={skill + idx}>
                    <CheckCircle2 size={12} />
                    {skill}
                  </span>
                ))}
                {(!analysis.hasSkills || analysis.hasSkills.length === 0) && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None matched. Update your skill input.</span>
                )}
              </div>
            </div>

            <div>
              <div className="checklist-title" style={{ color: '#fca5a5' }}>Skills to Learn</div>
              <div className="skill-badges-container">
                {analysis.missingSkills && analysis.missingSkills.map((skill, idx) => (
                  <span className="skill-badge missing" key={skill + idx}>
                    <AlertCircle size={12} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <div className="checklist-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} style={{ color: '#38bdf8' }} />
              Personalized Learning Roadmap
            </div>
            <ol className="roadmap-list" style={{ marginTop: '0.75rem' }}>
              {analysis.roadmap && analysis.roadmap.map((step, idx) => (
                <li className="roadmap-step" key={idx}>
                  <span className="roadmap-num">{idx + 1}</span>
                  <span style={{ color: 'var(--text-main)' }}>{cleanText(step)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalyzer;

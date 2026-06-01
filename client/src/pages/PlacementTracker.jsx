import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ApplicationCard from '../components/ApplicationCard';
import {
  Briefcase,
  Plus,
  X,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  FolderPlus,
  ChevronRight,
  TrendingUp,
  Activity,
  LogOut,
  User,
} from 'lucide-react';

const PlacementTracker = () => {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tracker');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch placement applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Stats calculation
  const stats = {
    total: applications.length,
    shortlisted: applications.filter((app) => app.status === 'Shortlisted').length,
    interviews: applications.filter((app) => app.status === 'Interview Scheduled').length,
    offers: applications.filter((app) => app.status === 'Offer Received').length,
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingApp(null);
    setCompanyName('');
    setRole('');
    const today = new Date().toISOString().split('T')[0];
    setAppliedDate(today);
    setStatus('Applied');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setCompanyName(app.companyName);
    setRole(app.role);
    setAppliedDate(new Date(app.appliedDate).toISOString().split('T')[0]);
    setStatus(app.status);
    setNotes(app.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !appliedDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingApp) {
        // Edit Application
        const response = await api.put(`/tracker/${editingApp._id}`, {
          companyName,
          role,
          appliedDate,
          status,
          notes,
        });
        if (response.data.success) {
          setApplications(
            applications.map((app) =>
              app._id === editingApp._id ? response.data.data : app
            )
          );
          setIsModalOpen(false);
        }
      } else {
        // Add Application
        const response = await api.post('/tracker', {
          companyName,
          role,
          appliedDate,
          status,
          notes,
        });
        if (response.data.success) {
          setApplications([response.data.data, ...applications]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete Application
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    try {
      const response = await api.delete(`/tracker/${id}`);
      if (response.data.success) {
        setApplications(applications.filter((app) => app._id !== id));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete application.');
    }
  };

  // Kanban Columns
  const columns = [
    { title: 'Applied', status: 'Applied' },
    { title: 'Shortlisted', status: 'Shortlisted' },
    { title: 'Interview Scheduled', status: 'Interview Scheduled' },
    { title: 'Rejected', status: 'Rejected' },
    { title: 'Offer Received', status: 'Offer Received' },
  ];

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

      <main className="dashboard-main">
        {/* Banner with Title and Action Button */}
        <section className="dashboard-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Briefcase className="logo-icon" style={{ strokeWidth: 2, color: '#38bdf8' }} />
              Placement Application Tracker
            </h1>
            <p className="dashboard-subtitle">
              Monitor your job interviews, active offers, and application cycles.
            </p>
          </div>
          <button className="btn-primary" style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.5rem' }} onClick={handleOpenAddModal}>
            <Plus size={18} />
            <span>Add Application</span>
          </button>
        </section>

        {/* Stats KPIs bar */}
        <section className="kanban-stats-bar">
          <div className="stat-card stat-applied">
            <div className="stat-icon-box">
              <FileSpreadsheet size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{stats.total}</span>
              <span className="stat-title">Total Applications</span>
            </div>
          </div>

          <div className="stat-card stat-shortlisted">
            <div className="stat-icon-box">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{stats.shortlisted}</span>
              <span className="stat-title">Shortlisted</span>
            </div>
          </div>

          <div className="stat-card stat-interviews">
            <div className="stat-icon-box">
              <Clock size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{stats.interviews}</span>
              <span className="stat-title">Interviews scheduled</span>
            </div>
          </div>

          <div className="stat-card stat-offers">
            <div className="stat-icon-box">
              <CheckCircle size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-num">{stats.offers}</span>
              <span className="stat-title">Offers Secured</span>
            </div>
          </div>
        </section>

        {/* Loader and Error views */}
        {loading && (
          <div className="spinner-container" style={{ minHeight: '300px' }}>
            <div className="loading-spinner"></div>
            <div className="loading-text">Synchronizing application records...</div>
          </div>
        )}

        {!loading && error && (
          <div className="card-error" style={{ minHeight: '200px' }}>
            <AlertTriangle size={32} />
            <p className="card-error-msg">{error}</p>
            <button className="btn-retry" onClick={fetchApplications}>
              Refresh Kanban Board
            </button>
          </div>
        )}

        {/* Kanban Columns Grid */}
        {!loading && !error && (
          <section className="kanban-board">
            {columns.map((col) => {
              const colApps = applications.filter((app) => app.status === col.status);
              return (
                <div className={`kanban-col status-${col.status.toLowerCase().replace(' ', '-')}`} key={col.status}>
                  <div className="kanban-col-header">
                    <span className="col-tag">
                      <span className="col-indicator"></span>
                      {col.title}
                    </span>
                    <span className="col-count">{colApps.length}</span>
                  </div>
                  
                  <div className="kanban-cards-container">
                    {colApps.map((app) => (
                      <ApplicationCard
                        key={app._id}
                        application={app}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDelete}
                      />
                    ))}
                    {colApps.length === 0 && (
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                        <span>Empty column</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Slide-in Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingApp ? 'Edit Application Details' : 'Add New Application'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="card-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Google India"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={submitLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Position / Role *</label>
                  <input
                    type="text"
                    className="card-input"
                    style={{ width: '100%' }}
                    placeholder="e.g. Software Engineer Intern"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    disabled={submitLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Applied Date *</label>
                  <input
                    type="date"
                    className="card-input"
                    style={{ width: '100%' }}
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    required
                    disabled={submitLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Current Status *</label>
                  <select
                    className="card-input"
                    style={{ width: '100%', cursor: 'pointer' }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    disabled={submitLoading}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offer Received">Offer Received</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Personal Notes</label>
                  <textarea
                    className="card-input"
                    style={{ width: '100%', height: '80px', resize: 'vertical' }}
                    placeholder="e.g. Round 1 questions on binary trees. HR call pending."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitLoading}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)} disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={submitLoading}>
                  {submitLoading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingApp ? 'Save Changes' : 'Create Record'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PlacementTracker;

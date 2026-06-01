import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeChecker from './pages/ResumeChecker';
import PlacementTracker from './pages/PlacementTracker';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resume-checker"
              element={
                <ProtectedRoute>
                  <ResumeChecker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tracker"
              element={
                <ProtectedRoute>
                  <PlacementTracker />
                </ProtectedRoute>
              }
            />
            {/* Catch-all redirect to Dashboard (which triggers guard and redirects to Login if unauthenticated) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

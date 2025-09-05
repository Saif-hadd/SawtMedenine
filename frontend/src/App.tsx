import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CitizenPage } from './components/citizen/CitizenPage';
import { LoginPage } from './components/admin/LoginPage';
import { Dashboard } from './components/admin/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans antialiased">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<CitizenPage />} />
            <Route path="/admin/login" element={<LoginPage />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirects */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
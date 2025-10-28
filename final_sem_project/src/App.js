import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Placeholder routes - to be implemented */}
            <Route 
              path="/requests" 
              element={
                <ProtectedRoute>
                  <ComingSoon title="Requests" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/donors" 
              element={
                <ProtectedRoute>
                  <ComingSoon title="Donor Directory" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'ngo', 'hospital']}>
                  <ComingSoon title="Analytics Dashboard" />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-request" 
              element={
                <ProtectedRoute allowedRoles={['receiver']}>
                  <ComingSoon title="Create Request" />
                </ProtectedRoute>
              } 
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

// Temporary Coming Soon Component
const ComingSoon = ({ title }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">This feature is coming soon!</p>
    </div>
  </div>
);

export default App;

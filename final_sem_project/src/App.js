import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './components/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CreateRequest from './components/Requests/CreateRequest';
import RequestsList from './components/Requests/RequestsList';
import DonorDirectory from './components/Donors/DonorDirectory';
import Notifications from './components/Notifications/Notifications';
import VerifyRequests from './components/Requests/VerifyRequests';
import Analytics from './components/Analytics/Analytics';
import ComingSoon from './components/ComingSoon';
import Chat from './components/Chat/Chat';
import DonationHistory from './components/Donations/DonationHistory';
import Ratings from './components/Ratings/Ratings';
import AdminPanel from './components/Admin/AdminPanel';
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
                  <RequestsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donors"
              element={
                <ProtectedRoute>
                  <DonorDirectory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-request"
              element={
                <ProtectedRoute allowedRoles={["receiver"]}>
                  <CreateRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify-requests"
              element={
                <ProtectedRoute allowedRoles={["admin", "ngo", "hospital"]}>
                  <VerifyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'ngo', 'hospital']}>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donation-history"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonationHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ratings"
              element={
                <ProtectedRoute>
                  <Ratings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPanel />
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

export default App;


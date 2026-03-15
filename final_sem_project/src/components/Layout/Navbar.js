import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import FAQSidebar from '../FAQ/FAQSidebar';
import { FaHospital, FaBell, FaQuestionCircle, FaCheckCircle, FaClock } from 'react-icons/fa';

const Navbar = () => {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  // Listen to unread notifications count
  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('status', '==', 'Unread')
    );

    const unsub = onSnapshot(q, (snap) => {
      setUnreadCount(snap.size);
    }, (err) => {
      console.error('Error listening to unread notifications:', err);
    });

    return () => unsub();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Nav Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <FaHospital className="text-2xl text-primary-600" />
              <span className="text-xl font-bold text-primary-700">MediReach</span>
            </Link>
            {currentUser && (
              <div className="hidden lg:flex items-center space-x-1">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                  Dashboard
                </Link>
                <Link to="/requests" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                  Requests
                </Link>
                {userData && (userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital') && (
                  <Link to="/verify-requests" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift whitespace-nowrap">
                    Verify Requests
                  </Link>
                )}
                <Link to="/donors" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                  Donors
                </Link>
                <Link to="/chat" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                  Chat
                </Link>
                {userData && userData.role === 'donor' && (
                  <Link to="/donation-history" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                    History
                  </Link>
                )}
                <Link to="/ratings" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                  Ratings
                </Link>
                {userData && (userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital') && (
                  <Link to="/analytics" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                    Analytics
                  </Link>
                )}
                {userData && userData.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover-lift">
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right side - User Info and Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{userData?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize leading-tight">{userData?.role || 'Member'}</p>
                  </div>
                  {userData?.verified ? (
                    <FaCheckCircle className="text-green-500 text-lg" title="Verified" />
                  ) : (
                    <FaClock className="text-yellow-500 text-lg" title="Pending Verification" />
                  )}
                </div>

                {/* FAQ Button */}
                <button
                  onClick={() => setIsFAQOpen(true)}
                  className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover-lift"
                  title="Help & FAQs"
                  aria-label="Help & FAQs"
                >
                  <FaQuestionCircle className="text-xl" />
                </button>

                {/* Notifications */}
                <Link 
                  to="/notifications" 
                  className="relative flex items-center justify-center w-10 h-10 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover-lift"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <FaBell className="text-xl" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 badge-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md hover-lift"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium hover-lift">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md hover-lift">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Sidebar */}
      <FAQSidebar isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </nav>
  );
};

export default Navbar;

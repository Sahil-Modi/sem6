import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { onForegroundMessage } from '../../firebase/messagingHelper';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [showToast, setShowToast] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'notifications'), 
      where('userId', '==', currentUser.uid), 
      orderBy('timestamp', 'desc')
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('Notifications snapshot error:', err));

    return () => unsub();
  }, [currentUser]);

  // Listen for foreground push notifications
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Foreground message received:', payload);
      
      // Show toast notification
      const notification = payload.notification || {};
      setShowToast({
        title: notification.title || 'New Notification',
        body: notification.body || payload.data?.message || 'You have a new notification'
      });

      // Auto-hide toast after 5 seconds
      setTimeout(() => setShowToast(null), 5000);

      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Could not play sound:', e));
      } catch (e) {
        console.log('Audio error:', e);
      }
    });

    return unsubscribe;
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'Read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifs = notifications.filter(n => n.status === 'Unread');
    try {
      await Promise.all(
        unreadNotifs.map(n => updateDoc(doc(db, 'notifications', n.id), { status: 'Read' }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    
    try {
      await Promise.all(
        notifications.map(n => deleteDoc(doc(db, 'notifications', n.id)))
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'verification_required': return '📋';
      case 'request_verified': return '✅';
      case 'request_rejected': return '❌';
      case 'donor_accepted': return '🎉';
      case 'request_completed': return '✓';
      case 'new_request': return '🆘';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'verification_required': return 'border-blue-300 bg-blue-50';
      case 'request_verified': return 'border-green-300 bg-green-50';
      case 'request_rejected': return 'border-red-300 bg-red-50';
      case 'donor_accepted': return 'border-purple-300 bg-purple-50';
      case 'request_completed': return 'border-green-300 bg-green-50';
      case 'new_request': return 'border-orange-300 bg-orange-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.status === 'Unread';
    if (filter === 'read') return n.status === 'Read';
    return true;
  });

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-20 right-4 z-50 animate-slide-up">
            <div className="bg-white rounded-lg shadow-2xl border-l-4 border-primary-600 p-4 max-w-sm">
              <div className="flex items-start">
                <span className="text-3xl mr-3">🔔</span>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{showToast.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{showToast.body}</p>
                </div>
                <button 
                  onClick={() => setShowToast(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">🔔</span>
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">Stay updated with all your activity</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/notification-settings"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg text-sm flex items-center"
              >
                <span className="mr-2">⚙️</span>
                Settings
              </Link>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                >
                  Mark All Read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
            {['all', 'unread', 'read'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all capitalize ${
                  filter === f 
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
                {f === 'all' && ` (${notifications.length})`}
                {f === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <div className="text-6xl mb-4">
              {filter === 'unread' ? '✅' : '📭'}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You have no unread notifications.' 
                : 'You don\'t have any notifications yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map(n => (
              <div 
                key={n.id} 
                className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${
                  n.status === 'Unread' 
                    ? `${getNotificationColor(n.type)} border-l-4` 
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <span className="text-4xl">{getNotificationIcon(n.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {n.status === 'Unread' && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              NEW
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {n.timestamp?.toDate ? new Date(n.timestamp.toDate()).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                        <p className={`text-sm ${n.status === 'Unread' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {n.message}
                        </p>
                        {n.relatedRequestId && (
                          <Link
                            to={`/requests/${n.relatedRequestId}`}
                            className="inline-block mt-3 text-primary-600 hover:text-primary-700 font-semibold text-sm hover:underline"
                          >
                            View Request →
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      {n.status === 'Unread' && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-semibold hover:underline"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

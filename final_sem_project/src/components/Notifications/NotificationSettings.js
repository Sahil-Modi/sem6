import React, { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { registerForPush } from '../../firebase/messagingHelper';
import { Link } from 'react-router-dom';

const NotificationSettings = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  const [settings, setSettings] = useState({
    pushEnabled: false,
    emailEnabled: true,
    requestVerified: true,
    requestRejected: true,
    donorAccepted: true,
    requestCompleted: true,
    newRequestNearby: true,
    verificationRequired: true
  });

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load user notification settings
    const loadSettings = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.notificationSettings) {
            setSettings({ ...settings, ...data.notificationSettings });
          }
          if (data.fcmToken) {
            setFcmToken(data.fcmToken);
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };

    loadSettings();
  }, [currentUser]);

  const handleEnablePushNotifications = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await registerForPush(currentUser.uid);
      
      if (token) {
        // Save FCM token to user document
        await updateDoc(doc(db, 'users', currentUser.uid), {
          fcmToken: token,
          fcmTokenUpdatedAt: new Date().toISOString()
        });
        
        setFcmToken(token);
        setNotificationPermission('granted');
        setSettings({ ...settings, pushEnabled: true });
        setSuccess('Push notifications enabled successfully!');
      } else {
        setError('Failed to enable push notifications. Please check your browser settings.');
      }
    } catch (err) {
      console.error('Error enabling push notifications:', err);
      setError('Failed to enable push notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        notificationSettings: settings
      });

      setSuccess('Notification settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">⚙️</span>
                Notification Settings
              </h1>
              <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
            </div>
            <Link 
              to="/notifications" 
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              <span className="mr-2">←</span> Back to Notifications
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded mb-6 animate-slide-up">
            <div className="flex items-center">
              <span className="text-xl mr-2">✅</span>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-slide-up">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Push Notifications Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">🔔</span>
              Push Notifications
            </h2>
          </div>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Browser Push Notifications</h3>
                <p className="text-sm text-gray-600">
                  Get instant alerts for important updates even when the app is closed
                </p>
              </div>
              <div className="text-right">
                {notificationPermission === 'granted' ? (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm">
                    ✓ Enabled
                  </span>
                ) : notificationPermission === 'denied' ? (
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold text-sm">
                    ✗ Blocked
                  </span>
                ) : (
                  <button
                    onClick={handleEnablePushNotifications}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Enabling...' : 'Enable Now'}
                  </button>
                )}
              </div>
            </div>

            {notificationPermission === 'denied' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">⚠️ Notifications Blocked:</span> You have blocked notifications for this site. 
                  Please enable them in your browser settings to receive push notifications.
                </p>
              </div>
            )}

            {fcmToken && (
              <div className="mt-4 bg-gray-50 p-4 rounded border border-gray-200">
                <p className="text-xs text-gray-600 mb-1 font-semibold">FCM Token (for debugging):</p>
                <p className="text-xs text-gray-500 font-mono break-all">{fcmToken}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Preferences Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="mr-3">📋</span>
              Notification Preferences
            </h2>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Request Notifications */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Request Updates</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">Request Verified</p>
                    <p className="text-sm text-gray-600">When your request is verified by admin/NGO</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('requestVerified')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.requestVerified ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.requestVerified ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">Request Rejected</p>
                    <p className="text-sm text-gray-600">When your request is rejected with reason</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('requestRejected')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.requestRejected ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.requestRejected ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">Donor Accepted</p>
                    <p className="text-sm text-gray-600">When a donor accepts your request</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('donorAccepted')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.donorAccepted ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.donorAccepted ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-800">Request Completed</p>
                    <p className="text-sm text-gray-600">When your request is marked as completed</p>
                  </div>
                  <button
                    onClick={() => handleToggleSetting('requestCompleted')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.requestCompleted ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.requestCompleted ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Donor Notifications */}
            {userData?.role === 'donor' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Donor Alerts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">New Requests Nearby</p>
                      <p className="text-sm text-gray-600">Alert me when urgent requests are posted near my location</p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('newRequestNearby')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.newRequestNearby ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.newRequestNearby ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Admin/NGO Notifications */}
            {(userData?.role === 'admin' || userData?.role === 'ngo' || userData?.role === 'hospital') && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Admin/NGO Alerts</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <p className="font-medium text-gray-800">Verification Required</p>
                      <p className="text-sm text-gray-600">When new requests need verification</p>
                    </div>
                    <button
                      onClick={() => handleToggleSetting('verificationRequired')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.verificationRequired ? 'bg-primary-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.verificationRequired ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Notifications</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Push notifications work even when the app is closed</li>
            <li>• You can manage browser notification permissions in your browser settings</li>
            <li>• Email notifications will be sent to your registered email address</li>
            <li>• Critical notifications (like emergency requests) cannot be disabled</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;

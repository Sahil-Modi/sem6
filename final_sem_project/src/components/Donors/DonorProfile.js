import React, { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const DonorProfile = () => {
  const { currentUser, userData, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    bloodGroup: '',
    availability: true,
    isNottoRegistered: false,
    lastDonation: null
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        location: userData.location || '',
        bloodGroup: userData.bloodGroup || '',
        availability: userData.availability !== false, // default to true
        isNottoRegistered: userData.isNottoRegistered || false,
        lastDonation: userData.lastDonation || null
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleToggleAvailability = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const newAvailability = !formData.availability;
      
      await updateDoc(doc(db, 'users', currentUser.uid), {
        availability: newAvailability,
        availabilityUpdatedAt: serverTimestamp()
      });

      setFormData({ ...formData, availability: newAvailability });
      setSuccess(`You are now ${newAvailability ? 'AVAILABLE' : 'UNAVAILABLE'} for donations`);
      
      // Refresh user data in context
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bloodGroup: formData.bloodGroup,
        isNottoRegistered: formData.isNottoRegistered,
        updatedAt: serverTimestamp()
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh user data in context
      if (refreshUserData) {
        await refreshUserData();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDaysSinceLastDonation = () => {
    if (!formData.lastDonation) return null;
    const lastDate = formData.lastDonation.toDate ? formData.lastDonation.toDate() : new Date(formData.lastDonation);
    const diffTime = Math.abs(new Date() - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const canDonate = () => {
    const daysSince = getDaysSinceLastDonation();
    if (!daysSince) return true; // No previous donation
    return daysSince >= 90; // 90-day cooldown period
  };

  if (!userData || userData.role !== 'donor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to donors.</p>
          <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donor Profile</h1>
              <p className="text-gray-600 mt-1">Manage your donor information and availability</p>
            </div>
            <Link 
              to="/dashboard" 
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center"
            >
              <span className="mr-2">←</span> Back to Dashboard
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

        {/* Availability Toggle Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className={`px-8 py-6 ${formData.availability ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Donation Availability</h2>
                <p className="text-white text-opacity-90">
                  {formData.availability 
                    ? '✅ You are currently available for donations' 
                    : '⏸️ You are currently unavailable for donations'}
                </p>
              </div>
              <button
                onClick={handleToggleAvailability}
                disabled={loading || !canDonate()}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.availability 
                    ? 'bg-white text-green-600 hover:bg-gray-100' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {loading ? 'Updating...' : formData.availability ? 'Mark Unavailable' : 'Mark Available'}
              </button>
            </div>
          </div>

          {/* Cooldown Warning */}
          {!canDonate() && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
              <div className="flex items-start">
                <span className="text-3xl mr-3">⏰</span>
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">Cooldown Period Active</p>
                  <p className="text-sm text-yellow-700">
                    You last donated {getDaysSinceLastDonation()} days ago. 
                    Please wait {90 - getDaysSinceLastDonation()} more days before donating again for your health and safety.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-5xl">👤</span>
                <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  <span className="mr-2">✏️</span>
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="px-8 py-8">
            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Full Name</label>
                  <p className="text-lg text-gray-800 mt-1">{formData.name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Blood Group</label>
                  <p className="text-lg text-gray-800 mt-1 flex items-center">
                    <span className="mr-2">🩸</span>
                    {formData.bloodGroup || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Phone Number</label>
                  <p className="text-lg text-gray-800 mt-1 flex items-center">
                    <span className="mr-2">📞</span>
                    {formData.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Location</label>
                  <p className="text-lg text-gray-800 mt-1 flex items-center">
                    <span className="mr-2">📍</span>
                    {formData.location || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">NOTTO Registration</label>
                  <p className="text-lg text-gray-800 mt-1">
                    {formData.isNottoRegistered ? (
                      <span className="text-green-600 font-semibold">✓ Registered</span>
                    ) : (
                      <span className="text-gray-500">Not Registered</span>
                    )}
                  </p>
                </div>
                {formData.lastDonation && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500 uppercase">Last Donation</label>
                    <p className="text-lg text-gray-800 mt-1">
                      {new Date(formData.lastDonation.toDate ? formData.lastDonation.toDate() : formData.lastDonation).toLocaleDateString()}
                      <span className="text-sm text-gray-500 ml-2">
                        ({getDaysSinceLastDonation()} days ago)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      placeholder="City, Country"
                      required
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      name="isNottoRegistered"
                      checked={formData.isNottoRegistered}
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <label className="font-semibold text-gray-800 text-sm">
                        I am registered on NOTTO (National Organ & Tissue Transplant Organisation)
                      </label>
                      {!formData.isNottoRegistered && (
                        <div className="mt-3">
                          <a
                            href="https://notto.abdm.gov.in/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm"
                          >
                            <span className="mr-2">🏥</span>
                            Register on NOTTO
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      // Reset form data
                      setFormData({
                        name: userData.name || '',
                        phone: userData.phone || '',
                        location: userData.location || '',
                        bloodGroup: userData.bloodGroup || '',
                        availability: userData.availability !== false,
                        isNottoRegistered: userData.isNottoRegistered || false,
                        lastDonation: userData.lastDonation || null
                      });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Donation Statistics */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">📊</span>
            Donation Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-2 border-green-200">
              <div className="text-4xl mb-2">🩸</div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Total Donations</p>
              <p className="text-3xl font-bold text-green-600">
                {userData.totalDonations || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-2 border-blue-200">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Lives Impacted</p>
              <p className="text-3xl font-bold text-blue-600">
                {(userData.totalDonations || 0) * 3}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-2 border-purple-200">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-sm text-gray-600 uppercase font-semibold">Status</p>
              <p className="text-lg font-bold text-purple-600">
                {canDonate() ? 'Ready to Donate' : 'In Cooldown'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';

const DonationHistory = () => {
  const { currentUser, userData } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (currentUser && userData?.role === 'donor') {
      fetchDonationHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userData]);

  const fetchDonationHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'donations'),
        where('donorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const donationData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setDonations(donationData);
    } catch (error) {
      console.error('Error fetching donation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations.filter(d => {
    if (filter === 'all') return true;
    return d.status === filter;
  });

  const stats = {
    total: donations.length,
    completed: donations.filter(d => d.status === 'completed').length,
    pending: donations.filter(d => d.status === 'pending').length,
    cancelled: donations.filter(d => d.status === 'cancelled').length
  };

  if (!userData || userData.role !== 'donor') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">Only donors can view donation history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading donation history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
        <p className="text-gray-600 mt-2">Track all your contributions and impact</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-600 mb-2">Total Donations</h3>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-green-600 mb-2">Completed</h3>
          <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-yellow-600 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-red-600 mb-2">Cancelled</h3>
          <p className="text-3xl font-bold text-red-900">{stats.cancelled}</p>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Impact</h2>
        <p className="text-4xl font-bold text-primary-600 mb-2">{stats.completed}</p>
        <p className="text-gray-700">Lives potentially saved through your donations! 🎉</p>
        <div className="mt-4 flex justify-center space-x-8">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total * 2}</p>
            <p className="text-sm text-gray-600">People Helped</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total * 500}</p>
            <p className="text-sm text-gray-600">ML Blood Donated</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({donations.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'completed'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Completed ({stats.completed})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pending ({stats.pending})
        </button>
      </div>

      {/* Donations List */}
      {filteredDonations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No donations yet</h3>
          <p className="text-gray-600 mb-6">Start making a difference by accepting donation requests!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDonations.map((donation) => (
            <div key={donation.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {donation.type || 'Blood'} Donation
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donation.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {donation.status?.charAt(0).toUpperCase() + donation.status?.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Receiver:</p>
                      <p className="font-medium text-gray-900">{donation.receiverName || 'Anonymous'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Location:</p>
                      <p className="font-medium text-gray-900">{donation.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date:</p>
                      <p className="font-medium text-gray-900">
                        {donation.createdAt?.toDate
                          ? donation.createdAt.toDate().toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Urgency:</p>
                      <p className="font-medium text-gray-900">{donation.urgency || 'Medium'}</p>
                    </div>
                  </div>

                  {donation.notes && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Notes:</p>
                      <p className="text-gray-900">{donation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-4xl mb-2">
                    {donation.status === 'completed' ? '✅' : donation.status === 'pending' ? '⏳' : '❌'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistory;

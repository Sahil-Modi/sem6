import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const RequestsList = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified, completed, rejected

  const getStatusBadge = (status, verificationStatus) => {
    if (verificationStatus === 'rejected' || status === 'Rejected') {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (status === 'Completed') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (status === 'Verified') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (status === 'Matched') {
      return 'bg-purple-100 text-purple-800 border-purple-300';
    }
    if (status === 'In Progress') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300'; // Pending
  };

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const requestsRef = collection(db, 'requests');
        let q;

        if (!userData) return;

        if (userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital') {
          q = query(requestsRef, orderBy('createdAt', 'desc'));
        } else if (userData.role === 'receiver') {
          q = query(requestsRef, where('receiverId', '==', userData.uid), orderBy('createdAt', 'desc'));
        } else if (userData.role === 'donor') {
          q = query(requestsRef, where('status', '==', 'Verified'), orderBy('createdAt', 'desc'));
        } else {
          q = query(requestsRef, orderBy('createdAt', 'desc'));
        }

        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRequests(data);
      } catch (err) {
        console.error('Error fetching requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userData]);

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'Pending';
    if (filter === 'verified') return r.status === 'Verified';
    if (filter === 'completed') return r.status === 'Completed';
    if (filter === 'rejected') return r.verificationStatus === 'rejected' || r.status === 'Rejected';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resource Requests</h1>
              <p className="text-gray-600 mt-1">View and manage medical resource requests</p>
            </div>
            {userData?.role === 'receiver' && (
              <Link 
                to="/create-request" 
                className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="mr-2">+</span>
                Create Request
              </Link>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 bg-white p-2 rounded-lg shadow-sm">
            {['all', 'pending', 'verified', 'completed', 'rejected'].map(f => (
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
                {f === 'all' && ` (${requests.length})`}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {filter === 'all' ? 'There are no requests to display.' : `No ${filter} requests at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-primary-50 to-purple-50 px-6 py-4 border-b-2 border-primary-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl">
                        {r.type === 'Blood' && '🩸'}
                        {r.type === 'Plasma' && '💉'}
                        {r.type === 'Oxygen' && '🫁'}
                        {r.type === 'Medicine' && '💊'}
                        {r.type === 'Other' && '🏥'}
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{r.type}</h3>
                        <p className="text-sm text-gray-600">
                          Tracking: <span className="font-mono font-semibold">{r.trackingId || r.id.substring(0, 12)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-4 py-2 rounded-full font-bold text-sm ${getUrgencyBadge(r.urgency)}`}>
                        {r.urgency}
                      </span>
                      <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${getStatusBadge(r.status, r.verificationStatus)}`}>
                        {r.verificationStatus === 'rejected' ? 'Rejected' : r.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                      <p className="text-lg text-gray-800 flex items-center mt-1">
                        <span className="mr-2">📍</span>
                        {r.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase">Requested</label>
                      <p className="text-lg text-gray-800 flex items-center mt-1">
                        <span className="mr-2">🕒</span>
                        {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    {r.verifiedByName && (
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Verified By</label>
                        <p className="text-lg text-gray-800 flex items-center mt-1">
                          <span className="mr-2">✓</span>
                          {r.verifiedByName}
                        </p>
                      </div>
                    )}
                  </div>

                  {r.description && (
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                      <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {r.description}
                      </p>
                    </div>
                  )}

                  {r.rejectionReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{r.rejectionReason}</p>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/requests/${r.id}`}
                      className="inline-flex items-center bg-gradient-to-r from-primary-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <span className="mr-2">👁️</span>
                      View Full Details
                      <span className="ml-2">→</span>
                    </Link>
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

export default RequestsList;

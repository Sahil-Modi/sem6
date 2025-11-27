import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const VerifyRequests = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'requests'), where('status', '==', 'Pending'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching pending requests:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userData && (userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital')) {
      fetchPending();
    }
  }, [userData]);

  const handleVerify = async (requestId, receiverId, trackingId) => {
    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'Verified',
        verificationStatus: 'verified',
        verifiedBy: userData.uid,
        verifiedByName: userData.name,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // notify receiver
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        message: `✅ Your request (${trackingId}) has been verified by ${userData.name}. Donors can now see your request.`,
        relatedRequestId: requestId,
        type: 'request_verified',
        status: 'Unread',
        createdBy: userData.uid,
        timestamp: serverTimestamp()
      });

      // remove from local list
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error verifying request:', err);
      alert('Failed to verify: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId, receiverId, trackingId) => {
    const reason = rejectReason[requestId] || 'No reason provided';
    setProcessingId(requestId);
    
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'Rejected',
        verificationStatus: 'rejected',
        rejectedBy: userData.uid,
        rejectedByName: userData.name,
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // notify receiver
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        message: `❌ Your request (${trackingId}) has been rejected. Reason: ${reason}`,
        relatedRequestId: requestId,
        type: 'request_rejected',
        status: 'Unread',
        createdBy: userData.uid,
        timestamp: serverTimestamp()
      });

      // remove from local list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setShowRejectModal(null);
      setRejectReason({});
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!userData || !(userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Verify Requests</h1>
              <p className="text-gray-600 mt-1">Review and approve emergency requests</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-sm border-2 border-primary-200">
              <div className="text-sm text-gray-600">Pending Requests</div>
              <div className="text-3xl font-bold text-primary-600">{requests.length}</div>
            </div>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-lg text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending requests to verify at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">
                        {r.type === 'Blood' && '🩸'}
                        {r.type === 'Plasma' && '💉'}
                        {r.type === 'Oxygen' && '🫁'}
                        {r.type === 'Medicine' && '💊'}
                        {r.type === 'Other' && '🏥'}
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{r.type} Request</h3>
                        <p className="text-blue-100 text-sm">Tracking ID: {r.trackingId || r.id}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${getUrgencyColor(r.urgency)}`}>
                      {r.urgency}
                    </span>
                  </div>
                </div>

                {/* Request Body */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase">Location</label>
                      <p className="text-lg text-gray-800 flex items-center mt-1">
                        <span className="mr-2">📍</span>
                        {r.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase">Requested By</label>
                      <p className="text-lg text-gray-800 flex items-center mt-1">
                        <span className="mr-2">👤</span>
                        {r.receiverName || 'Unknown'}
                      </p>
                    </div>
                    {r.receiverPhone && (
                      <div>
                        <label className="text-sm font-semibold text-gray-500 uppercase">Contact</label>
                        <p className="text-lg text-gray-800 flex items-center mt-1">
                          <span className="mr-2">📞</span>
                          {r.receiverPhone}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-semibold text-gray-500 uppercase">Submitted</label>
                      <p className="text-lg text-gray-800 flex items-center mt-1">
                        <span className="mr-2">🕒</span>
                        {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  {r.description && (
                    <div className="mb-6">
                      <label className="text-sm font-semibold text-gray-500 uppercase">Description</label>
                      <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {r.description}
                      </p>
                    </div>
                  )}

                  {/* Rejection Modal */}
                  {showRejectModal === r.id && (
                    <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                      <label className="text-sm font-semibold text-red-800 uppercase mb-2 block">
                        Rejection Reason <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        value={rejectReason[r.id] || ''}
                        onChange={(e) => setRejectReason({...rejectReason, [r.id]: e.target.value})}
                        className="w-full px-4 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows="3"
                        placeholder="Please provide a reason for rejection..."
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-4">
                    {showRejectModal !== r.id ? (
                      <>
                        <button
                          onClick={() => handleVerify(r.id, r.receiverId, r.trackingId || r.id)}
                          disabled={processingId === r.id}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingId === r.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">✅</span>
                              Verify & Approve
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectModal(r.id)}
                          disabled={processingId === r.id}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <span className="mr-2">❌</span>
                          Reject Request
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleReject(r.id, r.receiverId, r.trackingId || r.id)}
                          disabled={processingId === r.id || !rejectReason[r.id]?.trim()}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingId === r.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">❌</span>
                              Confirm Rejection
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setShowRejectModal(null);
                            setRejectReason({...rejectReason, [r.id]: ''});
                          }}
                          disabled={processingId === r.id}
                          className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </>
                    )}
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

export default VerifyRequests;

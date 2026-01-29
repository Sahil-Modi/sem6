import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const docRef = doc(db, 'requests', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setRequest({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert('Request not found');
          navigate('/requests');
        }
      } catch (error) {
        console.error('Error fetching request:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, navigate]);

  const handleAcceptRequest = async () => {
    if (!currentUser || userData.role !== 'donor') {
      alert('Only donors can accept requests');
      return;
    }

    setAccepting(true);
    try {
      const acceptedDonors = request.acceptedDonors || [];
      
      if (acceptedDonors.includes(currentUser.uid)) {
        alert('You have already accepted this request');
        return;
      }

      await updateDoc(doc(db, 'requests', id), {
        acceptedDonors: [...acceptedDonors, currentUser.uid],
        status: 'Matched',
        matchedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Notify receiver
      await addDoc(collection(db, 'notifications'), {
        userId: request.receiverId,
        message: `🎉 Great news! ${userData.name} has accepted your request (${request.trackingId}). Contact: ${userData.phone || 'Not provided'}`,
        relatedRequestId: id,
        type: 'donor_accepted',
        status: 'Unread',
        createdBy: currentUser.uid,
        timestamp: serverTimestamp()
      });

      alert('Request accepted! The receiver will be notified.');
      setRequest({...request, acceptedDonors: [...acceptedDonors, currentUser.uid], status: 'Matched'});
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!currentUser) return;

    // Only receiver, admin, NGO, or hospital can update status
    if (userData.role !== 'receiver' && userData.role !== 'admin' && userData.role !== 'ngo' && userData.role !== 'hospital') {
      alert('You do not have permission to update this request');
      return;
    }

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'requests', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        ...(newStatus === 'Completed' && { completedAt: serverTimestamp() })
      });

      // Notify accepted donors if completed
      if (newStatus === 'Completed' && request.acceptedDonors) {
        for (const donorId of request.acceptedDonors) {
          await addDoc(collection(db, 'notifications'), {
            userId: donorId,
            message: `✅ The request (${request.trackingId}) you accepted has been marked as completed. Thank you for your help!`,
            relatedRequestId: id,
            type: 'request_completed',
            status: 'Unread',
            createdBy: currentUser.uid,
            timestamp: serverTimestamp()
          });
        }
      }

      setRequest({...request, status: newStatus});
      alert(`Request status updated to: ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!currentUser || userData.uid !== request.receiverId) {
      alert('Only the request creator can cancel it');
      return;
    }

    if (!['Pending', 'Verified'].includes(request.status)) {
      alert('Only pending or verified requests can be cancelled');
      return;
    }

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this request? This action cannot be undone.'
    );

    if (!confirmCancel) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, 'requests', id), {
        status: 'Cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: currentUser.uid,
        updatedAt: serverTimestamp()
      });

      // Notify matched donors if any
      if (request.matchedDonors && request.matchedDonors.length > 0) {
        for (const donorId of request.matchedDonors) {
          await addDoc(collection(db, 'notifications'), {
            userId: donorId,
            type: 'request_cancelled',
            title: 'Request Cancelled',
            message: `The blood request (${request.trackingId}) for ${request.bloodGroup} has been cancelled by the requester.`,
            requestId: id,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }

      // Notify accepted donors if any
      if (request.acceptedDonors && request.acceptedDonors.length > 0) {
        for (const donorId of request.acceptedDonors) {
          await addDoc(collection(db, 'notifications'), {
            userId: donorId,
            type: 'request_cancelled',
            title: 'Request Cancelled',
            message: `The blood request (${request.trackingId}) you accepted has been cancelled.`,
            requestId: id,
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }

      setRequest({...request, status: 'Cancelled'});
      alert('Request has been cancelled successfully');
      navigate('/requests');
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert('Failed to cancel request: ' + error.message);
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Verified': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Matched': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-yellow-500 text-white';
      case 'Low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusSteps = () => {
    const steps = ['Pending', 'Verified', 'Matched', 'In Progress', 'Completed'];
    const currentIndex = steps.indexOf(request.status);
    
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Not Found</h2>
          <Link to="/requests" className="text-primary-600 hover:underline">← Back to Requests</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/requests" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
            <span className="mr-2">←</span> Back to Requests
          </Link>
        </div>

        {/* Request Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-5xl">
                  {request.type === 'Blood' && '🩸'}
                  {request.type === 'Plasma' && '💉'}
                  {request.type === 'Oxygen' && '🫁'}
                  {request.type === 'Medicine' && '💊'}
                  {request.type === 'Other' && '🏥'}
                </span>
                <div>
                  <h1 className="text-3xl font-bold text-white">{request.type} Request</h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Tracking ID: <span className="font-mono font-bold">{request.trackingId || request.id}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-5 py-2 rounded-full font-bold text-sm ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency}
                </span>
                <span className={`px-5 py-2 rounded-full font-bold text-sm border-2 ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            </div>
          </div>

          {/* Status Progress Tracker */}
          {request.status !== 'Rejected' && (
            <div className="px-8 py-6 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-600 uppercase mb-4">Request Progress</h3>
              <div className="flex items-center justify-between">
                {getStatusSteps().map((step, index) => (
                  <div key={step.name} className="flex-1 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                        step.completed 
                          ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <p className={`text-xs mt-2 font-semibold ${step.current ? 'text-primary-600' : 'text-gray-600'}`}>
                        {step.name}
                      </p>
                    </div>
                    {index < 4 && (
                      <div className={`absolute top-6 left-1/2 w-full h-1 ${
                        step.completed ? 'bg-primary-600' : 'bg-gray-300'
                      }`} style={{ transform: 'translateX(50%)' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Details */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">Location</label>
                <p className="text-lg text-gray-800 flex items-center mt-2">
                  <span className="mr-2">📍</span>
                  {request.location}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">Requested By</label>
                <p className="text-lg text-gray-800 flex items-center mt-2">
                  <span className="mr-2">👤</span>
                  {request.receiverName || 'Unknown User'}
                </p>
              </div>
              {request.receiverPhone && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Contact</label>
                  <p className="text-lg text-gray-800 flex items-center mt-2">
                    <span className="mr-2">📞</span>
                    {request.receiverPhone}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">Created On</label>
                <p className="text-lg text-gray-800 flex items-center mt-2">
                  <span className="mr-2">🕒</span>
                  {request.createdAt?.toDate ? new Date(request.createdAt.toDate()).toLocaleString() : 'Recently'}
                </p>
              </div>
              {request.verifiedByName && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Verified By</label>
                  <p className="text-lg text-gray-800 flex items-center mt-2">
                    <span className="mr-2">✅</span>
                    {request.verifiedByName}
                  </p>
                </div>
              )}
              {request.verifiedAt && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase">Verified On</label>
                  <p className="text-lg text-gray-800 flex items-center mt-2">
                    <span className="mr-2">✓</span>
                    {new Date(request.verifiedAt.toDate()).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {request.description && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-500 uppercase">Description</label>
                <p className="text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {request.description}
                </p>
              </div>
            )}

            {request.rejectionReason && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-700">{request.rejectionReason}</p>
              </div>
            )}

            {request.acceptedDonors && request.acceptedDonors.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-500 uppercase">Accepted Donors</label>
                <div className="mt-2 bg-green-50 border border-green-300 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">
                    🎉 {request.acceptedDonors.length} donor(s) have accepted this request!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {/* Edit & Cancel Buttons for Receiver (only for Pending/Verified requests) */}
              {userData?.uid === request.receiverId && ['Pending', 'Verified'].includes(request.status) && (
                <div className="flex gap-3 w-full mb-3">
                  <Link
                    to={`/requests/edit/${id}`}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg text-center"
                  >
                    <span className="mr-2">✏️</span>
                    Edit Request
                  </Link>
                  <button
                    onClick={handleCancelRequest}
                    disabled={updating}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-2">❌</span>
                    {updating ? 'Cancelling...' : 'Cancel Request'}
                  </button>
                </div>
              )}

              {/* Donor Accept Button */}
              {userData?.role === 'donor' && request.status === 'Verified' && !request.acceptedDonors?.includes(currentUser.uid) && (
                <button
                  onClick={handleAcceptRequest}
                  disabled={accepting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {accepting ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🤝</span>
                      I Can Help - Accept Request
                    </>
                  )}
                </button>
              )}

              {/* Message Button for Donors */}
              {userData?.role === 'donor' && ['Verified', 'Matched', 'In Progress'].includes(request.status) && (
                <button
                  onClick={() => handleStartConversation(request.receiverId, request.receiverName)}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
                >
                  <span className="mr-2">💬</span>
                  Message Receiver
                </button>
              )}

              {/* Message Button for Receivers to contact Donors */}
              {userData?.uid === request.receiverId && request.acceptedDonors && request.acceptedDonors.length > 0 && (
                <div className="w-full">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Contact Donors:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.acceptedDonors.map((donorId, index) => (
                      <button
                        key={donorId}
                        onClick={() => handleStartConversation(donorId, `Donor ${index + 1}`)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                      >
                        <span className="mr-2">💬</span>
                        Message Donor {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Buttons for Receiver/Admin */}
              {(userData?.role === 'receiver' || userData?.role === 'admin' || userData?.role === 'ngo' || userData?.role === 'hospital') && 
               request.status !== 'Completed' && request.status !== 'Rejected' && request.status !== 'Cancelled' && (
                <>
                  {request.status === 'Matched' && (
                    <button
                      onClick={() => handleUpdateStatus('In Progress')}
                      disabled={updating}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2">⏳</span>
                      Mark In Progress
                    </button>
                  )}
                  {(request.status === 'In Progress' || request.status === 'Matched') && (
                    <button
                      onClick={() => handleUpdateStatus('Completed')}
                      disabled={updating}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2">✅</span>
                      Mark Completed
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;

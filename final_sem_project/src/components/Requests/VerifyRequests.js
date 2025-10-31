import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const VerifyRequests = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleVerify = async (requestId, receiverId) => {
    try {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'Verified',
        verifiedBy: userData.uid,
        verifiedAt: serverTimestamp()
      });

      // notify receiver
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        message: `Your request (${requestId}) has been verified by ${userData.name}`,
        relatedRequestId: requestId,
        status: 'Unread',
        createdBy: userData.uid,
        timestamp: serverTimestamp()
      });

      // remove from local list
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error verifying request:', err);
      alert('Failed to verify: ' + err.message);
    }
  };

  if (!userData || !(userData.role === 'admin' || userData.role === 'ngo' || userData.role === 'hospital')) {
    return <div className="p-6">You don't have access to this page.</div>;
  }

  if (loading) return <div className="p-6">Loading pending requests...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Verify Requests</h2>
      {requests.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No pending requests.</div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <div className="font-bold">{r.type} - {r.urgency}</div>
                <div className="text-sm text-gray-600">Location: {r.location}</div>
                <div className="text-xs text-gray-400">Requested by: {r.receiverId}</div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleVerify(r.id, r.receiverId)} className="bg-green-600 text-white px-4 py-2 rounded">Verify</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifyRequests;

import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const RequestsList = () => {
  const { userData } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-6">Loading requests...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Resource Requests</h2>
        {userData?.role === 'receiver' && (
          <Link to="/create-request" className="bg-primary-600 text-white px-4 py-2 rounded">Create Request</Link>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No requests found.</div>
      ) : (
        <div className="grid gap-4">
          {requests.map(r => (
            <div key={r.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
              <div>
                <h3 className="font-bold">{r.type} - <span className="text-sm text-gray-500">{r.urgency}</span></h3>
                <p className="text-sm text-gray-600">{r.description}</p>
                <p className="text-xs text-gray-400 mt-2">Location: {r.location} • Status: {r.status}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Requested: {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : 'Recently'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsList;

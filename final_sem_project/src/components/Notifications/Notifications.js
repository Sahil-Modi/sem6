import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error('Notifications snapshot error:', err));

    return () => unsub();
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No notifications</div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className={`p-3 rounded border ${n.status === 'Unread' ? 'bg-blue-50' : 'bg-white'}`}>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-400">{n.timestamp?.toDate ? n.timestamp.toDate().toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

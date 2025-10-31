import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const CreateRequest = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'Blood',
    urgency: 'High',
    location: userData?.location || '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return navigate('/login');

    setLoading(true);
    setError('');

    try {
      // Create request doc
      const reqRef = await addDoc(collection(db, 'requests'), {
        type: form.type,
        urgency: form.urgency,
        location: form.location,
        description: form.description,
        status: 'Pending',
        receiverId: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Simple matching: find donors with same location and available
      const donorsQ = query(
        collection(db, 'users'),
        where('role', '==', 'donor'),
        where('availability', '==', true),
        where('location', '==', form.location)
      );

      const donorsSnap = await getDocs(donorsQ);
      const matched = donorsSnap.docs.map(d => d.id).slice(0, 5);

      // Update request with matched donors
      if (matched.length > 0) {
        await updateDoc(doc(db, 'requests', reqRef.id), {
          matchedDonors: matched,
          status: 'Verified'
        });

        // Create notifications for matched donors
        for (const donorId of matched) {
          await addDoc(collection(db, 'notifications'), {
            userId: donorId,
            message: `A nearby request (${form.type}) matches your profile.`,
            relatedRequestId: reqRef.id,
            status: 'Unread',
            createdBy: currentUser.uid,
            timestamp: serverTimestamp()
          });
        }
      }

      // Notify admins/NGOs about new request (simple implementation: notify admins)
      const adminsQ = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminsSnap = await getDocs(adminsQ);
      for (const a of adminsSnap.docs) {
        await addDoc(collection(db, 'notifications'), {
          userId: a.id,
          message: `New request submitted: ${form.type} (${form.urgency}) in ${form.location}`,
          relatedRequestId: reqRef.id,
          status: 'Unread',
          createdBy: currentUser.uid,
          timestamp: serverTimestamp()
        });
      }

      navigate('/requests');
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Resource Request</h2>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option>Blood</option>
            <option>Plasma</option>
            <option>Oxygen</option>
            <option>Medicine</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Urgency</label>
          <select name="urgency" value={form.urgency} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="mt-1 block w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" className="mt-1 block w-full border rounded p-2" />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded">
            {loading ? 'Creating...' : 'Create Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      // Generate unique tracking ID
      const trackingId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create request doc
      const reqRef = await addDoc(collection(db, 'requests'), {
        type: form.type,
        urgency: form.urgency,
        location: form.location,
        description: form.description,
        status: 'Pending',
        trackingId: trackingId,
        receiverId: currentUser.uid,
        receiverName: userData?.name || 'Unknown',
        receiverPhone: userData?.phone || '',
        verificationStatus: 'pending', // pending, verified, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
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

      // Notify admins/NGOs about new request for verification
      const adminsQ = query(collection(db, 'users'), where('role', 'in', ['admin', 'ngo', 'hospital']));
      const adminsSnap = await getDocs(adminsQ);
      for (const a of adminsSnap.docs) {
        await addDoc(collection(db, 'notifications'), {
          userId: a.id,
          message: `New request submitted: ${form.type} (${form.urgency}) in ${form.location}. Tracking ID: ${trackingId}`,
          relatedRequestId: reqRef.id,
          type: 'verification_required',
          status: 'Unread',
          createdBy: currentUser.uid,
          timestamp: serverTimestamp()
        });
      }

      alert(`Request created successfully! Your tracking ID: ${trackingId}\nPlease save this for future reference.`);
      navigate('/requests');
    } catch (err) {
      console.error('Error creating request:', err);
      setError(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-primary-600 to-purple-600 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-blob" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-8 py-10 text-center">
            <div className="text-6xl mb-4 animate-float">🆘</div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Emergency Request</h1>
            <p className="text-blue-100">Help is on the way - submit your medical resource request</p>
          </div>

          <div className="px-8 py-10">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-slide-up">
                <div className="flex items-center">
                  <span className="text-xl mr-2">⚠️</span>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Resource Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">🏥</span>
                    </div>
                    <select 
                      name="type" 
                      value={form.type} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option>Blood</option>
                      <option>Plasma</option>
                      <option>Oxygen</option>
                      <option>Medicine</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">⚡</span>
                    </div>
                    <select 
                      name="urgency" 
                      value={form.urgency} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                      required
                    >
                      <option>Critical</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📍</span>
                  </div>
                  <input 
                    name="location" 
                    value={form.location} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Enter your city or area"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Description <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="text-gray-400">📝</span>
                  </div>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    rows="5" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="Please provide details about your medical emergency, quantity needed, blood group (if applicable), patient condition, etc."
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⓘ Please provide as much detail as possible to help donors and verifiers understand your situation.
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">📢 Note:</span> Your request will be reviewed by our admin/NGO team for verification before being visible to donors. You'll receive a notification once verified.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Submitting Request...
                  </span>
                ) : (
                  <>
                    <span className="mr-2">🆘</span>
                    Submit Emergency Request
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/requests" className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition">
                ← Back to Requests
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { geocodeAddress } from '../../utils/geocoding';

const EditRequest = () => {
  const { userData } = useAuth();
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [originalRequest, setOriginalRequest] = useState(null);
  
  const [formData, setFormData] = useState({
    bloodGroup: '',
    units: '',
    urgency: '',
    location: '',
    hospitalName: '',
    patientName: '',
    contactNumber: '',
    additionalInfo: ''
  });

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        setError('Request not found');
        setLoading(false);
        return;
      }

      const requestData = requestSnap.data();
      
      // Check permissions
      if (requestData.requesterId !== userData.uid) {
        setError('You do not have permission to edit this request');
        setLoading(false);
        return;
      }

      // Check if request can be edited (only Pending or Verified requests)
      if (!['Pending', 'Verified'].includes(requestData.status)) {
        setError(`Cannot edit request with status: ${requestData.status}. Only Pending or Verified requests can be edited.`);
        setLoading(false);
        return;
      }

      setOriginalRequest(requestData);
      setFormData({
        bloodGroup: requestData.bloodGroup || '',
        units: requestData.units || '',
        urgency: requestData.urgency || '',
        location: requestData.location || '',
        hospitalName: requestData.hospitalName || '',
        patientName: requestData.patientName || '',
        contactNumber: requestData.contactNumber || '',
        additionalInfo: requestData.additionalInfo || ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to load request. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.bloodGroup || !formData.units || !formData.urgency || 
          !formData.location || !formData.hospitalName || !formData.contactNumber) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      // Geocode location if it changed
      let coordinates = originalRequest.coordinates;
      if (formData.location !== originalRequest.location) {
        const geocoded = await geocodeAddress(formData.location);
        if (geocoded) {
          coordinates = geocoded;
        }
      }

      // Update request
      const requestRef = doc(db, 'requests', requestId);
      const updates = {
        ...formData,
        coordinates: coordinates,
        lastEditedAt: serverTimestamp(),
        editHistory: [
          ...(originalRequest.editHistory || []),
          {
            editedAt: new Date().toISOString(),
            editedBy: userData.uid,
            changes: getChanges()
          }
        ]
      };

      await updateDoc(requestRef, updates);

      // Create notification for changes
      await addDoc(collection(db, 'notifications'), {
        userId: userData.uid,
        type: 'request_edited',
        title: 'Request Updated',
        message: `Your blood request for ${formData.bloodGroup} has been successfully updated.`,
        requestId: requestId,
        read: false,
        createdAt: serverTimestamp()
      });

      // If request was already verified, notify admin about changes
      if (originalRequest.status === 'Verified' && originalRequest.verifiedBy) {
        await addDoc(collection(db, 'notifications'), {
          userId: originalRequest.verifiedBy,
          type: 'request_changed',
          title: 'Verified Request Modified',
          message: `A verified request (${formData.bloodGroup}) has been edited by the requester.`,
          requestId: requestId,
          read: false,
          createdAt: serverTimestamp()
        });
      }

      navigate(`/requests/${requestId}`);
    } catch (err) {
      console.error('Error updating request:', err);
      setError('Failed to update request. Please try again.');
      setSaving(false);
    }
  };

  const getChanges = () => {
    const changes = [];
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalRequest[key]) {
        changes.push({
          field: key,
          oldValue: originalRequest[key],
          newValue: formData[key]
        });
      }
    });
    return changes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (error && !originalRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cannot Edit Request</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/requests')}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">✏️</span>
              Edit Blood Request
            </h2>
            <p className="text-gray-600 mt-2">
              Update your blood request details. Changes will be recorded for transparency.
            </p>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Note:</span> If your request has been verified, editing it may require re-verification by an admin.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Blood Group & Units */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Blood Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  Units Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="1"
                  max="20"
                  placeholder="e.g., 2"
                  required
                />
              </div>
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="">Select Urgency</option>
                <option value="Critical">🔴 Critical (Immediate)</option>
                <option value="High">🟠 High (Within 24 hours)</option>
                <option value="Medium">🟡 Medium (2-3 days)</option>
                <option value="Low">🟢 Low (Scheduled)</option>
              </select>
            </div>

            {/* Hospital Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Hospital Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., City General Hospital"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Sector 18, Noida, Uttar Pradesh"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include city, state for better donor matching
              </p>
            </div>

            {/* Patient Name & Contact */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-sm">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., +91 9876543210"
                  required
                />
              </div>
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">
                Additional Information
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Any additional details about the case..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Changes
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(`/requests/${requestId}`)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRequest;

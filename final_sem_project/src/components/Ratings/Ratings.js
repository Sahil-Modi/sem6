import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Ratings = () => {
  const { currentUser, userData } = useAuth();
  const [myRatings, setMyRatings] = useState([]);
  const [receivedRatings, setReceivedRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({
    targetUserId: '',
    targetUserName: '',
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (currentUser) {
      fetchRatings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      // Ratings given by me
      const givenQuery = query(
        collection(db, 'ratings'),
        where('fromUserId', '==', currentUser.uid)
      );
      const givenSnap = await getDocs(givenQuery);
      const given = givenSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyRatings(given);

      // Ratings received by me
      const receivedQuery = query(
        collection(db, 'ratings'),
        where('toUserId', '==', currentUser.uid)
      );
      const receivedSnap = await getDocs(receivedQuery);
      const received = receivedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReceivedRatings(received);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'ratings'), {
        fromUserId: currentUser.uid,
        fromUserName: userData.name,
        toUserId: ratingData.targetUserId,
        toUserName: ratingData.targetUserName,
        rating: parseInt(ratingData.rating),
        comment: ratingData.comment,
        createdAt: serverTimestamp()
      });

      // Update target user's average rating
      await updateUserAverageRating(ratingData.targetUserId);

      setShowRatingModal(false);
      setRatingData({ targetUserId: '', targetUserName: '', rating: 5, comment: '' });
      fetchRatings();
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    }
  };

  const updateUserAverageRating = async (userId) => {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('toUserId', '==', userId)
      );
      const ratingsSnap = await getDocs(ratingsQuery);
      const ratings = ratingsSnap.docs.map(doc => doc.data().rating);
      
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await updateDoc(doc(db, 'users', userId), {
          averageRating: avgRating,
          totalRatings: ratings.length
        });
      }
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  };

  const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading ratings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
        <p className="text-gray-600 mt-2">Your reputation in the MediReach community</p>
      </div>

      {/* Overall Rating Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-8 mb-8 text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Your Average Rating</h2>
        <div className="flex items-center justify-center space-x-4">
          <p className="text-6xl font-bold text-yellow-600">
            {calculateAverageRating(receivedRatings)}
          </p>
          <div>
            {renderStars(Math.round(calculateAverageRating(receivedRatings)))}
            <p className="text-sm text-gray-600 mt-1">
              Based on {receivedRatings.length} review{receivedRatings.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Received Ratings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ratings Received ({receivedRatings.length})
          </h2>
          {receivedRatings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">⭐</p>
              <p>No ratings received yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRatings.map((rating) => (
                <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{rating.fromUserName}</p>
                      {renderStars(rating.rating)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {rating.createdAt?.toDate
                        ? rating.createdAt.toDate().toLocaleDateString()
                        : 'Recent'}
                    </p>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 mt-2 text-sm">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Given Ratings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              Ratings Given ({myRatings.length})
            </h2>
            <button
              onClick={() => setShowRatingModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm font-medium"
            >
              + Rate User
            </button>
          </div>
          {myRatings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">✍️</p>
              <p>You haven't rated anyone yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRatings.map((rating) => (
                <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{rating.toUserName}</p>
                      {renderStars(rating.rating)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {rating.createdAt?.toDate
                        ? rating.createdAt.toDate().toLocaleDateString()
                        : 'Recent'}
                    </p>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-700 mt-2 text-sm">{rating.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Rate User</h3>
            <form onSubmit={handleSubmitRating}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">User ID</label>
                <input
                  type="text"
                  value={ratingData.targetUserId}
                  onChange={(e) => setRatingData({ ...ratingData, targetUserId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter user ID"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">User Name</label>
                <input
                  type="text"
                  value={ratingData.targetUserName}
                  onChange={(e) => setRatingData({ ...ratingData, targetUserName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter user name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingData({ ...ratingData, rating: star })}
                      className={`text-4xl ${
                        star <= ratingData.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Comment (Optional)</label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({ ...ratingData, comment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition font-semibold"
                >
                  Submit Rating
                </button>
                <button
                  type="button"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ratings;

/**
 * AI Donor Matcher Integration
 * Connects React frontend with Python AI matching service
 */

const AI_BACKEND_URL = process.env.REACT_APP_AI_BACKEND_URL || 'http://localhost:5000';

/**
 * Check if AI service is available
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'healthy';
  } catch (error) {
    console.warn('AI service not available, using fallback matching');
    return false;
  }
};

/**
 * Match donors using AI algorithm
 * @param {Array} donors - Array of donor objects
 * @param {Object} requestData - Request details
 * @param {Number} limit - Number of top matches to return
 */
export const matchDonorsWithAI = async (donors, requestData, limit = 10) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/api/match-donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        donors: donors,
        request: requestData,
        limit: limit
      })
    });

    if (!response.ok) {
      throw new Error('AI matching service error');
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        matches: data.topMatches,
        totalDonors: data.totalDonors,
        matchesFound: data.matchesFound
      };
    } else {
      throw new Error(data.error || 'Matching failed');
    }
  } catch (error) {
    console.error('AI matching error:', error);
    // Return fallback to basic matching
    return {
      success: false,
      error: error.message,
      matches: donors.slice(0, limit).map(d => ({
        ...d,
        matchScore: 50,
        distance: null,
        reliability: 50
      }))
    };
  }
};

/**
 * Predict urgency level from description using AI
 * @param {String} description - Request description
 */
export const predictUrgency = async (description) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/api/predict-urgency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description })
    });

    if (!response.ok) {
      throw new Error('Urgency prediction error');
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        urgency: data.predictedUrgency,
        confidence: data.confidence,
        score: data.urgencyScore
      };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Urgency prediction error:', error);
    return {
      urgency: 'Medium',
      confidence: 0.5,
      score: 0
    };
  }
};

/**
 * Calculate distance between two points using AI service
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 */
export const calculateDistance = async (point1, point2) => {
  try {
    const response = await fetch(`${AI_BACKEND_URL}/api/calculate-distance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ point1, point2 })
    });

    if (!response.ok) {
      throw new Error('Distance calculation error');
    }

    const data = await response.json();
    
    if (data.success) {
      return data.distance;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('Distance calculation error:', error);
    return null;
  }
};

/**
 * Enhanced donor matching with AI integration and fallback
 * This is the main function to use in CreateRequest.js
 */
export const smartMatchDonors = async (allDonors, requestData) => {
  // First, try AI matching
  const aiAvailable = await checkAIServiceHealth();
  
  if (aiAvailable) {
    console.log('Using AI-powered matching...');
    const result = await matchDonorsWithAI(allDonors, requestData, 10);
    
    if (result.success) {
      return result.matches.map(m => m.id);
    }
  }
  
  // Fallback to JavaScript-based matching if AI unavailable
  console.log('Using fallback matching...');
  const { getNearbyDonors, sortByDistance } = await import('./geocoding');
  
  if (requestData.coordinates) {
    const nearbyDonors = getNearbyDonors(
      allDonors,
      requestData.coordinates.lat,
      requestData.coordinates.lng,
      50
    );
    
    const sortedDonors = sortByDistance(
      nearbyDonors,
      requestData.coordinates.lat,
      requestData.coordinates.lng
    );
    
    const notifyCount = (requestData.urgency === 'Critical' || requestData.urgency === 'High') ? 10 : 5;
    return sortedDonors.slice(0, notifyCount).map(d => d.id);
  }
  
  // Ultimate fallback: location string matching
  const locationMatch = allDonors.filter(d =>
    d.location?.toLowerCase().includes(requestData.location?.toLowerCase() || '') ||
    requestData.location?.toLowerCase().includes(d.location?.toLowerCase() || '')
  );
  
  return locationMatch.slice(0, 5).map(d => d.id);
};

/**
 * Geocoding utility functions for MediReach
 * Handles address to coordinates conversion and distance calculations
 */

// Haversine formula to calculate distance between two coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Geocode address to coordinates using Nominatim (OpenStreetMap)
export const geocodeAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Sort donors by distance from a given location
export const sortByDistance = (donors, targetLat, targetLng) => {
  return donors
    .map(donor => {
      if (donor.coordinates && donor.coordinates.lat && donor.coordinates.lng) {
        const distance = calculateDistance(
          targetLat,
          targetLng,
          donor.coordinates.lat,
          donor.coordinates.lng
        );
        return { ...donor, distance };
      }
      return { ...donor, distance: Infinity };
    })
    .sort((a, b) => a.distance - b.distance);
};

// Get nearby donors within a radius (in kilometers)
export const getNearbyDonors = (donors, targetLat, targetLng, radiusKm = 50) => {
  return donors.filter(donor => {
    if (donor.coordinates && donor.coordinates.lat && donor.coordinates.lng) {
      const distance = calculateDistance(
        targetLat,
        targetLng,
        donor.coordinates.lat,
        donor.coordinates.lng
      );
      return distance <= radiusKm;
    }
    return false;
  });
};

// Format distance for display
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

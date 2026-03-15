import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { sortByDistance, formatDistance, geocodeAddress } from '../../utils/geocoding';
import DonorMap from './DonorMap';
import { Link } from 'react-router-dom';
import { FaTint, FaClipboardList, FaPhone, FaComments } from 'react-icons/fa';

const parseCoordinateValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const extractCoordinates = (user) => {
  const lat = parseCoordinateValue(
    user?.coordinates?.lat ?? user?.coordinates?.latitude ?? user?.lat ?? user?.latitude
  );
  const lng = parseCoordinateValue(
    user?.coordinates?.lng ?? user?.coordinates?.lon ?? user?.coordinates?.longitude ?? user?.lng ?? user?.lon ?? user?.longitude
  );

  if (lat === null || lng === null) return null;
  return { lat, lng };
};

const getCachedCoordinates = (location) => {
  if (!location) return null;
  try {
    const key = `geo:${location.trim().toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
      return parsed;
    }
  } catch (error) {
    console.error('Error reading geocode cache:', error);
  }
  return null;
};

const setCachedCoordinates = (location, coords) => {
  if (!location || !coords) return;
  try {
    const key = `geo:${location.trim().toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(coords));
  } catch (error) {
    console.error('Error writing geocode cache:', error);
  }
};

const DonorDirectory = () => {
  const { userData } = useAuth();
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [mapUsers, setMapUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    availability: 'all', // all, available, unavailable
    searchQuery: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // grid, map

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', 'in', ['donor', 'ngo', 'hospital']));
        const snap = await getDocs(q);
        const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        let data = allUsers.filter((u) => u.role === 'donor');
        
        // Sort by distance if user has coordinates
        if (userData?.coordinates?.lat && userData?.coordinates?.lng) {
          data = sortByDistance(data, userData.coordinates.lat, userData.coordinates.lng);
        }
        
        setDonors(data);
        setFilteredDonors(data);

        const usersWithCoordinates = await Promise.all(
          allUsers.map(async (user) => {
            const existingCoords = extractCoordinates(user);
            if (existingCoords) {
              return {
                ...user,
                coordinates: { lat: existingCoords.lat, lng: existingCoords.lng }
              };
            }

            if (!user.location) return user;

            const cached = getCachedCoordinates(user.location);
            if (cached) {
              return {
                ...user,
                coordinates: { lat: cached.lat, lng: cached.lng }
              };
            }

            const geocoded = await geocodeAddress(user.location);
            if (!geocoded) return user;

            const coords = { lat: geocoded.lat, lng: geocoded.lng };
            setCachedCoordinates(user.location, coords);
            return {
              ...user,
              coordinates: coords
            };
          })
        );

        setMapUsers(usersWithCoordinates);
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [userData]);

  // Apply filters
  useEffect(() => {
    let result = [...donors];

    // Blood group filter
    if (filters.bloodGroup) {
      result = result.filter(d => d.bloodGroup === filters.bloodGroup);
    }

    // Availability filter
    if (filters.availability === 'available') {
      result = result.filter(d => d.availability === true);
    } else if (filters.availability === 'unavailable') {
      result = result.filter(d => d.availability === false);
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name?.toLowerCase().includes(query) ||
        d.location?.toLowerCase().includes(query) ||
        d.bloodGroup?.toLowerCase().includes(query)
      );
    }

    setFilteredDonors(result);
  }, [filters, donors]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FaTint className="mr-3 text-primary-600" />
            Donor Directory
          </h1>
          <p className="text-gray-600">Find verified donors near you</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, location..."
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Blood Group Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
              <select
                value={filters.bloodGroup}
                onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Blood Groups</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Donors</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">View</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaClipboardList className="mr-2" />
                  List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    viewMode === 'map' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🗺️ Map
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-bold text-primary-600">{filteredDonors.length}</span> of <span className="font-bold">{donors.length}</span> donors
          </div>
        </div>

        {/* Content */}
        {filteredDonors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Donors Found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="bg-white rounded-lg shadow-md p-4" style={{ height: '600px' }}>
            <DonorMap donors={mapUsers} center={[20, 0]} zoom={2} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDonors.map(donor => (
              <div key={donor.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl text-primary-600">
                        <FaTint />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{donor.name || 'Anonymous'}</h3>
                        <p className="text-blue-100 text-sm">{donor.bloodGroup || 'N/A'}</p>
                      </div>
                    </div>
                    {donor.verified && (
                      <span className="bg-white text-primary-600 text-xs font-bold px-2 py-1 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-gray-400 mr-3">📍</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{donor.location || 'Location not provided'}</p>
                        {donor.distance !== undefined && donor.distance !== Infinity && (
                          <p className="text-xs text-primary-600 font-semibold mt-1">
                            {formatDistance(donor.distance)} away
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-3" />
                        <p className="text-sm text-gray-600">{donor.phone || 'Not provided'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        donor.availability 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {donor.availability ? '✓ Available' : '✗ Unavailable'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/chat`}
                      className="block w-full text-center bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <FaComments className="mr-2" />
                      Contact Donor
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDirectory;

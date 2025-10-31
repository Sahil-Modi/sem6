import { calculateDistance, formatDistance, sortByDistance, getNearbyDonors } from './geocoding';

describe('Geocoding Utils', () => {
  describe('calculateDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Distance between New York and Los Angeles (approx 3936 km)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
      expect(distance).toBeCloseTo(3936, -2); // Within 100km accuracy
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);
      expect(distance).toBeGreaterThan(0);
    });
  });

  describe('formatDistance', () => {
    it('should format distance in meters when less than 1km', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.123)).toBe('123 m');
    });

    it('should format distance in kilometers when >= 1km', () => {
      expect(formatDistance(1.5)).toBe('1.5 km');
      expect(formatDistance(10.234)).toBe('10.2 km');
    });
  });

  describe('sortByDistance', () => {
    it('should sort donors by distance from target location', () => {
      const donors = [
        { id: '1', name: 'Donor 1', coordinates: { lat: 40.7128, lng: -74.0060 } },
        { id: '2', name: 'Donor 2', coordinates: { lat: 34.0522, lng: -118.2437 } },
        { id: '3', name: 'Donor 3', coordinates: { lat: 41.8781, lng: -87.6298 } }
      ];

      const sorted = sortByDistance(donors, 40.7128, -74.0060);
      
      expect(sorted[0].id).toBe('1'); // Closest (same location)
      expect(sorted[0].distance).toBe(0);
      expect(sorted[2].distance).toBeGreaterThan(sorted[1].distance);
    });

    it('should handle donors without coordinates', () => {
      const donors = [
        { id: '1', name: 'Donor 1' },
        { id: '2', name: 'Donor 2', coordinates: { lat: 40.7128, lng: -74.0060 } }
      ];

      const sorted = sortByDistance(donors, 40.7128, -74.0060);
      
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].distance).toBe(Infinity);
    });
  });

  describe('getNearbyDonors', () => {
    it('should return only donors within specified radius', () => {
      const donors = [
        { id: '1', coordinates: { lat: 40.7128, lng: -74.0060 } }, // NY
        { id: '2', coordinates: { lat: 40.7580, lng: -73.9855 } }, // NY (nearby)
        { id: '3', coordinates: { lat: 34.0522, lng: -118.2437 } }  // LA (far)
      ];

      const nearby = getNearbyDonors(donors, 40.7128, -74.0060, 50);
      
      expect(nearby.length).toBe(2); // Only NY donors
      expect(nearby.find(d => d.id === '3')).toBeUndefined();
    });

    it('should return empty array when no donors within radius', () => {
      const donors = [
        { id: '1', coordinates: { lat: 34.0522, lng: -118.2437 } }
      ];

      const nearby = getNearbyDonors(donors, 40.7128, -74.0060, 10);
      
      expect(nearby.length).toBe(0);
    });
  });
});

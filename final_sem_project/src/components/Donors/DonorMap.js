import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue in some bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

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

const DonorMap = ({ donors, center = [20, 0], zoom = 2 }) => {
  const positions = donors
    .map((d) => {
      const coords = extractCoordinates(d);
      if (!coords) return null;

      const role = d.role === 'donor' ? 'donor' : 'organization';
      return {
        id: d.id,
        role,
        bloodGroup: d.bloodGroup,
        lat: coords.lat,
        lng: coords.lng,
        availability: d.availability
      };
    })
    .filter(Boolean);

  return (
    <div className="h-96 w-full rounded overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">
                  {p.role === 'donor' ? 'Donor Marker' : 'Organization Marker'}
                </div>
                {p.role === 'donor' ? (
                  <>
                    <div>Blood: {p.bloodGroup || 'N/A'}</div>
                    <div>Status: {p.availability ? 'Available' : 'Unavailable'}</div>
                  </>
                ) : (
                  <div>Healthcare/NGO location</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DonorMap;

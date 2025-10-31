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

const DonorMap = ({ donors, center = [20, 0], zoom = 2 }) => {
  const positions = donors
    .filter(d => d.coordinates && typeof d.coordinates.lat === 'number')
    .map(d => ({ id: d.id, name: d.name, bloodGroup: d.bloodGroup, lat: d.coordinates.lat, lng: d.coordinates.lng, availability: d.availability }));

  return (
    <div className="h-96 w-full rounded overflow-hidden">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {positions.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.name || 'Donor'}</div>
                <div>Blood: {p.bloodGroup || 'N/A'}</div>
                <div>Status: {p.availability ? 'Available' : 'Unavailable'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DonorMap;

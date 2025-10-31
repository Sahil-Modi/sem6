import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DonorMap from './DonorMap';

const DonorDirectory = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'donor'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDonors(data);
      } catch (err) {
        console.error('Error fetching donors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Donor Directory</h2>

      {loading ? (
        <div>Loading donors...</div>
      ) : donors.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">No donors available.</div>
      ) : (
        <>
          <div className="bg-white p-4 rounded shadow">
            <DonorMap donors={donors} center={[20, 0]} zoom={2} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {donors.map(d => (
              <div key={d.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold">{d.name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-600">Blood Group: {d.bloodGroup || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Location: {d.location || 'N/A'}</p>
                    {d.coordinates && d.coordinates.lat && (
                      <p className="text-xs text-gray-400">Coords: {d.coordinates.lat.toFixed(4)}, {d.coordinates.lng.toFixed(4)}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${d.availability ? 'text-green-600' : 'text-gray-400'}`}>{d.availability ? 'Available' : 'Unavailable'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DonorDirectory;

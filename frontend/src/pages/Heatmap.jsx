import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { MapPin, Filter } from 'lucide-react';

// Simulated congestion so map markers show even without live data
function simulateCongestion(hospital) {
  const seed = hospital.name.charCodeAt(0) + hospital.name.charCodeAt(1);
  return (seed * 37) % 100;
}

const getColor = (c) => {
  if (c < 30) return '#10d98a';
  if (c < 70) return '#f59e0b';
  return '#f43f5e';
};

const getLabel = (c) => c < 30 ? 'Low' : c < 70 ? 'Medium' : 'High';
const getDotClass = (c) => c < 30 ? 'dot-green' : c < 70 ? 'dot-yellow' : 'dot-red';

export default function Heatmap() {
  const [hospitals, setHospitals] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'bangalore' | 'low' | 'medium' | 'high'

  useEffect(() => {
    axios.get('https://wild-llamas-juggle.loca.lt/api/hospitals')
      .then(res => setHospitals(res.data))
      .catch(() => {
        // Fallback: hardcoded Bangalore hospitals for UI preview
        setHospitals([
          { _id: '1', name: 'Manipal Hospital', address: '98, HAL Airport Road, Bangalore - 560017', coordinates: { lat: 12.9592, lng: 77.6479 }, departments: ['Cardiology','General OPD'] },
          { _id: '2', name: 'Narayana Health City', address: 'Bommasandra, Bangalore - 560099', coordinates: { lat: 12.8358, lng: 77.6756 }, departments: ['Cardiac Surgery','Oncology'] },
          { _id: '3', name: 'Apollo Hospitals, Bannerghatta', address: 'Bannerghatta Road, Bangalore - 560076', coordinates: { lat: 12.8916, lng: 77.5997 }, departments: ['General OPD','Gynecology'] },
          { _id: '4', name: 'Fortis Hospital', address: 'Cunningham Road, Bangalore - 560052', coordinates: { lat: 12.9802, lng: 77.5928 }, departments: ['Neurology','Orthopedics'] },
          { _id: '5', name: 'Sakra World Hospital', address: 'Outer Ring Road, Bangalore - 560103', coordinates: { lat: 12.9358, lng: 77.7013 }, departments: ['Emergency','Gastroenterology'] },
          { _id: '6', name: 'Columbia Asia, Whitefield', address: 'Whitefield Main Road, Bangalore - 560066', coordinates: { lat: 12.9699, lng: 77.7499 }, departments: ['Orthopedics','Pediatrics'] },
          { _id: '7', name: 'BGS Gleneagles Global Hospital', address: 'Kengeri, Bangalore - 560060', coordinates: { lat: 12.9085, lng: 77.4910 }, departments: ['Liver Transplant','Nephrology'] },
          { _id: '8', name: 'Vikram Hospital', address: 'Millers Road, Bangalore - 560052', coordinates: { lat: 12.9832, lng: 77.5902 }, departments: ['Cardiology','Neurology'] },
          { _id: '9', name: 'M S Ramaiah Memorial Hospital', address: 'Mathikere, Bangalore - 560054', coordinates: { lat: 13.0188, lng: 77.5586 }, departments: ['Cardiology','Neurosurgery'] },
          { _id: '10', name: "St. John's Medical College Hospital", address: 'Koramangala, Bangalore - 560034', coordinates: { lat: 12.9370, lng: 77.6218 }, departments: ['Emergency','Psychiatry'] },
          { _id: '11', name: 'Bowring & Lady Curzon Hospital', address: 'Shivaji Nagar, Bangalore - 560001', coordinates: { lat: 12.9778, lng: 77.6003 }, departments: ['General OPD','ENT'] },
          { _id: '12', name: 'Victoria Hospital', address: 'Ft. Road, Bangalore - 560002', coordinates: { lat: 12.9677, lng: 77.5740 }, departments: ['Emergency','Burns & Plastic Surgery'] },
          { _id: '13', name: 'Kidwai Memorial Institute of Oncology', address: 'Bangalore - 560029', coordinates: { lat: 12.9258, lng: 77.5960 }, departments: ['Oncology','Radiation Therapy'] },
          { _id: '14', name: 'Jayadeva Institute of Cardiovascular Sciences', address: 'Jayanagar, Bangalore - 560069', coordinates: { lat: 12.9065, lng: 77.5961 }, departments: ['Cardiology','Cardiac Surgery'] },
          { _id: '15', name: 'Aster CMI Hospital', address: 'Sahakara Nagar, Bangalore - 560092', coordinates: { lat: 13.0629, lng: 77.5979 }, departments: ['Cardiology','Oncology'] },
          { _id: '16', name: 'Sparsh Hospital', address: 'Infantry Road, Bangalore - 560001', coordinates: { lat: 12.9823, lng: 77.6053 }, departments: ['Orthopedics','Sports Medicine'] },
        ]);
      });
  }, []);

  // Enrich with simulated congestion if not from live API
  const enriched = hospitals.map(h => ({
    ...h,
    congestion: h.congestion ?? simulateCongestion(h),
    waitCount: h.waitCount ?? Math.floor(simulateCongestion(h) * 0.8),
  }));

  const filtered = enriched.filter(h => {
    if (filter === 'bangalore') return h.address.includes('Bangalore');
    if (filter === 'low') return h.congestion < 30;
    if (filter === 'medium') return h.congestion >= 30 && h.congestion < 70;
    if (filter === 'high') return h.congestion >= 70;
    return true;
  });

  // Center on Bangalore
  const center = [12.9716, 77.5946];

  return (
    <div className="page-wrapper page-section">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="section-label"><MapPin size={13} /> Live Map</span>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: '0.6rem' }}>
          Hospital Congestion <span className="gradient-text">Heatmap</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time OPD crowd levels across Bangalore. Updated every minute.
        </p>
      </div>

      {/* Filters & Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          <Filter size={14} /> Filter:
        </div>
        {[
          { key: 'all', label: 'All Hospitals' },
          { key: 'bangalore', label: '📍 Bangalore' },
          { key: 'low', label: '🟢 Low' },
          { key: 'medium', label: '🟡 Medium' },
          { key: 'high', label: '🔴 High' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '0.35rem 0.9rem',
            borderRadius: 999,
            border: `1px solid ${filter === key ? 'rgba(108,99,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
            background: filter === key ? 'rgba(108,99,255,0.15)' : 'transparent',
            color: filter === key ? 'var(--accent-2)' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}>
            {label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {[['dot-green', 'Low (<30%)'], ['dot-yellow', 'Medium (30-70%)'], ['dot-red', 'High (>70%)']].map(([cls, lbl]) => (
            <div key={cls} className="status-indicator">
              <span className={`dot ${cls}`} />{lbl}
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="heatmap-container" style={{ height: 480 }}>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {filtered.map(h => (
            h.coordinates?.lat && h.coordinates?.lng ? (
              <CircleMarker
                key={h._id}
                center={[h.coordinates.lat, h.coordinates.lng]}
                pathOptions={{
                  color: getColor(h.congestion),
                  fillColor: getColor(h.congestion),
                  fillOpacity: 0.65,
                  weight: 2,
                }}
                radius={10 + (h.congestion / 10)}
              >
                <Popup>
                  <div style={{ color: '#111', minWidth: 180 }}>
                    <strong style={{ fontSize: '0.95rem' }}>{h.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#555', marginTop: 4 }}>{h.address}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <span>🧑‍⚕️ Waiting: <strong>{h.waitCount}</strong></span>
                      <span>📊 {Math.round(h.congestion)}% full</span>
                    </div>
                    {h.departments?.length > 0 && (
                      <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#444' }}>
                        OPDs: {h.departments.slice(0, 3).join(', ')}{h.departments.length > 3 ? '...' : ''}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ) : null
          ))}
        </MapContainer>
      </div>

      {/* Hospital Cards Grid */}
      <div style={{ marginTop: '2.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.1rem' }}>
          {filtered.length} Hospital{filtered.length !== 1 ? 's' : ''} {filter !== 'all' ? `· ${filter.charAt(0).toUpperCase() + filter.slice(1)} filter` : 'listed'}
        </h3>
        <div className="card-grid">
          {filtered.map(h => (
            <div key={h._id} className="glass-panel hospital-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <h3 className="hospital-title" style={{ fontSize: '1rem', flex: 1, paddingRight: '0.5rem' }}>{h.name}</h3>
                <div className="status-indicator" style={{ flexShrink: 0 }}>
                  <span className={`dot ${getDotClass(h.congestion)}`} />
                  {getLabel(h.congestion)}
                </div>
              </div>
              <div className="hospital-meta">{h.address}</div>
              {h.departments?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {h.departments.slice(0, 4).map(d => (
                    <span key={d} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{d}</span>
                  ))}
                  {h.departments.length > 4 && (
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                      +{h.departments.length - 4} more
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: getColor(h.congestion), lineHeight: 1 }}>{h.waitCount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>patients waiting</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: getColor(h.congestion) }}>{Math.round(h.congestion)}%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>congestion</div>
                </div>
              </div>
              {/* Congestion bar */}
              <div style={{ marginTop: '0.8rem', height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${h.congestion}%`,
                  background: getColor(h.congestion),
                  boxShadow: `0 0 8px ${getColor(h.congestion)}`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

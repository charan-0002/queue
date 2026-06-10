import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons if needed, but we'll use custom div icons
function MapUpdater({ selectedId, hospitals }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId && hospitals) {
      const selected = hospitals.find(h => h.id === selectedId);
      if (selected.coordinates) {
        map.flyTo([selected.coordinates.lat, selected.coordinates.lng], 13, { duration: 1.5 });
      }
    } else if (hospitals.length > 0 && !selectedId) {
      // Fit all markers
      const group = L.featureGroup(
        hospitals.filter(h => h.coordinates).map(h => L.marker([h.coordinates.lat, h.coordinates.lng]))
      );
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [selectedId, hospitals, map]);
  return null;
}

const hospitalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // hospital pin icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const IndiaHeatmap = ({ hospitals, selectedId, onSelect }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div className="w-full h-full bg-bone-muted/40 animate-pulse rounded-sm" />;

  // Default center to roughly the center of India
  const center = [22.9, 78.9];

  return (
    <div className="w-full h-full min-h-[500px] lg:min-h-[640px] bg-white rounded-sm overflow-hidden border border-olive/10 shadow-sm relative z-0">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapUpdater selectedId={selectedId} hospitals={hospitals} />
        
        {hospitals.map((h) => (
          <Marker 
            key={h.id} 
            position={[h.coordinates.lat, h.coordinates.lng]}
            icon={hospitalIcon}
            eventHandlers={{
              click: () => onSelect(h)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px]">
                <p className="font-display font-medium text-[15px] text-olive leading-tight">🏥 {h.name}</p>
                <p className="text-[12px] text-olive/60 mt-0.5">📍 {h.address}</p>
                
                <div className="mt-3 p-2 bg-bone-muted/40 rounded-sm border border-olive/10 text-[11px] font-mono text-olive/80">
                  <div className="flex items-center gap-1.5"><span className="opacity-70">🔑 Login:</span> <strong>{h.loginId}</strong></div>
                  <div className="flex items-center gap-1.5 mt-0.5"><span className="opacity-70">🔒 Pass:</span> <strong>{h.passkey}</strong></div>
                </div>

                <div className="mt-3 pt-2 border-t border-olive/10 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-olive/50 uppercase tracking-wider block">Waiting</span>
                    <span className="font-medium text-olive text-[13px]">{h.stats?.waiting || 0}</span>
                  </div>
                  <div>
                    <span className="text-olive/50 uppercase tracking-wider block">Wait Time</span>
                    <span className="font-medium text-terracotta text-[13px]">{h.stats?.avg_wait_minutes || 0}m avg</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IndiaHeatmap;

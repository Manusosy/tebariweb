import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Hotspot } from '@shared/schema';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HotspotMapProps {
  hotspots: Hotspot[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  readonly?: boolean;
}

const statusColor: Record<string, string> = {
  active: '#f59e0b', // amber-500
  cleared: '#10b981', // emerald-500
  critical: '#ef4444', // red-500
  // Submission statuses
  pending: '#eab308', // yellow-500 (Distinct from amber)
  verified: '#22c55e', // green-500
  rejected: '#ef4444', // red-500
};

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function HotspotMap({
  hotspots,
  center = [-3.350, 40.015], // Default to Watamu/Kilifi area
  zoom = 9,
  className = "h-[400px] w-full rounded-lg overflow-hidden border border-border shadow-sm",
  readonly = false
}: HotspotMapProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[Number(hotspot.latitude), Number(hotspot.longitude)]}
            radius={hotspot.status === 'critical' ? 12 : 10}
            pathOptions={{
              color: statusColor[hotspot.status] || '#3b82f6',
              fillColor: statusColor[hotspot.status] || '#3b82f6',
              fillOpacity: 0.6
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm mb-1">{hotspot.name}</h3>
                <div className="text-xs space-y-1">
                  <p><span className="font-semibold">Status:</span> {hotspot.status}</p>
                  <p><span className="font-semibold">Vol:</span> {hotspot.estimatedVolume}kg</p>
                  <p><span className="font-semibold">Desc:</span> {hotspot.description || "N/A"}</p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

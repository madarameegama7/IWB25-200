import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default markers for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'custom-marker'
  });
};

const startIcon = createCustomIcon('#10b981', '📍');
const endIcon = createCustomIcon('#f59e0b', '🎯');
const busStopIcon = createCustomIcon('#3b82f6', '🚌');

// Component to fit map bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
};

const MapView = ({ currentLocation, destination, route }) => {
  const mapRef = useRef();
  
  // Default center (Colombo, Sri Lanka)
  const defaultCenter = [6.9271, 79.8612];
  const mapCenter = currentLocation ? [currentLocation.latitude, currentLocation.longitude] : defaultCenter;
  
  // Calculate bounds if we have both start and end points
  const bounds = [];
  if (currentLocation) {
    bounds.push([currentLocation.latitude, currentLocation.longitude]);
  }
  if (destination) {
    bounds.push([destination.latitude, destination.longitude]);
  }

  // Route coordinates for drawing path
  const routeCoordinates = route ? [
    [route.start.latitude, route.start.longitude],
    [route.end.latitude, route.end.longitude]
  ] : [];

  // Sample bus stops for demonstration
  const sampleBusStops = [
    { id: 1, name: 'Colombo Fort', lat: 6.9344, lng: 79.8441 },
    { id: 2, name: 'Pettah', lat: 6.9354, lng: 79.8500 },
    { id: 3, name: 'Bambalapitiya', lat: 6.8887, lng: 79.8590 },
    { id: 4, name: 'Nugegoda', lat: 6.8659, lng: 79.8977 },
  ];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={currentLocation ? 13 : 11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fit bounds when we have multiple points */}
        {bounds.length > 1 && <FitBounds bounds={bounds} />}
        
        {/* Current Location Marker */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={startIcon}
          >
            <Popup>
              <div>
                <strong>📍 Your Location</strong>
                <br />
                Current position
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Destination Marker */}
        {destination && (
          <Marker 
            position={[destination.latitude, destination.longitude]}
            icon={endIcon}
          >
            <Popup>
              <div>
                <strong>🎯 Destination</strong>
                <br />
                Your selected destination
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route Line */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#2563eb"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}
        
        {/* Bus Stops */}
        {sampleBusStops.map(stop => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={busStopIcon}
          >
            <Popup>
              <div>
                <strong>🚌 {stop.name}</strong>
                <br />
                Bus Stop
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '200px'
      }}>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
          <strong>Map Legend</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', fontSize: '12px' }}>
          <span style={{ marginRight: '8px' }}>📍</span>
          <span>Your Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', fontSize: '12px' }}>
          <span style={{ marginRight: '8px' }}>🎯</span>
          <span>Destination</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', fontSize: '12px' }}>
          <span style={{ marginRight: '8px' }}>🚌</span>
          <span>Bus Stops</span>
        </div>
        {route && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ marginRight: '8px', color: '#2563eb', fontWeight: 'bold' }}>---</span>
            <span>Suggested Route</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;

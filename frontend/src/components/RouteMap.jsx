import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const RouteMap = ({ currentLocation, destination }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    // Fix for default marker icons in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    console.log('RouteMap - currentLocation:', currentLocation, 'destination:', destination);

    if (!currentLocation || !destination || !mapRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapRef.current).setView([
      (currentLocation.latitude + destination.latitude) / 2,
      (currentLocation.longitude + destination.longitude) / 2
    ], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Create custom icons
    const startIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          background-color: #22c55e; 
          border: 3px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 20px;
        ">📍</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const endIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          width: 40px; 
          height: 40px; 
          background-color: #ef4444; 
          border: 3px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          font-size: 20px;
        ">🎯</div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Add routing control with custom routing service
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(currentLocation.latitude, currentLocation.longitude),
        L.latLng(destination.latitude, destination.longitude)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      createMarker: function(i, waypoint) {
        return L.marker(waypoint.latLng, {
          icon: i === 0 ? startIcon : endIcon,
          draggable: false
        }).bindPopup(
          i === 0 
            ? `<div style="padding: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #22c55e;">📍 Current Location</h4>
                <p style="margin: 0; font-size: 12px;">Lat: ${currentLocation.latitude.toFixed(6)}</p>
                <p style="margin: 0; font-size: 12px;">Lng: ${currentLocation.longitude.toFixed(6)}</p>
              </div>`
            : `<div style="padding: 8px;">
                <h4 style="margin: 0 0 8px 0; color: #ef4444;">🎯 ${destination.name}</h4>
                <p style="margin: 0; font-size: 12px;">Lat: ${destination.latitude.toFixed(6)}</p>
                <p style="margin: 0; font-size: 12px;">Lng: ${destination.longitude.toFixed(6)}</p>
              </div>`
        );
      },
      lineOptions: {
        styles: [{
          color: '#2563eb',
          weight: 4,
          opacity: 0.8
        }]
      },
      show: false, // Hide the routing instructions panel
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Hide the routing instructions panel by removing it from DOM
    const routingContainer = map.getContainer().querySelector('.leaflet-routing-container');
    if (routingContainer) {
      routingContainer.style.display = 'none';
    }

    // Add resize handler for better responsiveness
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (routingControlRef.current) {
        routingControlRef.current = null;
      }
    };
  }, [currentLocation, destination]);

  // Calculate distance for display
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (!currentLocation || !destination) {
    return null;
  }

  const distance = calculateDistance(
    currentLocation.latitude, currentLocation.longitude,
    destination.latitude, destination.longitude
  ).toFixed(2);

  return (
    <div className="route-map-container">
      <div className="route-info-header">
        <h3>🗺️ Your Route</h3>
        <div className="route-stats">
          <span className="distance-badge">📏 {distance} km</span>
          <span className="transport-badge">🚌 Public Transport</span>
        </div>
      </div>
      <div 
        ref={mapRef} 
        className="openstreetmap-container"
      />
      <div className="route-details">
        <div className="route-point start-point">
          <div className="point-icon">📍</div>
          <div className="point-info">
            <span className="point-label">From</span>
            <span className="point-coords">
              {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point end-point">
          <div className="point-icon">🎯</div>
          <div className="point-info">
            <span className="point-label">To</span>
            <span className="point-name">{destination.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;

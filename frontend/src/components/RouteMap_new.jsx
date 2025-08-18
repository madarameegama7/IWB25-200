import React, { useEffect, useRef } from 'react';

const RouteMap = ({ currentLocation, destination }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  
  // Google Maps API key (replace with your actual key)
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        initializeMap();
      };
      
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
        delete window.initMap;
      };
    } else {
      initializeMap();
    }

    return () => {
      // Cleanup
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
      }
    };
  }, [currentLocation, destination, GOOGLE_MAPS_API_KEY]);

  const initializeMap = () => {
    if (!currentLocation || !destination || !mapRef.current) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      center: {
        lat: (currentLocation.latitude + destination.latitude) / 2,
        lng: (currentLocation.longitude + destination.longitude) / 2
      },
      zoom: 12,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'all',
          elementType: 'geometry.fill',
          stylers: [{ weight: '2.00' }]
        },
        {
          featureType: 'all',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#9c9c9c' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Initialize directions service and renderer
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      draggable: false,
      polylineOptions: {
        strokeColor: '#2563eb',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRendererRef.current.setMap(map);

    // Add custom markers
    const startMarker = new window.google.maps.Marker({
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      map: map,
      title: 'Current Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#22c55e" stroke="#ffffff" stroke-width="3"/>
            <text x="20" y="28" text-anchor="middle" font-size="20" fill="white">📍</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    const endMarker = new window.google.maps.Marker({
      position: { lat: destination.latitude, lng: destination.longitude },
      map: map,
      title: destination.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
            <text x="20" y="28" text-anchor="middle" font-size="20" fill="white">🎯</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Add info windows
    const startInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #22c55e;">📍 Current Location</h4>
          <p style="margin: 0; font-size: 12px;">Lat: ${currentLocation.latitude.toFixed(6)}</p>
          <p style="margin: 0; font-size: 12px;">Lng: ${currentLocation.longitude.toFixed(6)}</p>
        </div>
      `
    });

    const endInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #ef4444;">🎯 ${destination.name}</h4>
          <p style="margin: 0; font-size: 12px;">Lat: ${destination.latitude.toFixed(6)}</p>
          <p style="margin: 0; font-size: 12px;">Lng: ${destination.longitude.toFixed(6)}</p>
        </div>
      `
    });

    startMarker.addListener('click', () => {
      endInfoWindow.close();
      startInfoWindow.open(map, startMarker);
    });

    endMarker.addListener('click', () => {
      startInfoWindow.close();
      endInfoWindow.open(map, endMarker);
    });

    // Calculate and display route
    calculateRoute();
  };

  const calculateRoute = () => {
    if (!directionsServiceRef.current || !directionsRendererRef.current) return;

    const request = {
      origin: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      destination: { lat: destination.latitude, lng: destination.longitude },
      travelMode: window.google.maps.TravelMode.TRANSIT,
      transitOptions: {
        modes: [window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.RAIL],
        routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
      },
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
      } else {
        // Fallback to driving directions if transit not available
        const fallbackRequest = {
          ...request,
          travelMode: window.google.maps.TravelMode.DRIVING
        };
        
        directionsServiceRef.current.route(fallbackRequest, (fallbackResult, fallbackStatus) => {
          if (fallbackStatus === 'OK') {
            directionsRendererRef.current.setDirections(fallbackResult);
          } else {
            console.error('Directions request failed:', fallbackStatus);
          }
        });
      }
    });
  };

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
        className="google-maps-container"
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}
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

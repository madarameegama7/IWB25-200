import React, { useState, useEffect, useCallback } from 'react';

const LocationTracker = ({ currentLocation, onLocationUpdate, getNearbyStops }) => {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [manualLocation, setManualLocation] = useState('');
  const [showNearbyStops, setShowNearbyStops] = useState(false);

  const loadNearbyStops = useCallback(async () => {
    const stops = await getNearbyStops();
    setNearbyStops(stops);
  }, [getNearbyStops]);

  useEffect(() => {
    if (currentLocation && showNearbyStops) {
      loadNearbyStops();
    }
  }, [currentLocation, showNearbyStops, loadNearbyStops]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationUpdate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Unable to get your location. Using default location (Colombo Fort).');
          onLocationUpdate({
            latitude: 6.9344,
            longitude: 79.8441
          });
        }
      );
    }
  };

  const sriLankanLocations = [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.8441 },
    { name: 'Pettah', lat: 6.9354, lng: 79.8500 },
    { name: 'Bambalapitiya', lat: 6.8887, lng: 79.8590 },
    { name: 'Nugegoda', lat: 6.8659, lng: 79.8977 },
    { name: 'Maharagama', lat: 6.8477, lng: 79.9267 },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337 },
    { name: 'Galle', lat: 6.0329, lng: 80.217 }
  ];

  const handleLocationSelect = (location) => {
    onLocationUpdate({
      latitude: location.lat,
      longitude: location.lng
    });
    setManualLocation(location.name);
  };

  return (
    <div className="location-tracker">
      <div className="location-header">
        <h3>📍 Your Location</h3>
      </div>

      <div className="location-content">
        {currentLocation ? (
          <div className="current-location">
            <div className="location-info">
              <span className="location-indicator">🎯</span>
              <div>
                <p className="location-text">
                  {manualLocation || `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}`}
                </p>
                <p className="location-subtext">Current location detected</p>
              </div>
            </div>
            
            <div className="location-actions">
              <button onClick={handleGetLocation} className="btn-secondary">
                🔄 Refresh GPS
              </button>
              <button 
                onClick={() => setShowNearbyStops(!showNearbyStops)}
                className="btn-primary"
              >
                {showNearbyStops ? 'Hide' : 'Show'} Nearby Stops
              </button>
            </div>
          </div>
        ) : (
          <div className="location-prompt">
            <p>📍 We need your location to find nearby transport options</p>
            <button onClick={handleGetLocation} className="btn-primary">
              📱 Get My Location
            </button>
          </div>
        )}

        {/* Manual Location Selection */}
        <div className="manual-location">
          <h4>Or select a location:</h4>
          <div className="location-grid">
            {sriLankanLocations.map((location) => (
              <button
                key={location.name}
                onClick={() => handleLocationSelect(location)}
                className={`location-option ${manualLocation === location.name ? 'selected' : ''}`}
              >
                {location.name}
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Stops */}
        {showNearbyStops && nearbyStops.length > 0 && (
          <div className="nearby-stops">
            <h4>🚏 Nearby Stops ({nearbyStops.length})</h4>
            <div className="stops-list">
              {nearbyStops.slice(0, 5).map((stop) => (
                <div key={stop.id} className="stop-item">
                  <div className="stop-info">
                    <span className={`stop-type ${stop.stopType}`}>
                      {stop.stopType === 'bus' ? '🚌' : '🚂'}
                    </span>
                    <div>
                      <p className="stop-name">{stop.name}</p>
                      <p className="stop-distance">{Math.round(stop.distance)}m away</p>
                    </div>
                  </div>
                  <div className="stop-routes">
                    {stop.routes.slice(0, 3).map((route, idx) => (
                      <span key={idx} className="route-badge">{route}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationTracker;

import React, { useState, useEffect, useCallback, useRef } from 'react';

const LocationTracker = ({ currentLocation, onLocationUpdate, getNearbyStops }) => {
  const [nearbyStops, setNearbyStops] = useState([]);
  const [manualLocation, setManualLocation] = useState('');
  const [showNearbyStops, setShowNearbyStops] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [currentLocationName, setCurrentLocationName] = useState('Getting location name...');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Function to get location name from coordinates using reverse geocoding
  const getLocationName = async (lat, lng) => {
    try {
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&limit=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'UniConnect-Sri-Lanka-Transport/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const address = data.address;
          // Priority order for Sri Lankan locations
          return address.suburb || 
                 address.neighbourhood || 
                 address.city_district ||
                 address.city || 
                 address.town || 
                 address.village || 
                 address.municipality ||
                 address.county ||
                 data.display_name?.split(',')[0] || 
                 'Current Location';
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    // Fallback based on approximate coordinates for common Sri Lankan locations
    if (lat >= 6.9 && lat <= 7.0 && lng >= 79.8 && lng <= 79.9) {
      return 'Colombo Area';
    }
    if (lat >= 6.0 && lat <= 6.1 && lng >= 80.2 && lng <= 80.3) {
      return 'Galle Area';
    }
    if (lat >= 7.2 && lat <= 7.3 && lng >= 80.6 && lng <= 80.7) {
      return 'Kandy Area';
    }
    
    return 'Current Location';
  };

  // Function to search locations using Nominatim API
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Sri Lanka')}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UniConnect-Sri-Lanka-Transport/1.0',
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const suggestions = data.map(item => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type,
          address: item.address
        }));
        setLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
    }
    setSearchLoading(false);
  };

  // Handle location search input
  const handleLocationSearch = (value) => {
    setLocationSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      setShowSuggestions(true);
      // Debounce search with 500ms delay
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(value);
      }, 500);
    } else {
      setShowSuggestions(false);
      setLocationSuggestions([]);
      setSearchLoading(false);
    }
  };

  // Handle selecting a location from suggestions
  const handleSuggestionSelect = (suggestion) => {
    const newLocation = {
      latitude: suggestion.lat,
      longitude: suggestion.lng
    };
    onLocationUpdate(newLocation);
    setManualLocation(suggestion.display_name.split(',')[0]);
    setCurrentLocationName(suggestion.display_name.split(',')[0]);
    setUseCurrentLocation(false);
    setLocationSearchQuery(suggestion.display_name.split(',')[0]);
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          onLocationUpdate(newLocation);
          
          // Get location name
          const locationName = await getLocationName(position.coords.latitude, position.coords.longitude);
          setCurrentLocationName(locationName);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          alert('Unable to get your location. Using default location (Colombo Fort).');
          const defaultLocation = {
            latitude: 6.9344,
            longitude: 79.8441
          };
          onLocationUpdate(defaultLocation);
          setCurrentLocationName('Colombo Fort');
        }
      );
    }
  };

  // Initialize location name on component mount
  useEffect(() => {
    if (currentLocation) {
      if (useCurrentLocation) {
        setCurrentLocationName('Getting location name...');
        getLocationName(currentLocation.latitude, currentLocation.longitude)
          .then(name => setCurrentLocationName(name));
      } else if (manualLocation) {
        setCurrentLocationName(manualLocation);
      }
    }
  }, [currentLocation, useCurrentLocation, manualLocation]);

  // Update location name when currentLocation changes
  useEffect(() => {
    if (currentLocation && useCurrentLocation) {
      setCurrentLocationName('Getting location name...');
      getLocationName(currentLocation.latitude, currentLocation.longitude)
        .then(name => setCurrentLocationName(name));
    }
  }, [currentLocation, useCurrentLocation]);

  return (
    <div className="location-tracker">
      <div className="location-header">
        <h3>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
            alt="location"
            style={{
              width: '16px',
              height: '16px',
              marginRight: '8px',
              verticalAlign: 'middle'
            }}
          />
          Your Location
        </h3>
      </div>

      <div className="location-content">
        {currentLocation ? (
          <div className="current-location">
            <div className="location-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={(e) => {
                    setUseCurrentLocation(e.target.checked);
                    if (e.target.checked) {
                      handleGetLocation();
                    }
                  }}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Use my current location</span>
              </label>
            </div>

            <div className="location-info">
              <span className="location-indicator">🎯</span>
              <div>
                <p className="location-text">
                  {useCurrentLocation 
                    ? (currentLocationName || 'Getting location name...')
                    : (manualLocation || 'Select a location below')
                  }
                </p>
              </div>
            </div>
            
            {useCurrentLocation && (
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
            )}
          </div>
        ) : (
          <div className="location-prompt">
            <p>
              <img 
                src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                alt="location"
                style={{
                  width: '16px',
                  height: '16px',
                  marginRight: '8px',
                  verticalAlign: 'middle'
                }}
              />
              We need your location to find nearby transport options
            </p>
            <button onClick={handleGetLocation} className="btn-primary">
              📱 Get My Location
            </button>
          </div>
        )}

        {/* Manual Location Search */}
        <div className={`manual-location ${useCurrentLocation ? 'disabled' : ''}`}>
          <h4>Or search for a location:</h4>
          <div className="location-search-container" ref={searchContainerRef}>
            <div className="search-input-wrapper">
              <input
                type="text"
                className="location-search-input"
                placeholder="Search for city, street, or address..."
                value={locationSearchQuery}
                onChange={(e) => handleLocationSearch(e.target.value)}
                disabled={useCurrentLocation}
                onFocus={() => locationSearchQuery.length >= 3 && setShowSuggestions(true)}
              />
              {searchLoading && (
                <div className="search-loading">🔄</div>
              )}
            </div>
            
            {showSuggestions && locationSuggestions.length > 0 && !useCurrentLocation && (
              <div className="location-suggestions">
                {locationSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="location-suggestion"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="suggestion-main">
                      {suggestion.display_name.split(',')[0]}
                    </div>
                    <div className="suggestion-details">
                      {suggestion.display_name.split(',').slice(1, 3).join(',')}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      <img 
                        src={stop.stopType === 'bus' 
                          ? 'https://cdn-icons-png.flaticon.com/512/3039/3039008.png' 
                          : 'https://cdn-icons-png.flaticon.com/512/2972/2972402.png'
                        }
                        alt={stop.stopType}
                        style={{
                          width: '16px',
                          height: '16px',
                          marginRight: '8px'
                        }}
                      />
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

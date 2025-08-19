import React, { useState, useEffect, useRef } from 'react';

const DestinationSearch = ({ destination, onDestinationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState([]);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Popular destinations in Sri Lanka
  const popularDestinations = [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.8441, type: 'landmark' },
    { name: 'Pettah Market', lat: 6.9354, lng: 79.8500, type: 'market' },
    { name: 'Bambalapitiya Junction', lat: 6.8887, lng: 79.8590, type: 'junction' },
    { name: 'Nugegoda Town', lat: 6.8659, lng: 79.8977, type: 'town' },
    { name: 'Homagama', lat: 6.8439, lng: 80.0021, type: 'town' },
    { name: 'University of Colombo', lat: 6.9022, lng: 79.8607, type: 'university' },
    { name: 'Bandaranaike Memorial International Conference Hall', lat: 6.9147, lng: 79.8731, type: 'conference' },
    { name: 'Kandy City Center', lat: 7.2906, lng: 80.6337, type: 'city' },
    { name: 'Galle Fort', lat: 6.0329, lng: 80.217, type: 'fort' },
    { name: 'Mount Lavinia Beach', lat: 6.8383, lng: 79.8656, type: 'beach' },
    { name: 'Independence Square', lat: 6.9034, lng: 79.8682, type: 'landmark' },
    { name: 'Viharamahadevi Park', lat: 6.9147, lng: 79.8612, type: 'park' },
    { name: 'Keells Super - Wellawatte', lat: 6.8697, lng: 79.8618, type: 'shopping' }
  ];

  const recentDestinations = JSON.parse(localStorage.getItem('recentDestinations') || '[]');

  // Function to search locations using Nominatim API
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setApiSuggestions([]);
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
        console.log('API search results for query:', query, data);
        
        const locationSuggestions = data.map(item => ({
          name: item.display_name.split(',')[0],
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: 'searched',
          isFromAPI: true
        }));
        
        console.log('Processed location suggestions:', locationSuggestions);
        setApiSuggestions(locationSuggestions);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setApiSuggestions([]);
    }
    setSearchLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.length > 0) {
      // Filter popular destinations locally
      const filtered = popularDestinations.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      
      // Search via API if query is long enough
      if (query.length >= 3) {
        // Debounce search with 500ms delay
        searchTimeoutRef.current = setTimeout(() => {
          searchLocations(query);
        }, 500);
      } else {
        setApiSuggestions([]);
        setSearchLoading(false);
      }
      
      setShowSuggestions(true);
    } else {
      // Show all destinations when search is empty but input is focused
      setSuggestions(popularDestinations);
      setApiSuggestions([]);
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      const filtered = popularDestinations.filter(dest =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSuggestions(filtered);
      
      // Trigger API search if query is long enough
      if (searchQuery.length >= 3) {
        searchLocations(searchQuery);
      }
    } else {
      // Show popular destinations as suggestions when focused with empty search
      setSuggestions(popularDestinations);
      setApiSuggestions([]);
    }
    setShowSuggestions(true);
  };

  const handleDestinationSelect = (dest) => {
    setSearchQuery(dest.name);
    setShowSuggestions(false);
    
    // Ensure coordinates are properly formatted and valid
    let coordinates;
    if (dest.lat !== undefined && dest.lng !== undefined) {
      coordinates = {
        latitude: parseFloat(dest.lat),
        longitude: parseFloat(dest.lng)
      };
    } else {
      console.error('Invalid coordinates for destination:', dest);
      return;
    }
    
    // Validate coordinates are numbers
    if (isNaN(coordinates.latitude) || isNaN(coordinates.longitude)) {
      console.error('Invalid coordinate values:', coordinates);
      return;
    }
    
    console.log('DestinationSearch - Selected:', dest.name, 'Coordinates:', coordinates);
    
    // Save to recent destinations
    const recent = JSON.parse(localStorage.getItem('recentDestinations') || '[]');
    const updated = [dest, ...recent.filter(r => r.name !== dest.name)].slice(0, 5);
    localStorage.setItem('recentDestinations', JSON.stringify(updated));
    
    onDestinationSelect(dest.name, coordinates);
  };

  const getTypeIcon = (type) => {
    const icons = {
      landmark: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
      market: 'https://cdn-icons-png.flaticon.com/512/3514/3514242.png',
      junction: 'https://cdn-icons-png.flaticon.com/512/2972/2972570.png',
      town: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
      university: 'https://cdn-icons-png.flaticon.com/512/3595/3595030.png',
      conference: 'https://cdn-icons-png.flaticon.com/512/235/235861.png',
      city: 'https://cdn-icons-png.flaticon.com/512/235/235861.png',
      fort: 'https://cdn-icons-png.flaticon.com/512/2776/2776067.png',
      beach: 'https://cdn-icons-png.flaticon.com/512/2972/2972351.png',
      park: 'https://cdn-icons-png.flaticon.com/512/2972/2972464.png',
      shopping: 'https://cdn-icons-png.flaticon.com/512/3514/3514242.png'
    };
    return icons[type] || 'https://cdn-icons-png.flaticon.com/512/684/684908.png';
  };

  return (
    <div className="destination-search">
      <div className="search-header">
        <h3>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png" 
            alt="destination"
            style={{
              width: '16px',
              height: '16px',
              marginRight: '8px',
              verticalAlign: 'middle'
            }}
          />
          Where to?
        </h3>
      </div>

      <div className="search-content">
        {/* Search Input */}
        <div className="search-input-container" ref={searchRef}>
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Type any location, street, or landmark..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={handleInputFocus}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions(popularDestinations);
                  setApiSuggestions([]);
                  setShowSuggestions(true);
                }}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (suggestions.length > 0 || apiSuggestions.length > 0) && (
            <div className="suggestions-dropdown">
              {/* API Search Results */}
              {apiSuggestions.length > 0 && (
                <>
                  <div className="suggestions-header">
                    <span>🔍 Search Results</span>
                    {searchLoading && <span className="loading-indicator">🔄</span>}
                  </div>
                  <div className="suggestions-list">
                    {apiSuggestions.map((suggestion, index) => (
                      <button
                        key={`api-${index}`}
                        onClick={() => handleDestinationSelect(suggestion)}
                        className="suggestion-item api-suggestion"
                      >
                        <span className="suggestion-icon">
                          <img 
                            src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                            alt="location"
                            style={{
                              width: '16px',
                              height: '16px'
                            }}
                          />
                        </span>
                        <div className="suggestion-info">
                          <p className="suggestion-name">{suggestion.name}</p>
                          <p className="suggestion-details">
                            {suggestion.display_name.split(',').slice(1, 3).join(',')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              
              {/* Popular Destinations */}
              {suggestions.length > 0 && (
                <>
                  {apiSuggestions.length > 0 && <div className="suggestions-divider"></div>}
                  <div className="suggestions-list">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.name}
                        onClick={() => handleDestinationSelect(suggestion)}
                        className="suggestion-item"
                      >
                        <span className="suggestion-icon">
                          <img 
                            src={getTypeIcon(suggestion.type)} 
                            alt={suggestion.type}
                            style={{
                              width: '16px',
                              height: '16px'
                            }}
                          />
                        </span>
                        <div className="suggestion-info">
                          <p className="suggestion-name">{suggestion.name}</p>
                          <p className="suggestion-type">{suggestion.type}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Selection - Only show when not searching */}
        {!showSuggestions && searchQuery.length === 0 && (
          <>
            {/* Recent Destinations */}
            {recentDestinations.length > 0 && (
              <div className="recent-destinations">
                <h4>Recent</h4>
                <div className="destinations-grid">
                  {recentDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => handleDestinationSelect(dest)}
                      className="destination-chip"
                    >
                      <span>{dest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Popular Destinations - Only show a few */}
            <div className="popular-destinations">
              <h4>Quick Select</h4>
              <div className="destinations-grid">
                {popularDestinations.slice(0, 6).map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => handleDestinationSelect(dest)}
                    className="destination-chip"
                  >
                    <span>{dest.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Current Selection */}
        {destination && (
          <div className="selected-destination">
            <div className="destination-display">
              <span className="destination-icon">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                  alt="destination"
                  style={{
                    width: '16px',
                    height: '16px'
                  }}
                />
              </span>
              <div>
                <p className="destination-name">{destination}</p>
                <p className="destination-subtitle">Selected destination</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationSearch;

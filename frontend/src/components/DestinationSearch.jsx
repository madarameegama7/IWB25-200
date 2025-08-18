import React, { useState } from 'react';

const DestinationSearch = ({ destination, onDestinationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular destinations in Sri Lanka
  const popularDestinations = [
    { name: 'Colombo Fort', lat: 6.9344, lng: 79.8441, type: 'landmark' },
    { name: 'Pettah Market', lat: 6.9354, lng: 79.8500, type: 'market' },
    { name: 'Bambalapitiya Junction', lat: 6.8887, lng: 79.8590, type: 'junction' },
    { name: 'Nugegoda Town', lat: 6.8659, lng: 79.8977, type: 'town' },
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.length > 2) {
      const filtered = popularDestinations.filter(dest =>
        dest.name.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleDestinationSelect = (dest) => {
    setSearchQuery(dest.name);
    setShowSuggestions(false);
    
    // Save to recent destinations
    const recent = JSON.parse(localStorage.getItem('recentDestinations') || '[]');
    const updated = [dest, ...recent.filter(r => r.name !== dest.name)].slice(0, 5);
    localStorage.setItem('recentDestinations', JSON.stringify(updated));
    
    onDestinationSelect(dest.name, { latitude: dest.lat, longitude: dest.lng });
  };

  const getTypeIcon = (type) => {
    const icons = {
      landmark: '🏛️',
      market: '🏪',
      junction: '🚦',
      town: '🏘️',
      university: '🎓',
      conference: '🏢',
      city: '🏙️',
      fort: '🏰',
      beach: '🏖️',
      park: '🌳',
      shopping: '🛒'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="destination-search">
      <div className="search-header">
        <h3>🎯 Where to?</h3>
      </div>

      <div className="search-content">
        {/* Search Input */}
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search destinations, landmarks, stations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                }}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.name}
                  onClick={() => handleDestinationSelect(suggestion)}
                  className="suggestion-item"
                >
                  <span className="suggestion-icon">
                    {getTypeIcon(suggestion.type)}
                  </span>
                  <div className="suggestion-info">
                    <p className="suggestion-name">{suggestion.name}</p>
                    <p className="suggestion-type">{suggestion.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Selection */}
        {!showSuggestions && (
          <>
            {/* Recent Destinations */}
            {recentDestinations.length > 0 && (
              <div className="recent-destinations">
                <h4>🕒 Recent</h4>
                <div className="destinations-grid">
                  {recentDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      onClick={() => handleDestinationSelect(dest)}
                      className="destination-chip"
                    >
                      <span>{getTypeIcon(dest.type)}</span>
                      <span>{dest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Destinations */}
            <div className="popular-destinations">
              <h4>🔥 Popular Destinations</h4>
              <div className="destinations-grid">
                {popularDestinations.slice(0, 8).map((dest) => (
                  <button
                    key={dest.name}
                    onClick={() => handleDestinationSelect(dest)}
                    className="destination-chip"
                  >
                    <span>{getTypeIcon(dest.type)}</span>
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
              <span className="destination-icon">📍</span>
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

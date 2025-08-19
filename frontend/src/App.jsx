import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import components
import LocationTracker from './components/LocationTracker';
import DestinationSearch from './components/DestinationSearch';
import TransportOptions from './components/TransportOptions';
import TripPlanner from './components/TripPlanner';
import NotificationPanel from './components/NotificationPanel';
import RouteMap from './components/RouteMap';
import Schedules from "./components/Schedules";
import Predictions from "./components/Predictions";
import Alerts from "./components/Alerts";

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showTravelPlatform, setShowTravelPlatform] = useState(true);

  const API_BASE_URL = 'http://localhost:8083';

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set Colombo Fort as default location
          setCurrentLocation({
            latitude: 6.9344,
            longitude: 79.8441
          });
        }
      );
    }
  }, []);

  // Search for transport options and update route
  const searchTransportOptions = async (destinationCoords) => {
    if (!currentLocation) return;

    setLoading(true);
    setDestinationCoords(destinationCoords);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/options`, {
        params: {
          fromLat: currentLocation.latitude,
          fromLng: currentLocation.longitude,
          toLat: destinationCoords.latitude,
          toLng: destinationCoords.longitude
        }
      });
      
      if (response.data.status === 'success') {
        setTransportOptions(response.data.data);
        // Store route data for future map implementation
        console.log('Route data available for map integration');
      }
    } catch (error) {
      console.error('Error fetching transport options:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to fetch transport options'
      }]);
    }
    setLoading(false);
  };

  // Get nearby stops
  const getNearbyStops = async () => {
    if (!currentLocation) return [];

    try {
      const response = await axios.get(`${API_BASE_URL}/location/nearbyStops`, {
        params: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          radius: 1000
        }
      });
      
      return response.data.status === 'success' ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching nearby stops:', error);
      return [];
    }
  };

  return (
    <div className="app">
      {showTravelPlatform ? (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="header-left">
              <img src="/logo.png" alt="SmartTransport Logo" className="logo" width={50} />
              <h1> SmartTransport</h1>
              <nav className="header-nav">
                <a href="#" className="active">Home</a>
                <a href="#">Services/Routes</a>
                <a href="#">Contact Us</a>
                <a href="#">FAQ</a>
              </nav>
            </div>
            <div className="header-right">
              <button className="header-button btn-outline-header">Sign Up</button>
              <button className="header-button btn-primary-header">Log In</button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1>Cost efficient travelling.<br />Worldwide.</h1>
              <p>Smart Planning integrated solutions for business and independent travellers</p>
              <div className="hero-cta">
                <button 
                  className="cta-button cta-primary"
                  onClick={() => setShowTravelPlatform(false)}
                >
                  Start Journey
                </button>
                <a href="#features" className="cta-button cta-secondary">Learn More</a>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="header-left">
              <h1>🚌 SmartTransport</h1>
              <nav className="header-nav">
                <a href="#" className="active">Journey Planner</a>
                <a href="#">Live Updates</a>
                <a href="#">My Trips</a>
              </nav>
            </div>
            <div className="header-right">
              <button 
                className="header-button btn-outline-header"
                onClick={() => setShowTravelPlatform(true)}
              >
                Back to Home
              </button>
            </div>
          </header>

          {/* Route Map Section - Only shows when destination is selected */}
          {currentLocation && destinationCoords && (
            <div className="route-map-section">
              <RouteMap 
                currentLocation={currentLocation}
                destination={destinationCoords}
                transportOptions={transportOptions}
              />
            </div>
          )}

          {/* Main Content Section */}
          <div className="main-content">
            <div className="journey-planning">
              <div className="search-section">
                <h2>Plan Your Journey</h2>
                <div className="search-form">
                  <div className="input-group">
                    <span className="input-icon">📍</span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="From where?"
                      value={currentLocation ? 
                        `Current Location (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})` : 
                        'Getting your location...'
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Location Selection */}
              <LocationTracker 
                currentLocation={currentLocation}
                onLocationUpdate={setCurrentLocation}
                getNearbyStops={getNearbyStops}
              />
              
              {/* Destination Search */}
              <DestinationSearch 
                destination={destination}
                onDestinationSelect={(dest, coords) => {
                  setDestination(dest);
                  searchTransportOptions(coords);
                }}
              />

              {/* Transport Options */}
              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Finding best routes...</p>
                </div>
              )}

              <TransportOptions 
                options={transportOptions}
                loading={loading}
              />
            </div>
          </div>
        </>
      )}

      {/* Notifications */}
      <NotificationPanel 
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
};

export default App;

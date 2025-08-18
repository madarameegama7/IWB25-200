import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Import components
import LocationTracker from './components/LocationTracker';
import DestinationSearch from './components/DestinationSearch';
import TransportOptions from './components/TransportOptions';
import TripPlanner from './components/TripPlanner';
import NotificationPanel from './components/NotificationPanel';
import Schedules from "./components/Schedules";
import Predictions from "./components/Predictions";
import Alerts from "./components/Alerts";

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState('');
  const [transportOptions, setTransportOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('realtime');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

  // Search for transport options
  const searchTransportOptions = async (destinationCoords) => {
    if (!currentLocation) return;

    setLoading(true);
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
      {/* Header */}
      <header className="app-header">
        <h1>🚌 Smart Transport Assistant</h1>
        <p>AI-powered public transport navigation for Sri Lanka</p>
      </header>

      {/* Navigation Tabs */}
      <nav className="navigation-tabs">
        <button 
          className={activeTab === 'realtime' ? 'active' : ''}
          onClick={() => setActiveTab('realtime')}
        >
          📍 Real-Time Journey
        </button>
        <button 
          className={activeTab === 'planner' ? 'active' : ''}
          onClick={() => setActiveTab('planner')}
        >
          📅 Trip Planner
        </button>
        <button 
          className={activeTab === 'legacy' ? 'active' : ''}
          onClick={() => setActiveTab('legacy')}
        >
          📊 Data View
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'realtime' && (
          <div className="realtime-section">
            <div className="section-header">
              <h2>Real-Time Journey Planning</h2>
              <p>Plan your journey based on current location and real-time data</p>
            </div>

            <div className="journey-inputs">
              <LocationTracker 
                currentLocation={currentLocation}
                onLocationUpdate={setCurrentLocation}
                getNearbyStops={getNearbyStops}
              />
              
              <DestinationSearch 
                destination={destination}
                onDestinationSelect={(dest, coords) => {
                  setDestination(dest);
                  searchTransportOptions(coords);
                }}
              />
            </div>

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Finding best transport options...</p>
              </div>
            )}

            <TransportOptions 
              options={transportOptions}
              loading={loading}
            />
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="planner-section">
            <div className="section-header">
              <h2>Advanced Trip Planning</h2>
              <p>Plan future trips with custom dates and times</p>
            </div>

            <TripPlanner 
              currentLocation={currentLocation}
              apiBaseUrl={API_BASE_URL}
            />
          </div>
        )}

        {activeTab === 'legacy' && (
          <div className="legacy-section">
            <div className="section-header">
              <h2>Data Overview</h2>
              <p>View schedules, predictions, and alerts</p>
            </div>
            <Schedules />
            <Predictions />
            <Alerts />
          </div>
        )}
      </main>

      {/* Notifications */}
      <NotificationPanel 
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />

      {/* Status Bar */}
      <footer className="status-bar">
        <div className="status-item">
          <span className={`status-indicator ${currentLocation ? 'active' : 'inactive'}`}></span>
          Location: {currentLocation ? 'Active' : 'Detecting...'}
        </div>
        <div className="status-item">
          <span className="status-indicator active"></span>
          Backend: Connected
        </div>
        <div className="status-item">
          Options: {transportOptions.length}
        </div>
      </footer>
    </div>
  );
};

export default App;

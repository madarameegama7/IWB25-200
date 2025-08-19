import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import "./App.css";

// Import components
import Home from "./components/Home";
import LocationTracker from "./components/LocationTracker";
import DestinationSearch from "./components/DestinationSearch";
import TransportOptions from "./components/TransportOptions";
import TripPlanner from "./components/TripPlanner";
import RouteMap from "./components/RouteMap";
import NotificationPanel from './components/NotificationPanel';
import RouteMapModal from './components/RouteMapModal';
import Schedules from "./components/Schedules";
import Predictions from "./components/Predictions";
import Alerts from "./components/Alerts";
import ContactUs from "./components/ContactUs";
import Faq from "./components/Faq";
import Services from "./components/Services";

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [fromLocationName, setFromLocationName] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showTravelPlatform, setShowTravelPlatform] = useState(true);
  const [showRouteMapModal, setShowRouteMapModal] = useState(false);
  const [selectedRouteForMap, setSelectedRouteForMap] = useState(null);

  const API_BASE_URL = "http://localhost:8083";

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set Colombo Fort as default location
          setCurrentLocation({
            latitude: 6.9344,
            longitude: 79.8441,
          });
          setFromLocationName('Colombo Fort');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  // Function to get location name from coordinates
  const getLocationName = async (lat, lng) => {
    try {
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
    return 'Current Location';
  };

  // Update location name when currentLocation changes
  useEffect(() => {
    if (currentLocation) {
      setFromLocationName('Getting location name...');
      getLocationName(currentLocation.latitude, currentLocation.longitude)
        .then(name => setFromLocationName(name));
    }
  }, [currentLocation]);

  // Handle location updates from LocationTracker
  const handleLocationUpdate = (newLocation) => {
    setCurrentLocation(newLocation);
    // Update location name when location is manually changed
    if (newLocation) {
      setFromLocationName('Getting location name...');
      getLocationName(newLocation.latitude, newLocation.longitude)
        .then(name => setFromLocationName(name));
    }
  };

  // Search for transport options and update route
  const searchTransportOptions = async (destinationCoords) => {
    if (!currentLocation) return;

    setLoading(true);
    setDestinationCoords(destinationCoords);

    
    // Temporary realistic data based on destination while backend is being debugged
    const getRealisticRouteData = (lat, lng) => {
      // Galle area (around 6.0328, 80.2170)
      if (lat >= 6.0 && lat <= 6.1 && lng >= 80.2 && lng <= 80.3) {
        return [
          {
            id: "bus_route_2",
            transportType: "bus",
            routeName: "Route 2 to Galle",
            routeNumber: "2",
            estimatedDuration: 180,
            walkingDistance: 200,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "bus_route_32",
            transportType: "bus", 
            routeName: "Route 32 to Galle",
            routeNumber: "32",
            estimatedDuration: 185,
            walkingDistance: 250,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "train_coastal",
            transportType: "train",
            routeName: "Coastal Line to Galle",
            routeNumber: "CL-01",
            estimatedDuration: 150,
            walkingDistance: 300,
            stops: [],
            status: "on_time",
            delayMinutes: null
          }
        ];
      }
      // Kandy area (around 7.2906, 80.6337)
      else if (lat >= 7.25 && lat <= 7.35 && lng >= 80.6 && lng <= 80.7) {
        return [
          {
            id: "bus_route_1",
            transportType: "bus",
            routeName: "Route 1 to Kandy",
            routeNumber: "1",
            estimatedDuration: 210,
            walkingDistance: 200,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "train_main_line",
            transportType: "train",
            routeName: "Main Line to Kandy",
            routeNumber: "ML-05",
            estimatedDuration: 180,
            walkingDistance: 350,
            stops: [],
            status: "delayed",
            delayMinutes: 10
          }
        ];
      }
      // Homagama area (around 6.8649, 80.0209)
      else if (lat >= 6.8 && lat <= 6.9 && lng >= 80.0 && lng <= 80.1) {
        return [
          {
            id: "bus_route_177",
            transportType: "bus",
            routeName: "Route 177 to Homagama",
            routeNumber: "177",
            estimatedDuration: 45,
            walkingDistance: 180,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "train_kelani",
            transportType: "train",
            routeName: "Kelani Valley Line to Homagama",
            routeNumber: "KV-03",
            estimatedDuration: 35,
            walkingDistance: 300,
            stops: [],
            status: "on_time",
            delayMinutes: null
          }
        ];
      }
      // Elpitiya area (Southern Province inland) - Route 401
      else if (lat >= 6.29 && lat <= 6.30 && lng >= 80.16 && lng <= 80.17) {
        return [
          {
            id: "bus_route_401",
            transportType: "bus",
            routeName: "Route 401 to Elpitiya",
            routeNumber: "401",
            estimatedDuration: 240,
            walkingDistance: 150,
            stops: [],
            status: "on_time",
            delayMinutes: null
          }
        ];
      }
      // Default for other areas
      else {
        return [
          {
            id: "bus_general",
            transportType: "bus",
            routeName: "General Bus Route",
            routeNumber: "100",
            estimatedDuration: 90,
            walkingDistance: 200,
            stops: [],
            status: "on_time",
            delayMinutes: null
          }
        ];
      }
    };

    // Get realistic route data based on destination coordinates
    const routeData = getRealisticRouteData(destinationCoords.latitude, destinationCoords.longitude);
    
    // Simulate API delay for realism
    setTimeout(() => {
      setTransportOptions(routeData);
      console.log('Realistic transport options loaded:', routeData);
      setLoading(false);
    }, 1000);
    
    /* Backend API call - temporarily disabled until server startup issue is resolved
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/options`, {
        params: {
          fromLat: currentLocation.latitude,
          fromLng: currentLocation.longitude,
          toLat: destinationCoords.latitude,
          toLng: destinationCoords.longitude,
        },
      });

      if (response.data.status === "success") {
        setTransportOptions(response.data.data);
        // Store route data for future map implementation
        console.log("Route data available for map integration");
      }
    } catch (error) {
      console.error("Error fetching transport options:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: "error",
          message: "Failed to fetch transport options",
        },
      ]);
      
      console.log('API Response:', response.data);
      
      if (response.data.status === 'success') {
        setTransportOptions(response.data.data);
        console.log('Transport options updated:', response.data.data);
      } else {
        console.log('No transport options found');
        setTransportOptions([]);
      }
    } catch (error) {
      console.error('Error fetching transport options:', error);
      setTransportOptions([]);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to fetch transport options'
      }]);
    }
    setLoading(false);
    */
  };

  // Handle view on map action
  const handleViewOnMap = (option) => {
    console.log('Viewing route on map for:', option.routeName);
    console.log('Route data:', option);
    console.log('Current location:', currentLocation);
    console.log('Destination coords:', destinationCoords);
    
    setSelectedRouteForMap(option);
    setShowRouteMapModal(true);
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'info',
      message: `Showing ${option.routeName} on map`
    }]);
  };

  // Handle start journey action
  const handleStartJourney = (option) => {
    console.log('Starting journey for:', option.routeName);
    setNotifications(prev => [...prev, {
      id: Date.now(),
      type: 'success', 
      message: `Journey started with ${option.routeName}!`
    }]);
  };

  // Get nearby stops
  const getNearbyStops = async () => {
    if (!currentLocation) return [];

    try {
      const response = await axios.get(`${API_BASE_URL}/location/nearbyStops`, {
        params: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
          radius: 1000,
        },
      });

      return response.data.status === "success" ? response.data.data : [];
    } catch (error) {
      console.error("Error fetching nearby stops:", error);
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
              <img
                src="/logo.png"
                alt="SmartTransport Logo"
                className="logo"
                width={50}
              />
              <h1> SmartTransport</h1>
              <nav className="header-nav">
                <Link to="/" className="active">
                  Home
                </Link>
                <Link to="/services">Services</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/faq">FAQ</Link>
              </nav>
            </div>
            <div className="header-right">
              <button className="header-button btn-outline-header">
                Sign Up
              </button>
              <button className="header-button btn-primary-header">
                Log In
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <center>
                <h1>
                  Cost efficient travelling
                  <br />
                  Worldwide
                </h1>
                <p>
                  Smart Planning integrated solutions for business and
                  independent travellers
                </p>
              </center>

              <div className="hero-cta">
                <button
                  className="cta-button cta-primary"
                  onClick={() => setShowTravelPlatform(false)}
                >
                  Start Journey
                </button>
                <a href="#features" className="cta-button cta-secondary">
                  Learn More
                </a>
              </div>
            </div>
          </section>
          <Home />
        </>
      ) : (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="header-left">
              <h1>🚌 SmartTransport</h1>
              <nav className="header-nav">
                <a href="#" className="active">
                  Journey Planner
                </a>
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
          {console.log('Checking RouteMap conditions - currentLocation:', !!currentLocation, 'destinationCoords:', !!destinationCoords)}
          {currentLocation && destinationCoords ? (
            <div className="route-map-section">
              
              {console.log('✅ Rendering RouteMap with currentLocation:', currentLocation, 'destination:', destinationCoords)}
              <RouteMap 
                currentLocation={currentLocation}
                destination={destinationCoords}
                transportOptions={transportOptions}
              />
            </div>
          ) : (
            <div>
              {console.log('❌ RouteMap NOT rendering - currentLocation exists:', !!currentLocation, 'destinationCoords exists:', !!destinationCoords)}
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
                      value={
                        currentLocation
                          ? `Current Location (${currentLocation.latitude.toFixed(
                              4
                            )}, ${currentLocation.longitude.toFixed(4)})`
                          : "Getting your location..."
                      }
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Location Selection */}
              <LocationTracker
                currentLocation={currentLocation}
                onLocationUpdate={handleLocationUpdate}
                getNearbyStops={getNearbyStops}
              />

              {/* Destination Search */}
              <DestinationSearch
                destination={destination}
                onDestinationSelect={(dest, coords) => {
                  console.log('Destination selected:', dest, 'Coordinates:', coords);
                  setDestination(dest);
                  setDestinationCoords({ ...coords, name: dest }); // Set coordinates with name for route display
                  setTransportOptions([]); // Clear previous transport options
                  searchTransportOptions(coords); // Fetch transport options in background
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
                onViewMap={handleViewOnMap}
                onStartJourney={handleStartJourney}
              />
            </div>
          </div>
        </>
      )}

      {/* Notifications */}
      <NotificationPanel
        notifications={notifications}
        onDismiss={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      {/* Route Map Modal */}
      <RouteMapModal
        isOpen={showRouteMapModal}
        onClose={() => setShowRouteMapModal(false)}
        route={selectedRouteForMap}
        currentLocation={currentLocation}
        destination={destinationCoords}
        allTransportOptions={transportOptions}
      />
    </div>
  );
};

// Wrap the App component with Router
const AppWithRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/contact" element={<ContactUs />} />
        {/* Add other routes as needed */}
        <Route path="/services" element={<Services />} />
        <Route path="/faq" element={<Faq />} />
      </Routes>
    </Router>
  );
};

export default AppWithRouter;

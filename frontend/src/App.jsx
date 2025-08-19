import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

// Import components
import LocationTracker from './components/LocationTracker';
import DestinationSearch from './components/DestinationSearch';
import TransportOptions from './components/TransportOptions';
import TripPlanner from './components/TripPlanner';
import NotificationPanel from './components/NotificationPanel';
import RouteMap from './components/RouteMap';
import RouteMapModal from './components/RouteMapModal';
import Schedules from "./components/Schedules";
import Predictions from "./components/Predictions";
import Alerts from "./components/Alerts";

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

  const API_BASE_URL = 'http://localhost:8085';

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

  // Test function to show various transport notifications
  const showTransportNotifications = () => {
    const notifications = [
      {
        id: Date.now() + 1,
        type: 'warning',
        title: 'Route 401 Delayed',
        message: 'Route 401 (Elpitiya - Colombo/Pettah) is delayed by 25 minutes due to heavy traffic near Wellawatta.',
        timestamp: Date.now(),
        routeId: 'route_401',
        delayMinutes: 25,
        icon: 'https://cdn-icons-png.flaticon.com/512/3039/3039008.png' // Bus delay icon
      },
      {
        id: Date.now() + 2,
        type: 'error',
        title: 'Route 138 Cancelled',
        message: 'Route 138 (Kottawa - Pettah) evening service has been cancelled due to mechanical issues.',
        timestamp: Date.now() + 1000,
        routeId: 'route_138',
        status: 'cancelled',
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png' // Cancel/stop icon
      },
      {
        id: Date.now() + 3,
        type: 'warning',
        title: 'Route 01 Running Late',
        message: 'Route 01 (Kandy - Colombo) is running 15 minutes behind schedule due to road construction.',
        timestamp: Date.now() + 2000,
        routeId: 'route_01',
        delayMinutes: 15,
        icon: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png' // Clock/time icon
      },
      {
        id: Date.now() + 4,
        type: 'error',
        title: 'Route 177 Service Disruption',
        message: 'Route 177 (Kaduwela - Kollupitiya) services suspended until 3 PM due to accident on Baseline Road.',
        timestamp: Date.now() + 3000,
        routeId: 'route_177',
        status: 'suspended',
        icon: 'https://cdn-icons-png.flaticon.com/512/5973/5973800.png' // Warning/construction icon
      }
    ];
    
    console.log('Transport notifications triggered:', notifications);
    
    // Add notifications one by one with slight delays
    notifications.forEach((notification, index) => {
      setTimeout(() => {
        setNotifications(prev => [...prev, notification]);
        
        // Auto-dismiss after 12 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 12000);
      }, index * 500); // 500ms delay between each notification
    });
  };

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

  // Transport delay monitoring system (moved up to be defined first)
  const checkTransportDelays = useCallback(async (options) => {
    // Simulate real-time delay checking - INCREASED chance for testing
    const delayUpdates = options.map(option => {
      const hasDelay = Math.random() < 0.8; // 80% chance of delay for testing
      const delayMinutes = hasDelay ? Math.floor(Math.random() * 25) + 5 : 0; // 5-30 minutes delay
      
      return {
        ...option,
        status: delayMinutes > 0 ? 'delayed' : option.status,
        delayMinutes: delayMinutes > 0 ? delayMinutes : null
      };
    });
    
    // Check for new delays and notify users
    delayUpdates.forEach((option, index) => {
      // Force at least the first route to have a delay for testing
      if (index === 0 && option.delayMinutes === null) {
        option.delayMinutes = 12;
        option.status = 'delayed';
      }
      
      if (option.delayMinutes && option.delayMinutes > 0) {
        console.log(`Creating delay notification for ${option.routeName}: ${option.delayMinutes} minutes`);
        
        const delayNotification = {
          id: Date.now() + Math.random(),
          type: option.delayMinutes > 15 ? 'warning' : 'delay',
          title: `${option.routeName} Delayed`,
          message: `Route ${option.routeNumber} is delayed by ${option.delayMinutes} minutes. We recommend considering alternative routes.`,
          timestamp: Date.now(),
          routeId: option.id,
          delayMinutes: option.delayMinutes,
          icon: 'https://cdn-icons-png.flaticon.com/512/5973/5973800.png' // Warning icon for delays
        };
        
        console.log('Adding notification:', delayNotification);
        setNotifications(prev => {
          console.log('Current notifications:', prev);
          return [...prev, delayNotification];
        });
        
        // Auto-dismiss delay notifications after 30 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== delayNotification.id));
        }, 30000);
      }
    });
    
    return delayUpdates;
  }, [setNotifications]);

  // Real-time delay checking from backend API
  const checkRealTimeDelays = useCallback(async (options) => {
    try {
      // Get route IDs for batch delay check
      const routeIds = options.map(option => option.id).join(',');
      
      const response = await axios.get(`${API_BASE_URL}/delays/batch`, {
        params: { route_ids: routeIds }
      });
      
      if (response.data.status === 'success') {
        const delayData = response.data.data;
        
        // Update options with real delay data
        const updatedOptions = options.map(option => {
          const delayInfo = delayData.find(d => d.routeId === option.id);
          if (delayInfo) {
            return {
              ...option,
              status: delayInfo.status,
              delayMinutes: delayInfo.delayMinutes > 0 ? delayInfo.delayMinutes : null,
              delayReason: delayInfo.reason
            };
          }
          return option;
        });
        
        // Show notifications for significant delays
        updatedOptions.forEach(option => {
          if (option.delayMinutes && option.delayMinutes > 0) {
            const existingNotification = notifications.find(n => 
              n.routeId === option.id && n.type === 'delay'
            );
            
            if (!existingNotification) {
              const delayNotification = {
                id: Date.now() + Math.random(),
                type: option.delayMinutes > 15 ? 'warning' : 'delay',
                title: `${option.routeName} Delayed`,
                message: `Route ${option.routeNumber} is delayed by ${option.delayMinutes} minutes. ${option.delayReason || 'Checking for updates...'}`,
                timestamp: Date.now(),
                routeId: option.id,
                delayMinutes: option.delayMinutes,
                icon: 'https://cdn-icons-png.flaticon.com/512/5973/5973800.png' // Warning icon for delays
              };
              
              setNotifications(prev => [...prev, delayNotification]);
              
              // Auto-dismiss after 45 seconds
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== delayNotification.id));
              }, 45000);
            }
          }
        });
        
        return updatedOptions;
      }
    } catch (error) {
      console.log('Real-time delay API unavailable, using simulation:', error);
    }
    
    // Fallback to simulation if API is unavailable
    return await checkTransportDelays(options);
  }, [API_BASE_URL, notifications, checkTransportDelays]);

  // Service disruption notifications
  const checkServiceDisruptions = useCallback((options) => {
    options.forEach(option => {
      if (option.status === 'cancelled') {
        const cancellationNotification = {
          id: Date.now() + Math.random(),
          type: 'error',
          title: `Service Cancelled`,
          message: `${option.routeName} (Route ${option.routeNumber}) has been cancelled. Please check alternative routes.`,
          timestamp: Date.now(),
          routeId: option.id,
          persistent: true, // Don't auto-dismiss
          icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828843.png' // Cancel icon
        };
        
        setNotifications(prev => [...prev, cancellationNotification]);
      }
    });
  }, [setNotifications]);

  // Search for transport options and update route
  const searchTransportOptions = async (destinationCoords) => {
    if (!currentLocation) return;

    setLoading(true);
    
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
            estimatedDuration: 270,
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
            estimatedDuration: 270,
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
            estimatedDuration: 250,
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
            id: "bus_route_138_homagama",
            transportType: "bus",
            routeName: "Route 138 to Homagama",
            routeNumber: "138",
            estimatedDuration: 75,
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
            estimatedDuration: 65,
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
      // Pettah area (around 6.9354, 79.8500)
      else if (lat >= 6.93 && lat <= 6.94 && lng >= 79.84 && lng <= 79.86) {
        return [
          {
            id: "bus_route_pettah",
            transportType: "bus",
            routeName: "Route 138 to Pettah",
            routeNumber: "138",
            estimatedDuration: 30,
            walkingDistance: 100,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "bus_route_pettah_2",
            transportType: "bus",
            routeName: "Route 1 to Pettah",
            routeNumber: "1",
            estimatedDuration: 30,
            walkingDistance: 120,
            stops: [],
            status: "on_time",
            delayMinutes: null
          }
        ];
      }
      // Nugegoda area (around 6.8659, 79.8977)
      else if (lat >= 6.86 && lat <= 6.87 && lng >= 79.89 && lng <= 79.91) {
        return [
          {
            id: "bus_route_138_nugegoda",
            transportType: "bus",
            routeName: "Route 138 to Nugegoda",
            routeNumber: "138",
            estimatedDuration: 30,
            walkingDistance: 150,
            stops: [],
            status: "on_time",
            delayMinutes: null
          },
          {
            id: "bus_route_138_nugegoda_2",
            transportType: "bus",
            routeName: "Route 138 to Nugegoda",
            routeNumber: "138",
            estimatedDuration: 30,
            walkingDistance: 180,
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
    
    // Simulate API delay for realism and check for transport delays
    setTimeout(async () => {
      // Try real-time delay checking first, fallback to simulation
      const updatedRoutes = await checkRealTimeDelays(routeData);
      checkServiceDisruptions(updatedRoutes);
      
      setTransportOptions(updatedRoutes);
      console.log('Transport options with real-time delay monitoring loaded:', updatedRoutes);
      setLoading(false);
    }, 1000);
    
    /* Backend API call - temporarily disabled until server startup issue is resolved
    try {
      const response = await axios.get(`${API_BASE_URL}/routes/options`, {
        params: {
          fromLat: currentLocation.latitude,
          fromLng: currentLocation.longitude,
          toLat: destinationCoords.latitude,
          toLng: destinationCoords.longitude
        }
      });
      
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

  // Periodic delay monitoring - check every 2 minutes
  useEffect(() => {
    if (transportOptions.length > 0) {
      const delayCheckInterval = setInterval(async () => {
        console.log('Checking for transport delays...');
        const updatedRoutes = await checkRealTimeDelays(transportOptions);
        setTransportOptions(updatedRoutes);
      }, 120000); // Check every 2 minutes
      
      return () => clearInterval(delayCheckInterval);
    }
  }, [transportOptions, checkRealTimeDelays]);

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
              <h1>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" 
                  alt="bus"
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '8px',
                    verticalAlign: 'middle'
                  }}
                />
                SmartTransport
              </h1>
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
              <h1>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png" 
                  alt="bus"
                  style={{
                    width: '24px',
                    height: '24px',
                    marginRight: '8px',
                    verticalAlign: 'middle'
                  }}
                />
                SmartTransport
              </h1>
              <nav className="header-nav">
                <a href="#" className="active">Journey Planner</a>
                <a href="#">Live Updates</a>
                <a href="#">My Trips</a>
              </nav>
            </div>
            <div className="header-right">
              <button
                onClick={showTransportNotifications}
                className="notifications-button"
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                � Notifications
              </button>
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
              {console.log('✓ Rendering RouteMap with currentLocation:', currentLocation, 'destination:', destinationCoords)}
              <RouteMap 
                currentLocation={currentLocation}
                destination={destinationCoords}
                transportOptions={transportOptions}
              />
            </div>
          ) : (
            <div>
              {console.log('✗ RouteMap NOT rendering - currentLocation exists:', !!currentLocation, 'destinationCoords exists:', !!destinationCoords)}
            </div>
          )}

          {/* Main Content Section */}
          <div className="main-content">
            <div className="journey-planning">
              <div className="search-section">
                <h2>Plan Your Journey</h2>
                <div className="search-form">
                  <div className="input-group">
                    <span className="input-icon">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/684/684908.png" 
                        alt="location"
                        style={{
                          width: '16px',
                          height: '16px'
                        }}
                      />
                    </span>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="From where?"
                      value={currentLocation ? 
                        fromLocationName || 'Current Location' : 
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
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
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

export default App;

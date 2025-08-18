import React, { useState, useCallback } from 'react';
import axios from 'axios';

const TripPlanner = ({ currentLocation, apiBaseUrl }) => {
  const [tripData, setTripData] = useState({
    fromLocation: '',
    toLocation: '',
    date: '',
    time: '',
    timeType: 'departure',
    tripType: 'one_way'
  });
  const [plannedTrip, setPlannedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduledTrips, setScheduledTrips] = useState([]);

  const popularLocations = [
    'Colombo Fort', 'Pettah', 'Bambalapitiya', 'Nugegoda',
    'Kandy', 'Galle', 'Mount Lavinia', 'Maharagama'
  ];

  const handleInputChange = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlanTrip = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${apiBaseUrl}/trips/plan`, tripData);
      
      if (response.data.status === 'success') {
        setPlannedTrip(response.data.data);
        loadScheduledTrips();
      }
    } catch (error) {
      console.error('Error planning trip:', error);
      alert('Failed to plan trip. Please try again.');
    }
    setLoading(false);
  };

  const loadScheduledTrips = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/trips/schedule`);
      if (response.data.status === 'success') {
        setScheduledTrips(response.data.data);
      }
    } catch (error) {
      console.error('Error loading scheduled trips:', error);
    }
  }, [apiBaseUrl]);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  // Use currentLocation if available for initial fromLocation
  React.useEffect(() => {
    if (currentLocation && !tripData.fromLocation) {
      // Set a default location based on current location
      setTripData(prev => ({
        ...prev,
        fromLocation: 'Current Location'
      }));
    }
  }, [currentLocation, tripData.fromLocation]);

  React.useEffect(() => {
    loadScheduledTrips();
  }, [loadScheduledTrips]);

  return (
    <div className="trip-planner">
      <div className="planner-form">
        <h3>📅 Plan Your Trip</h3>
        
        <form onSubmit={handlePlanTrip} className="trip-form">
          <div className="form-row">
            <div className="form-group">
              <label>From Location</label>
              <input
                type="text"
                list="from-locations"
                value={tripData.fromLocation}
                onChange={(e) => handleInputChange('fromLocation', e.target.value)}
                placeholder="Enter starting point"
                required
              />
              <datalist id="from-locations">
                {popularLocations.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>To Location</label>
              <input
                type="text"
                list="to-locations"
                value={tripData.toLocation}
                onChange={(e) => handleInputChange('toLocation', e.target.value)}
                placeholder="Enter destination"
                required
              />
              <datalist id="to-locations">
                {popularLocations.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={tripData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={tripData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Time Preference</label>
              <select
                value={tripData.timeType}
                onChange={(e) => handleInputChange('timeType', e.target.value)}
              >
                <option value="departure">Depart at this time</option>
                <option value="arrival">Arrive by this time</option>
              </select>
            </div>

            <div className="form-group">
              <label>Trip Type</label>
              <select
                value={tripData.tripType}
                onChange={(e) => handleInputChange('tripType', e.target.value)}
              >
                <option value="one_way">One Way</option>
                <option value="round_trip">Round Trip</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary full-width">
            {loading ? '🔄 Planning...' : '🚀 Plan Trip'}
          </button>
        </form>
      </div>

      {/* Planned Trip Result */}
      {plannedTrip && (
        <div className="planned-trip">
          <h3>✅ Trip Planned Successfully</h3>
          <div className="trip-details">
            <div className="trip-header">
              <h4>{plannedTrip.fromLocation} → {plannedTrip.toLocation}</h4>
              <span className="trip-status">{plannedTrip.status}</span>
            </div>
            
            <div className="trip-info">
              <p><strong>Departure:</strong> {formatDateTime(plannedTrip.plannedDepartureTime)}</p>
              {plannedTrip.plannedArrivalTime && (
                <p><strong>Arrival:</strong> {formatDateTime(plannedTrip.plannedArrivalTime)}</p>
              )}
              <p><strong>Trip Type:</strong> {plannedTrip.tripType}</p>
            </div>

            {plannedTrip.routeOptions && plannedTrip.routeOptions.length > 0 && (
              <div className="route-options">
                <h4>Available Routes:</h4>
                {plannedTrip.routeOptions.map((route) => (
                  <div key={route.id} className="route-option">
                    <span className="route-icon">
                      {route.transportType === 'bus' ? '🚌' : '🚂'}
                    </span>
                    <div className="route-info">
                      <p className="route-name">{route.routeName}</p>
                      <p className="route-duration">{route.estimatedDuration} min</p>
                    </div>
                    <span className={`route-status ${route.status}`}>
                      {route.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Trips */}
      {scheduledTrips.length > 0 && (
        <div className="scheduled-trips">
          <h3>📋 Your Scheduled Trips ({scheduledTrips.length})</h3>
          <div className="trips-list">
            {scheduledTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-summary">
                  <h4>{trip.fromLocation} → {trip.toLocation}</h4>
                  <span className={`status-badge ${trip.status}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="trip-time">
                  <p>{formatDateTime(trip.plannedDepartureTime)}</p>
                  <span className="trip-type">{trip.tripType}</span>
                </div>
                <div className="trip-actions">
                  <button className="btn-outline">View Details</button>
                  <button className="btn-primary">Start Navigation</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;

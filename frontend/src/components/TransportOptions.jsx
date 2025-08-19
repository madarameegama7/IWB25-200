import React, { useState } from 'react';

const TransportOptions = ({ options, loading, onViewMap, onStartJourney }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDepartureTimes, setShowDepartureTimes] = useState(false);

  // Generate realistic departure times based on transport type
  const generateDepartureTimes = (transportType, routeName) => {
    const now = new Date();
    const times = [];
    
    if (transportType === 'bus') {
      // Bus times - more frequent
      for (let i = 0; i < 8; i++) {
        const time = new Date(now.getTime() + (i * 15 * 60000)); // Every 15 minutes
        times.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: i === 0 ? 'departing' : i <= 2 ? 'on_time' : 'scheduled',
          platform: `Platform ${Math.floor(Math.random() * 5) + 1}`
        });
      }
    } else if (transportType === 'train') {
      // Train times - less frequent but more scheduled
      const trainIntervals = [30, 60, 90, 120, 150, 180]; // Different intervals
      for (let i = 0; i < 6; i++) {
        const time = new Date(now.getTime() + (trainIntervals[i] * 60000));
        times.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          status: i === 0 ? 'boarding' : i <= 1 ? 'on_time' : 'scheduled',
          platform: `Platform ${Math.floor(Math.random() * 3) + 1}`,
          trainNumber: `T${Math.floor(Math.random() * 900) + 100}`
        });
      }
    }
    
    return times;
  };

  const handleStartJourney = (option) => {
    setSelectedOption(option);
    setShowDepartureTimes(true);
    if (onStartJourney) {
      onStartJourney(option);
    }
  };

  const handleViewMap = (option) => {
    if (onViewMap) {
      onViewMap(option);
    }
  };

  if (loading) {
    return (
      <div className="transport-options loading">
        <div className="section-header">
          <h3>
            <img src="https://cdn-icons-png.flaticon.com/512/3305/3305219.png" alt="loading" style={{width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle'}} />
            Finding Transport Options...
          </h3>
        </div>
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="transport-options empty">
        <div className="empty-state">
          <img src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png" alt="no routes" style={{width: '48px', height: '48px', marginBottom: '16px'}} />
          <h3>No routes found</h3>
          <p>Try selecting a destination to see transport options</p>
        </div>
      </div>
    );
  }

  const getTransportIcon = (type) => {
    const icons = {
      bus: 'https://cdn-icons-png.flaticon.com/512/3039/3039008.png',
      train: 'https://cdn-icons-png.flaticon.com/512/2972/2972402.png',
      combined: 'https://cdn-icons-png.flaticon.com/512/3039/3039008.png'
    };
    return icons[type] || 'https://cdn-icons-png.flaticon.com/512/2972/2972563.png';
  };

  const getStatusColor = (status) => {
    const colors = {
      on_time: 'green',
      delayed: 'orange',
      cancelled: 'red',
      departing: 'blue',
      boarding: 'purple',
      scheduled: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      on_time: 'On Time',
      delayed: 'Delayed',
      cancelled: 'Cancelled',
      departing: 'Departing Now',
      boarding: 'Boarding',
      scheduled: 'Scheduled'
    };
    return texts[status] || 'Unknown';
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const formatWalkingDistance = (meters) => {
    if (meters < 1000) return `${Math.round(meters)}m walk`;
    return `${(meters / 1000).toFixed(1)}km walk`;
  };

  // Show departure times modal
  if (showDepartureTimes && selectedOption) {
    const departureTimes = generateDepartureTimes(selectedOption.transportType, selectedOption.routeName);
    
    return (
      <div className="transport-options">
        <div className="section-header">
          <button 
            className="back-button"
            onClick={() => setShowDepartureTimes(false)}
          >
            ← Back to Routes
          </button>
          <h3>� Departure Times - {selectedOption.routeName}</h3>
        </div>

        <div className="departure-times">
          {departureTimes.map((departure, index) => (
            <div key={index} className={`departure-item ${departure.status}`}>
              <div className="departure-time">
                <span className="time">{departure.time}</span>
                <span className={`status ${getStatusColor(departure.status)}`}>
                  {getStatusText(departure.status)}
                </span>
              </div>
              <div className="departure-details">
                <span className="platform">{departure.platform}</span>
                {departure.trainNumber && (
                  <span className="train-number">{departure.trainNumber}</span>
                )}
              </div>
              {index === 0 && (
                <button className="select-departure">
                  Select This Departure
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="departure-info">
          <p><strong>Duration:</strong> {formatDuration(selectedOption.estimatedDuration)}</p>
          <p><strong>Walking to stop:</strong> {formatWalkingDistance(selectedOption.walkingDistance)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transport-options">
      <div className="section-header">
        <h3>�🚊 Transport Options</h3>
        <p>{options.length} route{options.length !== 1 ? 's' : ''} available</p>
      </div>

      <div className="options-list">
        {options.map((option, index) => (
          <div key={option.id} className={`option-card ${index === 0 ? 'recommended' : ''}`}>
            {index === 0 && (
              <div className="recommendation-badge">
                ⭐ RECOMMENDED
              </div>
            )}
            
            <div className="option-header">
              <div className="transport-info">
                <span className="transport-icon">
                  <img src={getTransportIcon(option.transportType)} alt="transport" style={{width: '24px', height: '24px'}} />
                </span>
                <div className="transport-details">
                  <div className="route-header">
                    <span className="route-number">{option.routeNumber}</span>
                    <h4 className="route-name">{option.routeName}</h4>
                  </div>
                  <p className="transport-type">
                    {option.transportType.charAt(0).toUpperCase() + option.transportType.slice(1)} Route
                  </p>
                </div>
              </div>

              <div className="option-status">
                <span className={`status-indicator ${getStatusColor(option.status)}`}>
                  {getStatusText(option.status)}
                </span>
                {option.delayMinutes && (
                  <span className="delay-info">+{option.delayMinutes}min</span>
                )}
              </div>
            </div>

            <div className="option-details">
              <div className="detail-item">
                <span className="detail-icon">
                  <img src="https://cdn-icons-png.flaticon.com/512/2784/2784403.png" alt="duration" style={{width: '20px', height: '20px'}} />
                </span>
                <div className="detail-content">
                  <p className="detail-label">DURATION</p>
                  <p className="detail-value">{formatDuration(option.estimatedDuration)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">
                  <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="walking" style={{width: '20px', height: '20px'}} />
                </span>
                <div className="detail-content">
                  <p className="detail-label">WALKING</p>
                  <p className="detail-value">{formatWalkingDistance(option.walkingDistance)}</p>
                </div>
              </div>
            </div>

            <div className="option-actions">
              <button 
                className="btn-outline"
                onClick={() => handleViewMap(option)}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/2776/2776067.png" alt="map" style={{width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle'}} />
                View on Map
              </button>
              <button 
                className="btn-primary"
                onClick={() => handleStartJourney(option)}
              >
                <img src="https://cdn-icons-png.flaticon.com/512/3039/3039415.png" alt="start" style={{width: '16px', height: '16px', marginRight: '4px', verticalAlign: 'middle'}} />
                Start Journey
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="options-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/4727/4727424.png" alt="fastest" style={{width: '20px', height: '20px'}} />
            </span>
            <div>
              <p className="stat-label">Fastest Route</p>
              <p className="stat-value">
                {formatDuration(Math.min(...options.map(o => o.estimatedDuration)))}
              </p>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="walking" style={{width: '20px', height: '20px'}} />
            </span>
            <div>
              <p className="stat-label">Least Walking</p>
              <p className="stat-value">
                {Math.round(Math.min(...options.map(o => o.walkingDistance)))}m
              </p>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/5610/5610944.png" alt="on time" style={{width: '20px', height: '20px'}} />
            </span>
            <div>
              <p className="stat-label">On Time</p>
              <p className="stat-value">
                {options.filter(o => o.status === 'on_time').length}/{options.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportOptions;

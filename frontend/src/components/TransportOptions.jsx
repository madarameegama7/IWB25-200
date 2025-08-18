import React from 'react';

const TransportOptions = ({ options, loading }) => {
  if (loading) {
    return (
      <div className="transport-options loading">
        <div className="section-header">
          <h3>🔄 Finding Transport Options...</h3>
        </div>
      </div>
    );
  }

  if (!options || options.length === 0) {
    return (
      <div className="transport-options empty">
        <div className="empty-state">
          <span className="empty-icon">🗺️</span>
          <h3>No routes found</h3>
          <p>Try selecting a destination to see transport options</p>
        </div>
      </div>
    );
  }

  const getTransportIcon = (type) => {
    const icons = {
      bus: '🚌',
      train: '🚂',
      combined: '🚌🚂'
    };
    return icons[type] || '🚊';
  };

  const getStatusColor = (status) => {
    const colors = {
      on_time: 'green',
      delayed: 'orange',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      on_time: 'On Time',
      delayed: 'Delayed',
      cancelled: 'Cancelled'
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

  return (
    <div className="transport-options">
      <div className="section-header">
        <h3>🚊 Transport Options</h3>
        <p>{options.length} route{options.length !== 1 ? 's' : ''} available</p>
      </div>

      <div className="options-list">
        {options.map((option, index) => (
          <div key={option.id} className={`option-card ${index === 0 ? 'recommended' : ''}`}>
            {index === 0 && (
              <div className="recommendation-badge">
                ⭐ Recommended
              </div>
            )}
            
            <div className="option-header">
              <div className="transport-info">
                <span className="transport-icon">
                  {getTransportIcon(option.transportType)}
                </span>
                <div className="transport-details">
                  <h4 className="route-name">{option.routeName}</h4>
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
                <span className="detail-icon">⏱️</span>
                <div className="detail-content">
                  <p className="detail-label">Duration</p>
                  <p className="detail-value">{formatDuration(option.estimatedDuration)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🚶</span>
                <div className="detail-content">
                  <p className="detail-label">Walking</p>
                  <p className="detail-value">{formatWalkingDistance(option.walkingDistance)}</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🚏</span>
                <div className="detail-content">
                  <p className="detail-label">Stops</p>
                  <p className="detail-value">{option.stops.length} stop{option.stops.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Route Stops Preview */}
            {option.stops && option.stops.length > 0 && (
              <div className="route-preview">
                <div className="stops-preview">
                  {option.stops.slice(0, 2).map((stop, idx) => (
                    <div key={stop.id} className="stop-preview">
                      <span className={`stop-indicator ${stop.stopType}`}>
                        {stop.stopType === 'bus' ? '🚌' : '🚂'}
                      </span>
                      <span className="stop-name">{stop.name}</span>
                      {idx < option.stops.slice(0, 2).length - 1 && (
                        <span className="route-arrow">→</span>
                      )}
                    </div>
                  ))}
                  {option.stops.length > 2 && (
                    <span className="more-stops">+{option.stops.length - 2} more</span>
                  )}
                </div>
              </div>
            )}

            <div className="option-actions">
              <button className="btn-outline">
                📍 View on Map
              </button>
              <button className="btn-primary">
                🚀 Start Journey
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="options-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-icon">⚡</span>
            <div>
              <p className="stat-label">Fastest Route</p>
              <p className="stat-value">
                {Math.min(...options.map(o => o.estimatedDuration))} minutes
              </p>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🚶</span>
            <div>
              <p className="stat-label">Least Walking</p>
              <p className="stat-value">
                {Math.round(Math.min(...options.map(o => o.walkingDistance)))}m
              </p>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">🎯</span>
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

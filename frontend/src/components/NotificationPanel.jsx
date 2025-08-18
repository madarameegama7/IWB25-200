import React from 'react';

const NotificationPanel = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      delay: '⏰',
      cancellation: '🚫'
    };
    return icons[type] || 'ℹ️';
  };

  const getNotificationClass = (type) => {
    return `notification ${type}`;
  };

  return (
    <div className="notification-panel">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {getNotificationIcon(notification.type)}
            </span>
            <div className="notification-message">
              {notification.title && (
                <h4 className="notification-title">{notification.title}</h4>
              )}
              <p className="notification-text">{notification.message}</p>
              {notification.timestamp && (
                <span className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => onDismiss(notification.id)}
            className="notification-close"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;

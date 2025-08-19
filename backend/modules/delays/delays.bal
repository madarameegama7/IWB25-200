import ballerina/time;

// Transport delay monitoring service
public function getTransportDelays(string routeId) returns json {
    // Simulate real-time delay data
    // In production, this would connect to real transport APIs
    
    time:Utc currentTime = time:utcNow();
    int currentHour = time:utcToCivil(currentTime).hour;
    
    // Higher chance of delays during rush hours (7-9 AM, 5-7 PM)
    boolean rushHour = (currentHour >= 7 && currentHour <= 9) || 
                      (currentHour >= 17 && currentHour <= 19);
    
    // Simulate weather impact
    boolean badWeather = false; // Would integrate with weather API
    
    json delayInfo = {
        "routeId": routeId,
        "timestamp": currentTime.toString(),
        "status": "on_time", // Default status
        "delayMinutes": 0,
        "reason": "",
        "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(), // Next update in 2 minutes
        "statusIcon": "https://cdn-icons-png.flaticon.com/512/5610/5610944.png", // Green checkmark for on-time
        "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/3039/3039008.png" // Bus icon
    };
    
    // Route-specific delay simulation
    if (routeId == "bus_route_401") {
        // Route 401 - Longer route, more prone to delays
        if (rushHour) {
            delayInfo = {
                "routeId": routeId,
                "timestamp": currentTime.toString(),
                "status": "delayed",
                "delayMinutes": 15,
                "reason": "Heavy traffic due to rush hour",
                "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(),
                "statusIcon": "https://cdn-icons-png.flaticon.com/512/1828/1828843.png", // Red warning for delay
                "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/3039/3039008.png" // Bus icon
            };
        } else if (badWeather) {
            delayInfo = {
                "routeId": routeId,
                "timestamp": currentTime.toString(),
                "status": "delayed",
                "delayMinutes": 8,
                "reason": "Weather conditions affecting road travel",
                "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(),
                "statusIcon": "https://cdn-icons-png.flaticon.com/512/4150/4150897.png", // Weather warning icon
                "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/3039/3039008.png" // Bus icon
            };
        }
    } else if (routeId == "bus_route_2" || routeId == "bus_route_02") {
        // Route 02 - Coastal route, weather dependent
        if (badWeather) {
            delayInfo = {
                "routeId": routeId,
                "timestamp": currentTime.toString(),
                "status": "delayed",
                "delayMinutes": 12,
                "reason": "Coastal road conditions",
                "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(),
                "statusIcon": "https://cdn-icons-png.flaticon.com/512/4150/4150897.png", // Weather warning icon
                "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/3039/3039008.png" // Bus icon
            };
        } else if (rushHour) {
            delayInfo = {
                "routeId": routeId,
                "timestamp": currentTime.toString(),
                "status": "delayed",
                "delayMinutes": 6,
                "reason": "High passenger volume",
                "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(),
                "statusIcon": "https://cdn-icons-png.flaticon.com/512/2972/2972531.png", // Clock icon for delay
                "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/3039/3039008.png" // Bus icon
            };
        }
    } else if (routeId.startsWith("train_")) {
        // Train delays - different patterns
        if (rushHour) {
            delayInfo = {
                "routeId": routeId,
                "timestamp": currentTime.toString(),
                "status": "delayed",
                "delayMinutes": 5,
                "reason": "Platform congestion",
                "nextUpdate": time:utcAddSeconds(currentTime, 120).toString(),
                "statusIcon": "https://cdn-icons-png.flaticon.com/512/2972/2972531.png", // Clock icon for delay
                "vehicleIcon": "https://cdn-icons-png.flaticon.com/512/2972/2972402.png" // Train icon
            };
        }
    }
    
    return delayInfo;
}

// Batch delay check for multiple routes
public function getBatchDelays(string[] routeIds) returns json {
    json[] delayUpdates = [];
    
    foreach string routeId in routeIds {
        json delayInfo = getTransportDelays(routeId);
        delayUpdates.push(delayInfo);
    }
    
    return {
        "status": "success",
        "timestamp": time:utcNow().toString(),
        "data": delayUpdates,
        "count": delayUpdates.length()
    };
}

// Service disruption notifications
public function getServiceAlerts() returns json {
    time:Utc currentTime = time:utcNow();
    
    // Simulate service alerts
    json[] alerts = [
        {
            "alertId": "ALERT_001",
            "severity": "info",
            "title": "Route 401 Service Update",
            "message": "Route 401 is operating with additional buses during peak hours",
            "affectedRoutes": ["bus_route_401"],
            "timestamp": currentTime.toString(),
            "expiresAt": time:utcAddSeconds(currentTime, 3600).toString(), // Expires in 1 hour
            "icon": "https://cdn-icons-png.flaticon.com/512/1827/1827370.png", // Info icon
            "severityIcon": "https://cdn-icons-png.flaticon.com/512/5610/5610944.png" // Green info badge
        }
    ];
    
    return {
        "status": "success",
        "timestamp": currentTime.toString(),
        "alerts": alerts,
        "count": alerts.length()
    };
}

// Emergency service cancellations
public function getEmergencyAlerts() returns json {
    // This would connect to emergency services or transport authority APIs
    return {
        "status": "success",
        "timestamp": time:utcNow().toString(),
        "emergencyAlerts": [],
        "count": 0
    };
}

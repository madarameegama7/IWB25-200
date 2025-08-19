// Location-related data types
public type Location record {|
    float latitude;
    float longitude;
|};

public type Stop record {|
    string id;
    string name;
    string stopType; // "bus" or "train"
    Location location;
    float distance; // distance from user in meters
    string[] routes;
|};

public type RouteOption record {|
    string id;
    string transportType; // "bus", "train", "combined"
    string routeName;
    string routeNumber; // Route number (e.g., "02", "401", etc.)
    int estimatedDuration; // in minutes
    float walkingDistance; // in meters
    Stop[] stops;
    string status; // "on_time", "delayed", "cancelled"
    int? delayMinutes;
|};

// Mock data for nearby stops
Stop[] sriLankanStops = [
    {
        id: "bus_001",
        name: "Colombo Fort Bus Stand",
        stopType: "bus",
        location: {latitude: 6.9344, longitude: 79.8441},
        distance: 0.0,
        routes: ["138", "177", "122", "110"]
    },
    {
        id: "bus_002", 
        name: "Pettah Bus Station",
        stopType: "bus",
        location: {latitude: 6.9354, longitude: 79.8500},
        distance: 0.0,
        routes: ["100", "120", "131", "157"]
    },
    {
        id: "train_001",
        name: "Colombo Fort Railway Station",
        stopType: "train",
        location: {latitude: 6.9344, longitude: 79.8441},
        distance: 0.0,
        routes: ["Main Line", "Coastal Line", "Kelani Valley Line"]
    },
    {
        id: "bus_003",
        name: "Bambalapitiya Junction",
        stopType: "bus", 
        location: {latitude: 6.8887, longitude: 79.8590},
        distance: 0.0,
        routes: ["100", "102", "120", "138"]
    },
    {
        id: "train_002",
        name: "Bambalapitiya Railway Station",
        stopType: "train",
        location: {latitude: 6.8887, longitude: 79.8590},
        distance: 0.0,
        routes: ["Coastal Line"]
    },
    {
        id: "bus_elpitiya",
        name: "Elpitiya Bus Station",
        stopType: "bus",
        location: {latitude: 6.2917, longitude: 80.1631},
        distance: 0.0,
        routes: ["401"]
    }
];

// Calculate distance between two points (simplified calculation)
function calculateDistance(Location point1, Location point2) returns float {
    float deltaLat = point2.latitude - point1.latitude;
    float deltaLon = point2.longitude - point1.longitude;

    // Simplified distance calculation (not exact Haversine, but good enough for demo)
    float latDiff = deltaLat * deltaLat;
    float lonDiff = deltaLon * deltaLon;
    float distance = (latDiff + lonDiff) * 111000.0; // Rough conversion to meters
    
    return distance;
}

// Get nearby stops within specified radius
public function getNearbyStops(float latitude, float longitude, float? radiusMeters = 500.0) returns Stop[] {
    Location userLocation = {latitude: latitude, longitude: longitude};
    Stop[] nearbyStops = [];
    
    foreach Stop stop in sriLankanStops {
        float distance = calculateDistance(userLocation, stop.location);
        float radius = radiusMeters ?: 500.0;
        if (distance <= radius) {
            Stop nearbyStop = {
                id: stop.id,
                name: stop.name,
                stopType: stop.stopType,
                location: stop.location,
                distance: distance,
                routes: stop.routes
            };
            nearbyStops.push(nearbyStop);
        }
    }
    
    return nearbyStops;
}

// Real Sri Lankan route data
type RouteData record {|
    string[] busRoutes;
    int estimatedDuration;
    boolean hasTrainService;
    string? trainLine;
    int? trainDuration;
|};

// Route database for major destinations in Sri Lanka
map<RouteData> routeDatabase = {
    "galle": {
        busRoutes: ["2", "32", "350", "385"], 
        estimatedDuration: 180,
        hasTrainService: true,
        trainLine: "Coastal Line",
        trainDuration: 150
    },
    "kandy": {
        busRoutes: ["1", "1-1", "99"], 
        estimatedDuration: 210,
        hasTrainService: true,
        trainLine: "Main Line",
        trainDuration: 180
    },
    "negombo": {
        busRoutes: ["240", "245"], 
        estimatedDuration: 90,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "matara": {
        busRoutes: ["2", "32", "350"], 
        estimatedDuration: 240,
        hasTrainService: true,
        trainLine: "Coastal Line",
        trainDuration: 210
    },
    "nuwara eliya": {
        busRoutes: ["47", "47-1"], 
        estimatedDuration: 300,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "anuradhapura": {
        busRoutes: ["15", "15-1", "57"], 
        estimatedDuration: 270,
        hasTrainService: true,
        trainLine: "Northern Line",
        trainDuration: 240
    },
    "elpitiya": {
        busRoutes: ["401"], 
        estimatedDuration: 240,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "jaffna": {
        busRoutes: ["15"], 
        estimatedDuration: 480,
        hasTrainService: true,
        trainLine: "Northern Line",
        trainDuration: 420
    },
    "ratnapura": {
        busRoutes: ["122", "122-1"], 
        estimatedDuration: 150,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "badulla": {
        busRoutes: ["99"], 
        estimatedDuration: 420,
        hasTrainService: true,
        trainLine: "Uva Line",
        trainDuration: 480
    },
    "trincomalee": {
        busRoutes: ["49", "49-1"], 
        estimatedDuration: 360,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "homagama": {
        busRoutes: ["177", "177-1", "138"], 
        estimatedDuration: 45,
        hasTrainService: true,
        trainLine: "Kelani Valley Line",
        trainDuration: 35
    },
    "kottawa": {
        busRoutes: ["177", "177-1"], 
        estimatedDuration: 40,
        hasTrainService: false,
        trainLine: (),
        trainDuration: ()
    },
    "maharagama": {
        busRoutes: ["177", "138"], 
        estimatedDuration: 35,
        hasTrainService: true,
        trainLine: "Kelani Valley Line",
        trainDuration: 25
    },
    "mount lavinia": {
        busRoutes: ["100", "115"], 
        estimatedDuration: 30,
        hasTrainService: true,
        trainLine: "Coastal Line",
        trainDuration: 25
    }
};

// Function to identify destination from coordinates
function identifyDestination(float lat, float lng) returns string {
    // Galle area
    if (lat >= 6.0 && lat <= 6.1 && lng >= 80.2 && lng <= 80.3) {
        return "galle";
    }
    // Elpitiya area (Southern Province inland) - Coordinates matching exact Elpitiya location
    if (lat >= 6.291 && lat <= 6.293 && lng >= 80.162 && lng <= 80.165) {
        return "elpitiya";
    }
    // Kandy area  
    if (lat >= 7.25 && lat <= 7.35 && lng >= 80.6 && lng <= 80.7) {
        return "kandy";
    }
    // Negombo area
    if (lat >= 7.2 && lat <= 7.3 && lng >= 79.8 && lng <= 79.9) {
        return "negombo";
    }
    // Matara area
    if (lat >= 5.9 && lat <= 6.0 && lng >= 80.5 && lng <= 80.6) {
        return "matara";
    }
    // Nuwara Eliya area
    if (lat >= 6.9 && lat <= 7.0 && lng >= 80.7 && lng <= 80.8) {
        return "nuwara eliya";
    }
    // Anuradhapura area
    if (lat >= 8.3 && lat <= 8.4 && lng >= 80.3 && lng <= 80.4) {
        return "anuradhapura";
    }
    // Jaffna area
    if (lat >= 9.6 && lat <= 9.7 && lng >= 80.0 && lng <= 80.1) {
        return "jaffna";
    }
    // Ratnapura area
    if (lat >= 6.6 && lat <= 6.7 && lng >= 80.3 && lng <= 80.4) {
        return "ratnapura";
    }
    // Badulla area
    if (lat >= 6.9 && lat <= 7.0 && lng >= 81.0 && lng <= 81.1) {
        return "badulla";
    }
    // Trincomalee area
    if (lat >= 8.5 && lat <= 8.6 && lng >= 81.2 && lng <= 81.3) {
        return "trincomalee";
    }
    // Homagama area
    if (lat >= 6.8 && lat <= 6.9 && lng >= 80.0 && lng <= 80.1) {
        return "homagama";
    }
    // Kottawa area
    if (lat >= 6.8 && lat <= 6.9 && lng >= 79.9 && lng <= 80.0) {
        return "kottawa";
    }
    // Maharagama area
    if (lat >= 6.8 && lat <= 6.9 && lng >= 79.9 && lng <= 80.0) {
        return "maharagama";
    }
    // Mount Lavinia area
    if (lat >= 6.8 && lat <= 6.9 && lng >= 79.8 && lng <= 79.9) {
        return "mount lavinia";
    }
    
    return "colombo"; // Default fallback
}

// Get route options between two locations
public function getRouteOptions(float fromLat, float fromLng, float toLat, float toLng) returns RouteOption[] {
    RouteOption[] options = [];
    
    // Identify destination
    string destination = identifyDestination(toLat, toLng);
    
    // Get route data for this destination
    RouteData? routeData = routeDatabase[destination];
    
    if (routeData is RouteData) {
        // Add bus options
        foreach string busRoute in routeData.busRoutes {
            options.push({
                id: "bus_route_" + busRoute,
                transportType: "bus",
                routeName: "Route " + busRoute + " to " + destination.substring(0, 1).toUpperAscii() + destination.substring(1),
                routeNumber: busRoute,
                estimatedDuration: routeData.estimatedDuration,
                walkingDistance: 200.0, // Assume 200m walk to bus stop
                stops: [],
                status: "on_time",
                delayMinutes: ()
            });
        }
        
        // Add train option if available
        if (routeData.hasTrainService && routeData.trainLine is string && routeData.trainDuration is int) {
            string trainLine = <string>routeData.trainLine;
            int trainDuration = <int>routeData.trainDuration;
            options.push({
                id: "train_" + destination,
                transportType: "train",
                routeName: trainLine + " to " + destination.substring(0, 1).toUpperAscii() + destination.substring(1),
                routeNumber: trainLine.substring(0, 3), // First 3 chars as route number for trains
                estimatedDuration: trainDuration,
                walkingDistance: 300.0, // Assume 300m walk to train station
                stops: [],
                status: "on_time",
                delayMinutes: ()
            });
        }
    } else {
        // Fallback for unknown destinations
        options.push({
            id: "route_general",
            transportType: "bus",
            routeName: "General Route",
            routeNumber: "100", // Default route number
            estimatedDuration: 90,
            walkingDistance: 200.0,
            stops: [],
            status: "on_time",
            delayMinutes: ()
        });
    }
    
    return options;
}

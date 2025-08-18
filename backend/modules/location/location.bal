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

// Get route options between two locations
public function getRouteOptions(float fromLat, float fromLng, float toLat, float toLng) returns RouteOption[] {
    Stop[] nearbyFromStops = getNearbyStops(fromLat, fromLng, 1000.0);
    Stop[] nearbyToStops = getNearbyStops(toLat, toLng, 1000.0);
    
    RouteOption[] options = [];
    
    // Generate some mock route options
    if (nearbyFromStops.length() > 0 && nearbyToStops.length() > 0) {
        // Bus option
        options.push({
            id: "route_bus_001",
            transportType: "bus",
            routeName: "Bus Route " + nearbyFromStops[0].routes[0],
            estimatedDuration: 45,
            walkingDistance: nearbyFromStops[0].distance,
            stops: [nearbyFromStops[0], nearbyToStops[0]],
            status: "on_time",
            delayMinutes: ()
        });
        
        // Train option (if train stops available)
        Stop[] trainStops = [];
        foreach Stop stop in nearbyFromStops {
            if (stop.stopType == "train") {
                trainStops.push(stop);
            }
        }
        
        if (trainStops.length() > 0) {
            options.push({
                id: "route_train_001", 
                transportType: "train",
                routeName: "Train - " + trainStops[0].routes[0],
                estimatedDuration: 35,
                walkingDistance: trainStops[0].distance,
                stops: trainStops,
                status: "delayed",
                delayMinutes: 5
            });
        }
    }
    
    return options;
}

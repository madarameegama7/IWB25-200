import ballerina/time;
import backend.location;

// Trip planning data types
public type TripPlan record {|
    string id;
    string fromLocation;
    string toLocation;
    time:Utc plannedDepartureTime;
    time:Utc? plannedArrivalTime;
    string tripType; // "one_way", "round_trip"
    string status; // "planned", "active", "completed", "cancelled"
    location:RouteOption[] routeOptions;
    time:Utc createdAt;
|};

public type ScheduleRequest record {|
    string fromLocation;
    string toLocation;
    string date; // YYYY-MM-DD format
    string time; // HH:MM format  
    string timeType; // "departure" or "arrival"
    string? tripType = "one_way";
|};

// Mock trip storage (in real app, this would be in database)
TripPlan[] userTrips = [];

// Create a new trip plan
public function createTripPlan(ScheduleRequest request) returns TripPlan|error {
    string tripId = string `trip_${time:monotonicNow()}`;
    
    // Parse date and time
    time:Civil civilTime = check time:civilFromString(request.date + "T" + request.time + ":00.000Z");
    time:Utc plannedTime = check time:utcFromCivil(civilTime);
    
    // Generate route options (mock data)
    location:RouteOption[] routeOptions = [
        {
            id: "route_option_1",
            transportType: "bus",
            routeName: "Express Bus Service",
            estimatedDuration: 60,
            walkingDistance: 200,
            stops: [],
            status: "on_time",
            delayMinutes: ()
        },
        {
            id: "route_option_2", 
            transportType: "train",
            routeName: "InterCity Express",
            estimatedDuration: 45,
            walkingDistance: 300,
            stops: [],
            status: "on_time",
            delayMinutes: ()
        }
    ];
    
    TripPlan newTrip = {
        id: tripId,
        fromLocation: request.fromLocation,
        toLocation: request.toLocation,
        plannedDepartureTime: request.timeType == "departure" ? plannedTime : time:utcNow(),
        plannedArrivalTime: request.timeType == "arrival" ? plannedTime : (),
        tripType: request.tripType ?: "one_way",
        status: "planned",
        routeOptions: routeOptions,
        createdAt: time:utcNow()
    };
    
    userTrips.push(newTrip);
    return newTrip;
}

// Get scheduled trips
public function getScheduledTrips() returns TripPlan[] {
    return userTrips;
}

// Get trip by ID
public function getTripById(string tripId) returns TripPlan? {
    foreach TripPlan trip in userTrips {
        if (trip.id == tripId) {
            return trip;
        }
    }
    return ();
}

// Update trip status
public function updateTripStatus(string tripId, string newStatus) returns TripPlan|error {
    foreach int i in 0 ..< userTrips.length() {
        if (userTrips[i].id == tripId) {
            TripPlan currentTrip = userTrips[i];
            userTrips[i] = {
                id: currentTrip.id,
                fromLocation: currentTrip.fromLocation,
                toLocation: currentTrip.toLocation,
                plannedDepartureTime: currentTrip.plannedDepartureTime,
                plannedArrivalTime: currentTrip.plannedArrivalTime,
                tripType: currentTrip.tripType,
                status: newStatus,
                routeOptions: currentTrip.routeOptions,
                createdAt: currentTrip.createdAt
            };
            return userTrips[i];
        }
    }
    return error("Trip not found");
}

// Get alternative routes for a trip
public function getAlternativeRoutes(string tripId) returns location:RouteOption[]|error {
    TripPlan? trip = getTripById(tripId);
    if (trip is ()) {
        return error("Trip not found");
    }
    
    // Generate alternative routes (mock data)
    location:RouteOption[] alternatives = [
        {
            id: "alt_route_1",
            transportType: "bus",
            routeName: "Alternate Bus Route",
            estimatedDuration: 75,
            walkingDistance: 150,
            stops: [],
            status: "on_time",
            delayMinutes: ()
        },
        {
            id: "alt_route_2",
            transportType: "combined", 
            routeName: "Bus + Train Connection",
            estimatedDuration: 55,
            walkingDistance: 400,
            stops: [],
            status: "delayed",
            delayMinutes: 10
        }
    ];
    
    return alternatives;
}

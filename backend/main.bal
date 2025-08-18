import ballerina/http;
import backend.schedules as schedules;
import backend.predictions as predictions;
import backend.alerts as alerts;
import backend.location as location;
import backend.trips as trips;

// Create listener on port 8083
listener http:Listener backendEP = new(8083);

// Service-level CORS config applies globally to all resources
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowMethods: ["GET", "POST"],
        allowCredentials: false,
        allowHeaders: ["CORELATION_ID"],
        exposeHeaders: ["X-CUSTOM-HEADER"],
        maxAge: 84900
    }
}
service / on backendEP {

    // Section 1: Real-Time Journey Planning APIs
    
    // Get nearby stops based on current location
    resource function get location/nearbyStops(http:Caller caller, http:Request req, 
                                                    float lat, float lng, float? radius) returns error? {
        location:Stop[] nearbyStops = location:getNearbyStops(lat, lng, radius);
        json response = {
            "status": "success",
            "data": nearbyStops,
            "count": nearbyStops.length()
        };
        check caller->respond(response);
    }
    
    // Get route options between two points
    resource function get routes/options(http:Caller caller, http:Request req,
                                       float fromLat, float fromLng, float toLat, float toLng) returns error? {
        location:RouteOption[] routes = location:getRouteOptions(fromLat, fromLng, toLat, toLng);
        json response = {
            "status": "success", 
            "data": routes,
            "count": routes.length()
        };
        check caller->respond(response);
    }

    // Get bus schedule for specific stop and route
    resource function get bus/schedule(http:Caller caller, http:Request req,
                                     string stop_id, string? route) returns error? {
        json data = schedules:getSchedules();
        json response = {
            "status": "success",
            "data": data,
            "stop_id": stop_id,
            "route": route
        };
        check caller->respond(response);
    }

    // Get train schedule between stations
    resource function get train/schedule(http:Caller caller, http:Request req,
                                       string from_station, string to_station) returns error? {
        json data = schedules:getSchedules();
        json response = {
            "status": "success", 
            "data": data,
            "from_station": from_station,
            "to_station": to_station
        };
        check caller->respond(response);
    }

    // Get real-time delays
    resource function get realtime/delays(http:Caller caller, http:Request req,
                                        string transport_type, string route_id) returns error? {
        json data = predictions:getPredictions();
        json response = {
            "status": "success",
            "data": data,
            "transport_type": transport_type,
            "route_id": route_id
        };
        check caller->respond(response);
    }

    // Section 2: Advanced Journey Planning APIs
    
    // Create new trip plan
    resource function post trips/plan(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        
        trips:ScheduleRequest scheduleReq = check payload.cloneWithType(trips:ScheduleRequest);
        trips:TripPlan|error tripResult = trips:createTripPlan(scheduleReq);
        
        if (tripResult is error) {
            json errorResponse = {
                "status": "error",
                "message": tripResult.message()
            };
            check caller->respond(errorResponse);
        } else {
            json response = {
                "status": "success",
                "data": tripResult
            };
            check caller->respond(response);
        }
    }

    // Get scheduled trips
    resource function get trips/schedule(http:Caller caller, http:Request req,
                                       string? date, string? time) returns error? {
        trips:TripPlan[] scheduledTrips = trips:getScheduledTrips();
        json response = {
            "status": "success",
            "data": scheduledTrips,
            "count": scheduledTrips.length()
        };
        check caller->respond(response);
    }

    // Get alternative routes for a trip
    resource function get routes/alternatives(http:Caller caller, http:Request req, string trip_id) returns error? {
        location:RouteOption[]|error alternatives = trips:getAlternativeRoutes(trip_id);
        
        if (alternatives is error) {
            json errorResponse = {
                "status": "error",
                "message": alternatives.message()
            };
            check caller->respond(errorResponse);
        } else {
            json response = {
                "status": "success",
                "data": alternatives
            };
            check caller->respond(response);
        }
    }

    // Subscribe to notifications (mock endpoint)
    resource function post notifications/subscribe(http:Caller caller, http:Request req) returns error? {
        json payload = check req.getJsonPayload();
        json response = {
            "status": "success",
            "message": "Successfully subscribed to notifications",
            "subscription_data": payload
        };
        check caller->respond(response);
    }

    // Get delay status for specific route and date
    resource function get delays/status(http:Caller caller, http:Request req,
                                      string route_id, string? date) returns error? {
        json data = alerts:getAlerts();
        json response = {
            "status": "success",
            "data": data,
            "route_id": route_id,
            "date": date
        };
        check caller->respond(response);
    }

    // Legacy endpoints (keeping for backward compatibility)
    resource function get schedules(http:Caller caller, http:Request req) returns error? {
        json data = schedules:getSchedules();
        check caller->respond(data);
    }

    resource function get predictions(http:Caller caller, http:Request req) returns error? {
        json data = predictions:getPredictions();
        check caller->respond(data);
    }

    resource function get alerts(http:Caller caller, http:Request req) returns error? {
        json data = alerts:getAlerts();
        check caller->respond(data);
    }
}

import ballerina/http;

// Define an HTTP service on port 8080
service /hello on new http:Listener(8080) {
    // Resource function that responds to GET requests
    resource function get sayHi() returns string {
        return "Hello, Ballerina!";
    }
}

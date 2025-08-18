import ballerina/http;

# HTTP listener instance for all services
public final http:Listener apiListener = check new (8080);

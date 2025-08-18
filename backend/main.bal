import ballerina/http;
import backend.auth as _;

public final http:Listener httpListener = check new (8080);

public function main() returns error? {
    // The auth service will start automatically when the listener is ready
}

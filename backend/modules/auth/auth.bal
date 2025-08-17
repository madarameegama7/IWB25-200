import ballerina/http;
import ballerina/jwt;
import ballerina/crypto;
import ballerina/time;
import ballerina/log;
import ballerinax/postgresql;
import ballerina/sql;
import ballerina/lang.'string as strings;

# Configuration

configurable string dbHost = "localhost";
configurable int dbPort = 5432;
configurable string dbUser = "postgres";
configurable string dbPassword = "1234";
configurable string dbName = "uniconnect";

configurable string JWT_ISSUER = "uniconnect-issuer";
configurable string JWT_AUDIENCE = "uniconnect-clients";
configurable string JWT_KEY_ID = "key-1";
configurable string JWT_SECRET = "super_secret_change_me";
configurable int JWT_EXPIRY_SECONDS = 3600;

# Database client
final postgresql:Client dbClient = check new (
    host = dbHost,
    port = dbPort,
    username = dbUser,
    password = dbPassword,
    database = dbName
);

# Represents an error response with a message
# + message - The error message
type ErrorResponseBody record {|
    string message;
|};

# Represents a success response with a message
# + message - The success message
type SuccessResponseBody record {|
    string message;
|};

# Represents a login response containing JWT token and user info
# + token - The JWT token
# + role - The user's role
# + name - The user's name
type LoginResponseBody record {|
    string token;
    string role;
    string name;
|};

# Represents a token validation response
# + isValid - Whether the token is valid
type ValidationResponseBody record {|
    boolean isValid;
|};

# Represents a user registration request
# + name - The user's full name
# + email - The user's email address
# + password - The user's password
# + role - The user's role (student/faculty/admin)
type RegisterRequest record {|
    string name;
    string email;
    string password;
    string role;
|};

# Represents a login request
# + email - The user's email address
# + password - The user's password
type LoginRequest record {|
    string email;
    string password;
|};

# Represents a user in the database
# + name - The user's full name
# + email - The user's email address
# + password_hash - The hashed password
# + password_salt - The salt used for password hashing
# + role - The user's role
type User record {|
    string name;
    string email;
    string password_hash;
    string password_salt;
    string role;
|};

# Represents a service health check response
# + ok - Whether the service is healthy
# + serviceType - The type of the service
type ServiceResponseBody record {|
    boolean ok;
    string serviceType;
|};

# Hashes a password with a salt using SHA-256
# + password - The password to hash
# + salt - The salt to use for hashing
# + return - The hashed password as a hex string
function hashPassword(string password, string salt) returns string {
    byte[] input = (password + salt).toBytes();
    byte[] hash = crypto:hashSha256(input);
    return hash.toBase16();
}

# Validates a password against a stored hash and salt
# + password - The password to validate
# + hash - The stored hash to compare against
# + salt - The salt used in the original hash
# + return - True if password matches, false otherwise
function validatePassword(string password, string hash, string salt) returns boolean {
    string attemptHash = hashPassword(password, salt);
    return attemptHash == hash;
}

# Generates a JWT token for a user
# + user - The user to generate a token for
# + return - JWT token string or error if generation fails
function generateJwt(User user) returns string|error {
    [int, decimal] currentTime = time:utcNow();
    decimal expTime = <decimal>(currentTime[0] + JWT_EXPIRY_SECONDS);
    
    map<json> claims = {
        "sub": user.email,
        "name": user.name,
        "role": user.role,
        "exp": expTime,
        "iat": <decimal>currentTime[0]
    };

    jwt:IssuerConfig issuerConfig = {
        issuer: JWT_ISSUER,
        username: user.email,
        expTime: expTime,
        customClaims: claims
    };

    return jwt:issue(issuerConfig);
}

# Validates a JWT token
# + token - The JWT token to validate
# + return - JWT payload if valid, error if validation fails
function validateJwt(string token) returns jwt:Payload|error {
    jwt:ValidatorConfig validatorConfig = {
        issuer: JWT_ISSUER,
        "clockSkew": 0
    };

    return jwt:validate(token, validatorConfig);
}

service /auth on new http:Listener(8080) {

    # Health check endpoint
    # + return - Service health status response
    resource function get ping() returns ServiceResponseBody {
        return { ok: true, serviceType: "auth" };
    }

    # Sign up new user
    # + req - The HTTP request containing user registration data
    # + return - Created response on success, error responses on failure
    resource function post signup(http:Request req) returns http:Created|http:BadRequest|http:Conflict|http:InternalServerError {
        json|error bodyJ = req.getJsonPayload();
        if bodyJ is error {
            return <http:BadRequest>{ body: { errorMessage: "Invalid JSON" } };
        }

        map<json>|error bodyMap = bodyJ.ensureType();
        if bodyMap is error {
            return <http:BadRequest>{ 
                body: { "errorMessage": "Invalid request format" } 
            };
        }

        json|error name = bodyMap["name"];
        json|error email = bodyMap["email"];
        json|error password = bodyMap["password"];
        json|error role = bodyMap["role"];

        if name is error || email is error || password is error {
            return <http:BadRequest>{ 
                body: { "errorMessage": "Missing required fields" } 
            };
        }

        string nameStr = name.toString();
        string emailStr = email.toString();
        string passwordStr = password.toString();
        string roleStr = role is error ? "student" : role.toString();

        if nameStr.length() == 0 || emailStr.length() == 0 || passwordStr.length() == 0 {
            return <http:BadRequest>{ body: { "error": "name, email, password required" } };
        }
        if roleStr != "student" && roleStr != "faculty" && roleStr != "admin" {
            return <http:BadRequest>{ body: { "error": "invalid role" } };
        }

        // Generate salt by concatenating current timestamp and input string
        string timeString = time:utcNow()[0].toString();
        byte[] salt = crypto:hashSha256((nameStr + emailStr + timeString).toBytes());
        string saltHex = salt.toBase16();

        // Hash password with salt
        string passwordHash = hashPassword(passwordStr, saltHex);

        // Insert user
        sql:ExecutionResult|sql:Error dbResult = dbClient->execute(`
            INSERT INTO users (name, email, password_hash, password_salt, role)
            VALUES (${nameStr}, ${emailStr}, ${passwordHash}, ${saltHex}, ${roleStr})
        `);

        if dbResult is sql:Error {
            string msg = dbResult.message();
            // Likely duplicate email
            if strings:includes(msg, "duplicate key") || strings:includes(msg, "unique") {
                ErrorResponseBody errorBody = { message: "Email already exists" };
                return <http:Conflict>{ body: errorBody };
            }
            log:printError("DB error on signup", dbResult);
            ErrorResponseBody errorBody = { message: "Database error" };
            return <http:InternalServerError>{ body: errorBody };
        }

        SuccessResponseBody successBody = { message: "User registered successfully" };
        return <http:Created>{ body: successBody };
    }

    // Login, returns JWT
    resource function post login(http:Request req) returns http:Ok|http:Unauthorized|http:BadRequest|http:InternalServerError {
        json|error bodyJ = req.getJsonPayload();
        if bodyJ is error {
            ErrorResponseBody errorBody = { message: "Invalid JSON" };
            return <http:BadRequest>{ body: errorBody };
        }

        map<json>|error bodyMap = bodyJ.ensureType();
        if bodyMap is error {
            ErrorResponseBody errorBody = { message: "Invalid request format" };
            return <http:BadRequest>{ body: errorBody };
        }

        json|error email = bodyMap["email"];
        json|error password = bodyMap["password"];

        if email is error || password is error {
            ErrorResponseBody errorBody = { message: "Email and password required" };
            return <http:BadRequest>{ body: errorBody };
        }

        string emailStr = email.toString();
        string passwordStr = password.toString();

        if emailStr == "" || passwordStr == "" {
            ErrorResponseBody errorBody = { message: "Email and password required" };
            return <http:BadRequest>{ body: errorBody };
        }

        stream<User, sql:Error?> userStream = dbClient->query(`SELECT * FROM users WHERE email = ${emailStr}`);
        record {|User value;|}|sql:Error? result = userStream.next();

        if result is sql:Error {
            log:printError("DB error on login", result);
            ErrorResponseBody errorBody = { message: "Database error" };
            return <http:InternalServerError>{ body: errorBody };
        }

        if result is () {
            ErrorResponseBody errorBody = { message: "Invalid credentials" };
            return <http:Unauthorized>{ body: errorBody };
        }

        User user = result.value;
        if !validatePassword(passwordStr, user.password_hash, user.password_salt) {
            ErrorResponseBody errorBody = { message: "Invalid credentials" };
            return <http:Unauthorized>{ body: errorBody };
        }

        string|error jwt = generateJwt(user);
        if jwt is error {
            log:printError("Error generating JWT", jwt);
            ErrorResponseBody errorBody = { message: "Error generating token" };
            return <http:InternalServerError>{ body: errorBody };
        }

        LoginResponseBody response = {
            token: jwt,
            role: user.role,
            name: user.name
        };

        return <http:Ok>{
            body: response,
            headers: {
                "Authorization": "Bearer " + jwt
            }
        };
    }

    // Protected endpoint: requires Authorization: Bearer <token>
    resource function get me(@http:Header {name: "Authorization"} string? authorization) returns http:Ok|http:Unauthorized {
        if authorization is () {
            ErrorResponseBody errorBody = { message: "Missing token" };
            return <http:Unauthorized>{ body: errorBody };
        }

        if !authorization.startsWith("Bearer ") {
            ErrorResponseBody errorBody = { message: "Invalid token format" };
            return <http:Unauthorized>{ body: errorBody };
        }

        string token = authorization.substring(7);
        jwt:Payload|error payload = validateJwt(token);
        
        if payload is error {
            log:printError("Error validating JWT", payload);
            ErrorResponseBody errorBody = { message: "Invalid or expired token" };
            return <http:Unauthorized>{ body: errorBody };
        }

        // Get the email from subject
        string email = payload.sub ?: "";

        record {| string sub; string name; string role; |} response = {
            sub: email,
            name: "",
            role: ""
        };

        return <http:Ok>{ body: response };
    }
}

## ADDED Requirements

### Requirement: Admin login emits JWT access token
The system MUST expose an admin authentication endpoint that validates admin credentials and returns a signed JWT access token for successful logins.

#### Scenario: Login succeeds with valid credentials
- **WHEN** an admin submits valid credentials to the login endpoint
- **THEN** the API SHALL return `200` with an `accessToken` JWT and expiration metadata

#### Scenario: Login fails with invalid credentials
- **WHEN** an admin submits invalid credentials
- **THEN** the API MUST return `401` without exposing whether username or password was wrong

### Requirement: JWT token validation guards admin operations
The system MUST validate bearer JWT tokens for admin-protected endpoints and reject requests with missing, expired, or malformed tokens.

#### Scenario: Valid bearer token grants access
- **WHEN** a request to an admin-protected endpoint includes a valid bearer JWT
- **THEN** the API SHALL process the request normally

#### Scenario: Missing bearer token is rejected
- **WHEN** a request to an admin-protected endpoint omits the `Authorization` bearer token
- **THEN** the API MUST return `401`

#### Scenario: Invalid or expired token is rejected
- **WHEN** a request includes an invalid or expired bearer JWT
- **THEN** the API MUST return `401`

### Requirement: Auth configuration is mandatory at startup
The system MUST require JWT and admin bootstrap configuration values to be present before serving requests.

#### Scenario: Missing auth configuration blocks startup
- **WHEN** required auth environment variables are missing or empty
- **THEN** the service MUST fail startup with a clear configuration error

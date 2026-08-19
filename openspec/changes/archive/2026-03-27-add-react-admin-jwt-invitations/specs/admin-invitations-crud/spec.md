## MODIFIED Requirements

### Requirement: Admin can create invitations
The system MUST expose an admin endpoint to create invitations with token and RSVP-related attributes, and it MUST require a valid admin JWT bearer token.

#### Scenario: Create invitation with valid payload
- **WHEN** an authenticated admin client submits a valid create invitation request
- **THEN** the API SHALL persist a new invitation and return its identifier and token metadata
- **AND** the system SHALL materialize invitee rows associated to that invitation according to the requested guest capacity

#### Scenario: Create invitation validates required fields
- **WHEN** an authenticated admin client submits a create request with missing or invalid required fields
- **THEN** the API MUST return a validation error response

#### Scenario: Create invitation without valid token is rejected
- **WHEN** a client calls the create invitation endpoint without a valid admin bearer token
- **THEN** the API MUST return `401`

### Requirement: Admin can list and retrieve invitations
The system MUST expose admin endpoints to list invitations and retrieve one invitation by identifier, and it MUST require a valid admin JWT bearer token.

#### Scenario: List invitations returns collection
- **WHEN** an authenticated admin client requests the invitation list endpoint
- **THEN** the API SHALL return a collection of stored invitations

#### Scenario: Retrieve invitation by identifier
- **WHEN** an authenticated admin client requests an existing invitation identifier
- **THEN** the API SHALL return invitation details

#### Scenario: List or retrieve without valid token is rejected
- **WHEN** a client calls list or retrieve admin invitation endpoints without a valid admin bearer token
- **THEN** the API MUST return `401`

### Requirement: Admin can update and delete invitations
The system MUST expose admin endpoints to update invitation fields and delete invitations, and it MUST require a valid admin JWT bearer token.

#### Scenario: Update invitation persists changed fields
- **WHEN** an authenticated admin client sends a valid update request for an existing invitation
- **THEN** the API SHALL persist and return updated invitation data

#### Scenario: Delete invitation removes resource
- **WHEN** an authenticated admin client sends delete for an existing invitation
- **THEN** the API SHALL remove the invitation and return a successful deletion response

#### Scenario: Update or delete without valid token is rejected
- **WHEN** a client calls update or delete admin invitation endpoints without a valid admin bearer token
- **THEN** the API MUST return `401`

## REMOVED Requirements

### Requirement: Admin endpoints are intentionally unauthenticated in v1
**Reason**: Admin CRUD now requires authenticated access with JWT to prevent unauthorized invitation management.
**Migration**: Clients MUST authenticate first and send `Authorization: Bearer <token>` on every admin invitation request.

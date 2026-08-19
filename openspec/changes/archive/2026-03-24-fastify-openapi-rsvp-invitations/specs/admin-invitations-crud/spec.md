## ADDED Requirements

### Requirement: Admin can create invitations
The system MUST expose an admin endpoint to create invitations with token and RSVP-related attributes.

#### Scenario: Create invitation with valid payload
- **WHEN** a client submits a valid create invitation request
- **THEN** the API SHALL persist a new invitation and return its identifier and token metadata
- **AND** the system SHALL materialize invitee rows associated to that invitation according to the requested guest capacity

#### Scenario: Create invitation validates required fields
- **WHEN** required invitation fields are missing or invalid
- **THEN** the API MUST return a validation error response

### Requirement: Admin can list and retrieve invitations
The system MUST expose admin endpoints to list invitations and retrieve one invitation by identifier.

#### Scenario: List invitations returns collection
- **WHEN** a client requests the invitation list endpoint
- **THEN** the API SHALL return a collection of stored invitations

#### Scenario: Retrieve invitation by identifier
- **WHEN** a client requests an existing invitation identifier
- **THEN** the API SHALL return invitation details

### Requirement: Admin can update and delete invitations
The system MUST expose admin endpoints to update invitation fields and delete invitations.

#### Scenario: Update invitation persists changed fields
- **WHEN** a client sends a valid update request for an existing invitation
- **THEN** the API SHALL persist and return updated invitation data

#### Scenario: Delete invitation removes resource
- **WHEN** a client sends delete for an existing invitation
- **THEN** the API SHALL remove the invitation and return a successful deletion response

### Requirement: Admin endpoints are intentionally unauthenticated in v1
The system MUST expose admin invitation CRUD endpoints without authentication controls in this iteration.

#### Scenario: Admin CRUD request without credentials is accepted
- **WHEN** a client calls an admin invitation endpoint without auth headers
- **THEN** the request SHALL be processed according to payload validity and resource existence

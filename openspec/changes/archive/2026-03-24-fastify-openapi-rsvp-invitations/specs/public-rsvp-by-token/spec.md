## ADDED Requirements

### Requirement: Public invitation can be resolved by token
The system MUST provide a public endpoint that retrieves invitation RSVP context using an invitation token without requiring user authentication.

#### Scenario: Valid token returns public invitation context
- **WHEN** a client requests invitation data with a valid token
- **THEN** the API SHALL return invitation context needed to complete RSVP

#### Scenario: Unknown token returns not found
- **WHEN** a client requests invitation data with a token that does not exist
- **THEN** the API MUST return a not-found error response

### Requirement: Public RSVP can be submitted by token
The system MUST provide a public endpoint that records RSVP choice for the invitation associated with a valid token.

#### Scenario: RSVP submission succeeds for valid token
- **WHEN** a client submits RSVP payload with a valid token and valid body
- **THEN** the API SHALL persist the RSVP and return a success response
- **AND** persisted invitee rows SHALL store per-invitee attendance and message values

#### Scenario: RSVP submission rejects invalid payload
- **WHEN** a client submits RSVP with missing or invalid required fields
- **THEN** the API MUST return a validation error response and SHALL NOT persist changes

### Requirement: Public token endpoints minimize sensitive data exposure
The system MUST return only public-safe invitation fields for token-based responses.

#### Scenario: Sensitive admin fields are excluded
- **WHEN** a valid token lookup response is returned
- **THEN** the payload SHALL NOT include internal metadata such as admin notes or persistence-only audit fields

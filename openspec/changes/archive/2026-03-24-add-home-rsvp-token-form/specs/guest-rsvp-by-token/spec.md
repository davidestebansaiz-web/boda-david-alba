## ADDED Requirements

### Requirement: Home page RSVP flow accepts token from URL or manual entry
The system MUST expose an RSVP entry flow on the home page where users can provide the invitation token either by scanning a QR URL (token in URL) or by typing the token manually.

#### Scenario: User lands with token in URL
- **WHEN** a user opens the home page with a valid token present in the configured URL location
- **THEN** the token input SHALL be prefilled and token validation SHALL be triggered automatically
- **AND** the user SHALL be routed to the invitee RSVP step without manually submitting the token form

#### Scenario: User enters token manually
- **WHEN** a user types a token in the home page input and requests validation
- **THEN** the system SHALL validate the token through the public API and continue only if the token is valid

#### Scenario: Invalid URL token allows manual retry
- **WHEN** a user opens the home page with a token in URL and automatic validation fails
- **THEN** the system MUST keep the user in the token step
- **AND** the user SHALL be able to edit/retry token validation manually

### Requirement: Token validation returns invitee rows for RSVP
The system MUST retrieve all invitees associated with the provided token and render one RSVP row per invitee before submission.

#### Scenario: Valid token returns invitee list
- **WHEN** token validation succeeds
- **THEN** the RSVP form SHALL display one row per invitee associated with that token

#### Scenario: Invalid token blocks RSVP form
- **WHEN** token validation fails because the token does not exist or is malformed
- **THEN** the system MUST keep the user in the token step and show a recoverable validation error

#### Scenario: Frontend consumes public invitee response DTO shape
- **WHEN** token validation returns `currentResponses`
- **THEN** each row SHALL be mapped by `inviteeId` and hydrated in the UI using `attending` and `note` values

### Requirement: RSVP row captures attendance choice and optional note per invitee
Each invitee row MUST include an attendance radio group with options `asistiré` and `no asistiré`, plus an optional free-text note input that can be submitted independently for that invitee.

#### Scenario: User sets mixed invitee responses
- **WHEN** a token has multiple invitees and the user marks attendance differently across rows
- **THEN** the form SHALL preserve each invitee radio selection independently and map it to the API boolean attendance value

#### Scenario: Invitee note is omitted
- **WHEN** a user leaves an invitee note empty
- **THEN** the system MUST accept submission without requiring that note

### Requirement: Submission persists per-invitee responses and redirects to success
The system MUST submit all invitee responses in a single API request and redirect to a success view only after the API confirms persistence.

#### Scenario: Successful submission redirects user
- **WHEN** the API accepts the RSVP payload for all invitees
- **THEN** the user SHALL be redirected to a success view

#### Scenario: Submission failure keeps editable form
- **WHEN** the API returns an error during submission
- **THEN** the system MUST keep the user on the RSVP form with entered values preserved for retry

#### Scenario: Frontend sends API contract field names
- **WHEN** the invitee form is submitted
- **THEN** the payload SHALL use `invitees[]` items with `inviteeId`, `attending`, and `note`
- **AND** note persistence in backend storage (for example internal `message` columns) SHALL remain transparent to the frontend contract

### Requirement: Frontend RSVP flow separates rendering from orchestration
The frontend implementation MUST encapsulate RSVP business orchestration in dedicated hooks, use schema-validated React Hook Form instances for token and invitee forms, and execute API calls through React Query mutations.

#### Scenario: Token and invitee forms are schema validated
- **WHEN** the user submits either token form or invitee form with invalid data
- **THEN** the UI SHALL display validation feedback from the schema without bypassing the configured form layer

#### Scenario: Token validation and RSVP submission use query mutation workflow
- **WHEN** token validation or RSVP submission is triggered
- **THEN** the frontend SHALL execute those requests through React Query mutation handlers and reflect pending/error/success states in the UI

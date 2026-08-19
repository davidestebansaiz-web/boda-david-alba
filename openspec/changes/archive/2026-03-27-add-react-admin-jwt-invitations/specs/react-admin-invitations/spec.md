## ADDED Requirements

### Requirement: React Admin runs as a separate project from guest frontend
The system MUST implement the admin experience in a dedicated frontend project that coexists with the guest-facing frontend without migrating or replacing it.

#### Scenario: Admin and guest frontends coexist
- **WHEN** the change is implemented
- **THEN** the React Admin application SHALL be delivered as a separate project
- **AND** the guest frontend (`boda-alba-david`) SHALL remain available without migration to React Admin

### Requirement: React Admin app provides credential login flow
The system MUST provide a dedicated React Admin login screen that authenticates against the admin login API and establishes a local authenticated session.

#### Scenario: Successful login enters admin area
- **WHEN** an admin submits valid credentials from the React Admin login form
- **THEN** the app SHALL persist the returned JWT token and navigate to the invitations list view

#### Scenario: Failed login keeps user on login view
- **WHEN** the API rejects submitted credentials
- **THEN** the app MUST remain on login view and show a recoverable authentication error

### Requirement: React Admin lists invitations from protected API
The system MUST render a paginated/sortable invitation list in React Admin using admin-protected API endpoints with bearer token authentication.

#### Scenario: Authenticated admin can load invitation list
- **WHEN** an authenticated admin opens the invitations list view
- **THEN** the app SHALL call the API with `Authorization: Bearer <token>` and render invitation rows from the response

#### Scenario: Unauthorized list response returns to login
- **WHEN** the API list request returns `401`
- **THEN** the app MUST clear local session and redirect to login

### Requirement: React Admin edits invitation records
The system MUST provide an invitation edit form that loads existing invitation data and persists updates through the protected API.

#### Scenario: Admin edits and saves invitation
- **WHEN** an authenticated admin updates editable invitation fields and submits the form
- **THEN** the app SHALL call the API update endpoint and show updated values after successful response

#### Scenario: API validation error keeps editable form state
- **WHEN** the API rejects an invitation update due to validation errors
- **THEN** the app MUST keep the form open with entered values and display the validation error

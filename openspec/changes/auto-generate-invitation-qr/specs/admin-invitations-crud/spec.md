## ADDED Requirements

### Requirement: Admin create invitation response includes QR metadata
The system MUST include QR metadata in admin invitation payloads so admins can consume the generated QR immediately after creating an invitation.

#### Scenario: Create invitation returns default QR data
- **WHEN** an authenticated admin creates a valid invitation
- **THEN** the API SHALL return invitation data including `qrTargetUrl`, QR renderable payload, and QR last-generation timestamp

#### Scenario: List and get invitation include QR data
- **WHEN** an authenticated admin requests list or detail of invitations
- **THEN** each returned invitation SHALL include current QR metadata consistent with persisted invitation state

### Requirement: Admin update invitation can override QR URL and regenerate QR
The system MUST allow admin update operations to set a new `qrTargetUrl` and MUST support explicit QR regeneration in the same update workflow.

#### Scenario: Update invitation with new QR URL regenerates QR
- **WHEN** an authenticated admin updates invitation data including a valid `qrTargetUrl`
- **THEN** the API SHALL persist the new URL and return regenerated QR metadata for that URL

#### Scenario: Explicit regenerate uses existing QR URL
- **WHEN** an authenticated admin requests regeneration without changing `qrTargetUrl`
- **THEN** the API SHALL regenerate QR metadata for the currently stored QR URL

#### Scenario: Invalid QR URL is rejected
- **WHEN** an authenticated admin submits an invalid QR target URL in create or update
- **THEN** the API MUST return a validation error response

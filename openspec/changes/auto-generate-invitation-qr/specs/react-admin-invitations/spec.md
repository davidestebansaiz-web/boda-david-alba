## ADDED Requirements

### Requirement: React Admin displays QR metadata in invitation views
The admin frontend MUST display invitation QR metadata so operators can validate the target URL and reuse the generated QR without leaving the app.

#### Scenario: Invitation edit view shows current QR URL and preview
- **WHEN** an authenticated admin opens an invitation edit view
- **THEN** the UI SHALL display the current `qrTargetUrl` and a renderable QR preview from API data

### Requirement: React Admin allows QR URL override and regeneration
The admin frontend MUST allow editing the invitation QR URL and requesting regeneration while preserving existing invitation edit behavior.

#### Scenario: Admin updates QR URL and saves changes
- **WHEN** an authenticated admin edits `qrTargetUrl` and submits the form
- **THEN** the frontend SHALL call the protected update endpoint and refresh the QR preview from returned data

#### Scenario: Admin triggers explicit QR regeneration
- **WHEN** an authenticated admin requests QR regeneration without changing other fields
- **THEN** the frontend SHALL call update with regeneration intent and render the new QR metadata on success

#### Scenario: QR validation error keeps editable state
- **WHEN** the API rejects a QR URL change with validation errors
- **THEN** the frontend MUST keep the form editable with entered values and show a recoverable error

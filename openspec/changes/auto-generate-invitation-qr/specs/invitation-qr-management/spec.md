## ADDED Requirements

### Requirement: Invitation QR target URL defaults from environment
The system MUST require a `WEDDING_WEBSITE_BASE_URL` configuration value and MUST derive the default invitation QR target URL as `<WEDDING_WEBSITE_BASE_URL>?token=<invitation-token>`.

#### Scenario: Default target URL is built on invitation creation
- **WHEN** an authenticated admin creates an invitation without a QR URL override
- **THEN** the system SHALL persist a `qrTargetUrl` composed from configured base URL with `token` query param containing the final invitation token

#### Scenario: Missing base URL blocks startup
- **WHEN** the API starts without `WEDDING_WEBSITE_BASE_URL`
- **THEN** startup MUST fail with an actionable configuration error before serving requests

### Requirement: Invitation QR artifact is generated and can be regenerated
The system MUST generate a QR artifact associated with each invitation and MUST refresh it whenever regeneration is requested or the QR target URL changes.

#### Scenario: QR artifact is generated after invitation creation
- **WHEN** an invitation is created successfully
- **THEN** the system SHALL store and return QR metadata that can be rendered by admin clients

#### Scenario: QR artifact is regenerated after target change
- **WHEN** an admin updates the invitation QR target URL and requests regeneration
- **THEN** the system SHALL persist a refreshed QR artifact representing the new target URL

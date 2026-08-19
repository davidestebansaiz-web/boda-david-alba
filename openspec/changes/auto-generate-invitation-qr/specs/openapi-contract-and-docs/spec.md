## ADDED Requirements

### Requirement: OpenAPI documents QR fields for admin invitations
The system MUST document QR-related fields in admin invitation schemas so API consumers can rely on stable contract names and types.

#### Scenario: Admin invitation schema includes QR metadata
- **WHEN** developers inspect the `AdminInvitation` schema in `openapi.yaml`
- **THEN** the schema SHALL include fields for QR target URL and QR renderable content metadata

#### Scenario: Admin update schema supports QR override and regeneration
- **WHEN** developers inspect `AdminInvitationUpdateRequest` in `openapi.yaml`
- **THEN** the schema SHALL include optional fields to override `qrTargetUrl` and request QR regeneration

### Requirement: Local runbook documents QR base URL configuration
The system MUST document the environment variable used to generate default invitation QR URLs.

#### Scenario: README includes QR base URL env var
- **WHEN** developers follow local setup instructions
- **THEN** documentation SHALL define `WEDDING_WEBSITE_BASE_URL` and describe how default QR URLs are composed as `<base-url>?token=<invitation-token>`

## 1. API Contract and Backend RSVP Model

- [x] 1.1 Update `wedding-api/openapi.yaml` public token schemas to represent invitee lists in context and per-invitee RSVP submission payloads
- [x] 1.2 Add/adjust domain and application DTOs/use cases to validate and process invitee-level attendance and optional notes atomically
- [x] 1.3 Update persistence layer (Prisma schema/repository + migration if needed) to store per-invitee RSVP details linked to invitation token
- [x] 1.4 Add/adjust HTTP presenters and operation handlers so public token endpoints return and accept the new invitee-level contract

## 2. Frontend RSVP Flow on Home Page

- [x] 2.1 Create a home-page RSVP component with token input state that supports URL token extraction, auto-validation on entry, and manual token entry fallback
- [x] 2.2 Implement frontend API adapter methods for token validation/context fetch and invitee-level RSVP submission
- [x] 2.3 Build invitee rows UI (one row per invitee) with attendance radio options (`asistiré` / `no asistiré`) and optional textarea, preserving per-row state across validation errors
- [x] 2.4 Implement submit flow with loading/error handling and redirect to a success view after successful API response

## 3. Integration Validation and Regression Safety

- [x] 3.1 Add backend tests for valid/invalid token resolution and invitee-level RSVP submission validation rules
- [x] 3.2 Add frontend tests (or equivalent component/integration checks) for URL token auto-validation, manual token flow, mixed invitee responses, and submit error recovery
- [x] 3.3 Run end-to-end local smoke checks for both token entry paths and verify success redirection from the home page
- [x] 3.4 Document the RSVP flow contract and runbook updates needed for local development and QA validation

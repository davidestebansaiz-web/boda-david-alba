## ADDED Requirements

### Requirement: OpenAPI YAML is the API source of truth
The system MUST define the HTTP API contract in a committed `openapi.yaml` file that describes public RSVP and admin invitation endpoints, including request/response schemas and error responses.

#### Scenario: Contract includes all v1 endpoints
- **WHEN** developers review `openapi.yaml`
- **THEN** the file SHALL include operations for public RSVP by token and admin invitation CRUD

#### Scenario: Contract has explicit schema validation shapes
- **WHEN** a request or response payload is documented in `openapi.yaml`
- **THEN** the corresponding schema SHALL define required fields, field types, and validation constraints

#### Scenario: Public RSVP contract is stable for frontend integration
- **WHEN** the frontend integrates with token lookup and RSVP submission endpoints
- **THEN** the documented request/response DTOs SHALL include per-invitee fields `inviteeId`, `attending`, and `note`
- **AND** the contract SHALL preserve those field names as public API semantics even if persistence uses different internal column names

### Requirement: Fastify serves interactive API documentation from contract
The system MUST expose Swagger UI from the Fastify server using the same `openapi.yaml` contract content.

#### Scenario: Swagger UI endpoint is available
- **WHEN** a client performs `GET /docs`
- **THEN** the service SHALL return a Swagger UI page rendering the API specification

#### Scenario: Invalid OpenAPI contract blocks startup
- **WHEN** the server starts with an invalid `openapi.yaml`
- **THEN** startup MUST fail with a contract validation error

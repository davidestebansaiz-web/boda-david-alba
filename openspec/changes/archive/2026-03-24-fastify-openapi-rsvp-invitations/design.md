## Context

The project needs a backend baseline for invitation management and RSVP capture. There is no stable API contract yet, and public RSVP access from QR codes requires token-based access without user authentication. The implementation also needs local persistence with reproducible database setup for development.

## Goals / Non-Goals

**Goals:**
- Establish `openapi.yaml` as the single contract for API behavior and schemas.
- Serve Swagger UI from a Fastify application based on that contract.
- Support public RSVP flows by invitation token.
- Support admin invitation CRUD endpoints (without auth in this iteration).
- Provide local Postgres with Docker and Prisma lifecycle (migrations + seed).

**Non-Goals:**
- Authentication/authorization for admin endpoints.
- Production-grade deployment and infrastructure hardening.
- Final QR image generation pipeline (only token-compatible endpoints are in scope).
- Advanced invitation workflows (reminders, bulk import/export, email delivery).

## Decisions

### Decision: Contract-first API with `openapi.yaml`
The API contract will be authored first and treated as the source of truth for request/response shape and endpoint catalog.

Alternatives considered:
- Code-first route definitions with generated OpenAPI: rejected because contract drift risk is higher at this stage.
- Parallel handwritten docs: rejected because docs/code divergence is likely.

### Decision: Fastify + Swagger UI from YAML
Fastify will load and expose Swagger UI backed by the same YAML contract used for implementation.

Alternatives considered:
- Express + Swagger tooling: rejected to keep alignment with preferred runtime and plugin ecosystem.
- Serving static docs only: rejected because interactive docs and try-out flows are needed.

### Decision: Public RSVP authorized by invitation token
Public endpoints will use invitation token in the path/query/payload (as defined in OpenAPI) to look up and submit RSVP without login.

Alternatives considered:
- Signed JWT for public RSVP: rejected as unnecessary complexity for initial scope.
- Numeric invitation IDs: rejected due to predictability and weaker confidentiality.

### Decision: Admin CRUD without auth (temporary)
Admin endpoints will be unauthenticated only for this first iteration to unblock end-to-end flow and data modeling.

Alternatives considered:
- Add auth now: rejected to minimize scope and reduce implementation lead time.

### Decision: Prisma ORM with Dockerized Postgres
Prisma will manage schema, migrations, and seeding against a Dockerized Postgres service for consistent local onboarding.

Alternatives considered:
- Raw SQL migrations only: rejected due to reduced developer ergonomics and schema typing.
- SQLite for local only: rejected because behavior parity with target Postgres is required.

## Risks / Trade-offs

- [Unauthenticated admin endpoints can expose write operations] -> Mitigation: scope to non-production environments and clearly label as temporary in docs/tasks.
- [OpenAPI and handlers may drift if not validated in CI] -> Mitigation: add startup-time schema loading and contract validation checks.
- [Token leakage could allow unauthorized RSVP changes] -> Mitigation: use high-entropy opaque tokens and avoid exposing sensitive invitation fields.
- [Seed and migration order issues can break local setup] -> Mitigation: document deterministic command sequence and fail fast on migration errors.

## Migration Plan

1. Add `openapi.yaml` with endpoints and schemas for public RSVP and admin CRUD.
2. Bootstrap Fastify app with Swagger UI serving contract docs.
3. Introduce Docker Postgres service and environment variables.
4. Define Prisma schema, generate first migration, and apply migration.
5. Add seed script with sample invitations/tokens and RSVP states.
6. Implement Fastify handlers mapped to contract operations.
7. Validate with local smoke tests via Swagger UI and API calls.

Rollback strategy:
- Revert change branch and reset local database by stopping containers and removing local DB volumes for this feature environment.

## Open Questions

- Should public token lookup return full invitation detail or a minimized public projection?
- Should RSVP be strictly single-submit or allow updates by reusing the same token?
- Which invitation states are mandatory in v1 (pending/accepted/declined plus guest count)?

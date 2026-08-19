## 1. Contract and Project Bootstrap

- [x] 1.1 Create `openapi.yaml` with schemas and operations for public RSVP token endpoints and admin invitation CRUD endpoints
- [x] 1.2 Bootstrap Fastify server entrypoint and configuration for local development
- [x] 1.3 Add Swagger/OpenAPI plugins and expose interactive docs endpoint (for example `/docs`)

## 2. Database Infrastructure and Prisma

- [x] 2.1 Add Docker configuration for local Postgres service and environment variables
- [x] 2.2 Define Prisma schema for invitations and RSVP data model with token fields
- [x] 2.3 Generate and apply initial Prisma migration for local database
- [x] 2.4 Implement Prisma seed script with deterministic sample invitations and RSVP baseline data

## 3. Public RSVP by Token

- [x] 3.1 Implement public handler to fetch invitation RSVP context by token
- [x] 3.2 Implement public handler to submit RSVP decision by token with payload validation
- [x] 3.3 Ensure token-based responses exclude internal admin-only fields
- [x] 3.4 Map public handlers to OpenAPI operations and align status/error responses with contract

## 4. Admin Invitations CRUD

- [x] 4.1 Implement create and list invitation admin handlers backed by Prisma
- [x] 4.2 Implement get-by-id and update invitation admin handlers backed by Prisma
- [x] 4.3 Implement delete invitation admin handler and not-found behavior
- [x] 4.4 Expose admin routes without auth middleware in this iteration and document temporary scope

## 5. Validation and Developer Experience

- [x] 5.1 Validate server startup fails on invalid `openapi.yaml` and succeeds with valid contract
- [x] 5.2 Add basic endpoint verification tests or smoke scripts for public RSVP and admin CRUD flows
- [x] 5.3 Document local runbook: start Docker Postgres, run Prisma migration/seed, start Fastify, access Swagger UI

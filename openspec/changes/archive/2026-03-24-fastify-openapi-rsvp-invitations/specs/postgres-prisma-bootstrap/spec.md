## ADDED Requirements

### Requirement: Local Postgres runs through Docker
The system MUST provide a Docker-based Postgres service for local development that can be started consistently by contributors.

#### Scenario: Database service starts with project configuration
- **WHEN** a developer starts local infrastructure with the documented Docker command
- **THEN** a Postgres instance SHALL become reachable using configured connection settings

### Requirement: Prisma migrations define schema evolution
The system MUST define relational schema through Prisma and apply migrations to provision required invitation, invitee, and RSVP summary tables.

#### Scenario: Migration provisions relational invitees model
- **WHEN** the initial Prisma migration is applied to an empty local database
- **THEN** database objects required for invitations, invitees, and RSVP summary storage SHALL be created

#### Scenario: Invitee rows store attendance and message fields
- **WHEN** the migration has been applied successfully
- **THEN** each invitation SHALL be representable with one-to-many invitee rows containing attendance and message columns

#### Scenario: Migration command fails on incompatible schema state
- **WHEN** Prisma migration detects an incompatible database state
- **THEN** the command MUST fail with an actionable error and SHALL NOT apply partial changes

### Requirement: Seed data provides runnable baseline
The system MUST include a Prisma seed process that inserts baseline sample records for local testing.

#### Scenario: Seed populates sample invitations
- **WHEN** a developer runs the seed command after migrations
- **THEN** the database SHALL contain sample invitations and tokens usable for RSVP endpoint testing

#### Scenario: Seed execution is repeatable for local reset workflow
- **WHEN** a developer resets the database and reruns migrations plus seed
- **THEN** the resulting dataset SHALL be recreated deterministically for local validation

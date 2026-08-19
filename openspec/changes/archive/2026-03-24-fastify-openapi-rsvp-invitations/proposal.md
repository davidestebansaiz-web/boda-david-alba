## Why

Actualmente no hay un contrato de API único ni un backend formalizado para gestionar invitaciones y RSVPs. Necesitamos establecer una base implementable y verificable para exponer flujos públicos por QR/token y operaciones administrativas de invitaciones.

## What Changes

- Adoptar `openapi.yaml` como contrato fuente de verdad para endpoints, modelos y respuestas.
- Implementar servidor Fastify que cargue el contrato OpenAPI y exponga Swagger UI.
- Añadir endpoints públicos de RSVP por token (pensados para acceso desde QR) sin autenticación de usuario.
- Añadir endpoints administrativos para CRUD de invitaciones (sin auth en esta iteración).
- Integrar Postgres en Docker para entorno local.
- Configurar Prisma (schema, migrations y seed) para persistencia de invitaciones y RSVPs.

## Capabilities

### New Capabilities
- `openapi-contract-and-docs`: Define el contrato `openapi.yaml` y su publicación en Swagger UI desde Fastify.
- `public-rsvp-by-token`: Permite consultar y registrar RSVP mediante token público de invitación.
- `admin-invitations-crud`: Permite crear, listar, consultar, actualizar y eliminar invitaciones desde endpoints admin.
- `postgres-prisma-bootstrap`: Define infraestructura local Docker Postgres y flujo Prisma (migrations + seed).

### Modified Capabilities
- None.

## Impact

- API HTTP: nuevos endpoints públicos y administrativos definidos por OpenAPI.
- Backend Fastify: inicialización de servidor, carga de especificación y plugins de documentación.
- Persistencia: nuevo modelo de datos en Postgres gestionado con Prisma.
- Dev workflow: nuevos comandos/procesos para levantar DB local, aplicar migraciones y ejecutar seed.

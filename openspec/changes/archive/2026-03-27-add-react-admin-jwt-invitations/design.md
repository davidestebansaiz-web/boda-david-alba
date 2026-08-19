## Context

El repositorio tiene una API Fastify (`wedding-api`) con CRUD de invitaciones y flujo público de RSVP, además de un frontend de invitado (`boda-alba-david`). El CRUD administrativo actual está explícitamente sin autenticación. Se requiere un nuevo panel administrativo separado con React Admin para login, listado y edición de invitaciones, y endurecer la API para exigir JWT en endpoints admin, manteniendo `boda-alba-david` sin migración.

## Goals / Non-Goals

**Goals:**
- Añadir autenticación admin por credenciales con emisión de JWT en la API.
- Proteger todos los endpoints `/admin/invitations/*` mediante verificación JWT.
- Crear un proyecto frontend admin independiente (por ejemplo `wedding-admin`) con React Admin.
- Mantener `boda-alba-david` como frontend público independiente sin migración ni reemplazo.
- Implementar flujo funcional de login, listado de invitaciones y edición de invitación conectado a API.
- Reflejar los cambios en `openapi.yaml` y Swagger UI (security scheme + operación de login).

**Non-Goals:**
- Gestión de usuarios admin multi-tenant, roles avanzados o permisos granulares.
- Refresh tokens, rotación de claves, SSO u otros mecanismos de identidad avanzados.
- No migrar ni reemplazar el frontend público existente (`boda-alba-david`) por React Admin.
- Añadir en esta iteración pantallas admin fuera de invitaciones (dashboard, métricas, etc.).

## Decisions

### 1) JWT de servidor firmado con secreto HMAC
- Se añadirá un endpoint de login admin (por ejemplo `POST /admin/auth/login`) que validará credenciales bootstrap configuradas por entorno y devolverá `accessToken` JWT con expiración corta.
- Los endpoints admin validarán JWT mediante un guard/preHandler común.
- Rechazos por token ausente/inválido/expirado devolverán `401`.

Alternativas consideradas:
- Sesión stateful en base de datos: descartada por complejidad extra para un único administrador inicial.
- API keys estáticas: descartadas porque no aportan expiración ni flujo explícito de login requerido por el usuario.

### 2) Protección uniforme de endpoints admin existentes
- Se reutilizarán los casos de uso de invitaciones ya implementados y se limitará el cambio al borde HTTP (middleware de auth + contrato OpenAPI).
- El flujo de dominio de invitaciones no se acoplará a lógica JWT.

Alternativas consideradas:
- Inyectar autorización en capa de aplicación/dominio: descartado para mantener separación hexagonal y mínimo impacto.

### 3) Nuevo proyecto React Admin desacoplado
- Se creará una app separada (por ejemplo `wedding-admin`) en lugar de mezclar administración en el frontend público.
- Se implementará `authProvider` de React Admin para login/logout/checkAuth con persistencia del token.
- Se implementará `dataProvider` con `Authorization: Bearer <token>` para `getList` y `update` de invitaciones.
- `boda-alba-david` permanecerá operativo y fuera del alcance de cambios funcionales en esta iniciativa.

Alternativas consideradas:
- Extender la app pública con rutas admin: descartado por mezcla de responsabilidades y superficie de despliegue.
- UI custom sin React Admin: descartada porque el usuario pide explícitamente React Admin.

### 4) OpenAPI como contrato actualizado de seguridad
- `openapi.yaml` incorporará `components.securitySchemes.BearerAuth` y el endpoint de login admin.
- Operaciones de invitaciones admin declararán requisito de seguridad y respuestas `401`.

Alternativas consideradas:
- Documentar auth solo en README: descartado porque rompería el contrato-first establecido.

## Risks / Trade-offs

- [Riesgo] Credenciales admin bootstrap en variables de entorno mal configuradas en local/CI. → Mitigación: validación estricta al arranque y mensajes de error claros.
- [Riesgo] Caducidad de token corta puede cortar sesiones durante edición. → Mitigación: definir TTL razonable y manejo UX de `401` con redirección a login.
- [Riesgo] Introducir auth puede romper scripts/tests existentes que llamaban admin sin credenciales. → Mitigación: actualizar smoke tests y tests de integración para incluir login y bearer token.
- [Trade-off] Se adopta un único flujo de credenciales estáticas en esta fase. → Mitigación: documentar extensión futura a repositorio de usuarios admin.

## Migration Plan

1. Actualizar `openapi.yaml` para incluir login admin, security scheme bearer y `401` en endpoints admin.
2. Implementar en API endpoint login + utilidades JWT + guard de autenticación para rutas admin.
3. Ajustar handlers/routing admin para requerir guard sin alterar casos de uso de dominio.
4. Crear proyecto `wedding-admin` con React Admin, `authProvider`, `dataProvider`, recursos y vistas de invitaciones (list/edit), sin modificar `boda-alba-david`.
5. Añadir configuración de entorno para URL API, secreto JWT y credenciales admin bootstrap.
6. Actualizar pruebas (API + frontend) y documentación de ejecución local.
7. Despliegue incremental: primero API con auth, después frontend admin; rollback retirando guard de auth y despublicando frontend admin.

## Open Questions

- ¿La edición admin en esta iteración incluirá solo campos básicos de invitación o también edición de invitees anidados?
- ¿Cuál será el TTL exacto del JWT para balancear seguridad y ergonomía en el panel?
- ¿Se necesita endpoint de refresh token ya en esta fase o se acepta relogin manual al expirar?

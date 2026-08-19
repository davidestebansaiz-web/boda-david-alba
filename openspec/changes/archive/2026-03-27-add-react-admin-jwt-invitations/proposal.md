## Why

Actualmente existe API para CRUD de invitaciones pero sin autenticación en endpoints admin y sin un panel administrativo dedicado para operar invitaciones de forma cómoda. Necesitamos habilitar una experiencia de backoffice con login JWT para poder listar y editar invitaciones de manera segura y trazable.

## What Changes

- Crear un nuevo proyecto frontend de administración basado en React Admin para operar invitaciones.
- Mantener `boda-alba-david` como frontend público independiente, sin migrarlo ni reemplazarlo en este cambio.
- Implementar flujo de login admin contra la API y gestión de sesión con token JWT.
- Conectar el panel admin con endpoints de invitaciones para listar y editar registros.
- Endurecer endpoints admin de la API para exigir token JWT válido en operaciones de invitaciones.
- Actualizar el contrato OpenAPI para documentar seguridad bearer y el endpoint de autenticación.

## Capabilities

### New Capabilities
- `admin-auth-jwt`: autenticación administrativa con credenciales y emisión/validación de JWT para acceso al área admin.
- `react-admin-invitations`: aplicación React Admin separada con login, listado y edición de invitaciones conectada a la API, coexistiendo con `boda-alba-david`.

### Modified Capabilities
- `admin-invitations-crud`: los endpoints CRUD admin pasan de acceso público a acceso protegido por JWT, incluyendo respuestas de autorización.
- `openapi-contract-and-docs`: el contrato OpenAPI incorpora esquema de seguridad bearer, endpoint de login admin y requisitos de autenticación en operaciones admin.

## Impact

- API `wedding-api`: nuevos componentes de autenticación JWT (endpoint de login, validación token, guard de rutas) y ajustes en handlers admin.
- Contrato API: cambios en `openapi.yaml` y documentación Swagger.
- Frontend: nuevo proyecto React Admin (por ejemplo `wedding-admin`) con proveedor de auth y data provider HTTP.
- Frontend público existente: `boda-alba-david` permanece sin migración y sin cambios de alcance por este cambio.
- Configuración: nuevas variables de entorno para secreto JWT y credenciales/admin bootstrap.
- Testing: nuevas pruebas de login, autorización (401/403) y flujos de listado/edición desde el panel.

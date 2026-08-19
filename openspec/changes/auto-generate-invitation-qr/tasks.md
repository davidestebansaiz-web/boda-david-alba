## 1. Contract and Configuration

- [x] 1.1 Añadir `WEDDING_WEBSITE_BASE_URL` a `.env.example`, carga de configuracion y validacion de arranque
- [x] 1.2 Actualizar `openapi.yaml` con campos QR en `AdminInvitation` y parametros de update para override/regeneracion
- [x] 1.3 Actualizar README/runbook local para documentar composicion de URL QR por defecto

## 2. Persistence and Domain Model

- [x] 2.1 Extender `Invitation` en Prisma con `qrTargetUrl`, `qrSvg` y `qrUpdatedAt` (o equivalente acordado)
- [x] 2.2 Crear migracion Prisma y backfill para invitaciones existentes usando base URL + token
- [x] 2.3 Actualizar entidades/DTOs/repositorio para mapear campos QR en dominio y persistencia

## 3. QR Generation Application Logic

- [x] 3.1 Añadir dependencia de generacion QR backend (por ejemplo `qrcode`) y adaptador reutilizable
- [x] 3.2 Implementar regla de create para generar `qrTargetUrl` por defecto y `qrSvg` asociado
- [x] 3.3 Extender update para aceptar `qrTargetUrl` y `regenerateQr`, regenerando QR cuando corresponda
- [x] 3.4 Incorporar validaciones de URL y errores de dominio/HTTP para entradas QR invalidas

## 4. HTTP Layer and API Mapping

- [x] 4.1 Ajustar handlers/presenters para devolver metadata QR en create, list y detail
- [x] 4.2 Ajustar mapping de request update para soportar override URL y regeneracion explicita
- [x] 4.3 Verificar coherencia de respuestas `400/401/404` con el contrato actualizado

## 5. React Admin Integration

- [x] 5.1 Añadir campos QR al resource `invitations` del frontend admin
- [x] 5.2 Mostrar `qrTargetUrl` editable y preview QR en la vista de edicion
- [x] 5.3 Añadir accion de regenerar QR y refresco de datos tras guardar
- [x] 5.4 Mantener estado editable y mensajes de error cuando falle validacion de URL QR

## 6. Testing and Validation

- [x] 6.1 Añadir pruebas API para create con QR por defecto, update con override y regeneracion explicita
- [x] 6.2 Añadir pruebas de error para base URL faltante y `qrTargetUrl` invalida
- [x] 6.3 Añadir/actualizar tests frontend del flujo de edicion/regeneracion QR
- [x] 6.4 Ejecutar suite (`npm test`, smoke) y verificar Swagger UI con nuevos campos

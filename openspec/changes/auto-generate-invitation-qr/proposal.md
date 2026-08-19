## Why

Actualmente al crear una invitacion no se genera un QR listo para usar, lo que obliga a construir la URL manualmente y usar herramientas externas para crear el codigo. Queremos que el sistema genere y mantenga ese QR automaticamente para reducir errores operativos y acelerar la gestion desde admin.

## What Changes

- Generar automaticamente un QR asociado a cada invitacion al crearla, apuntando por defecto a `<WEDDING_WEBSITE_BASE_URL>?token=<token>`.
- Introducir configuracion obligatoria por entorno para la URL base de la web publica de boda.
- Extender el flujo de edicion de invitaciones para permitir cambiar la direccion objetivo del QR y regenerar el QR asociado.
- Exponer en API admin y en React Admin los campos necesarios para ver, editar y regenerar el QR de cada invitacion.
- Añadir validaciones y manejo de errores para URL objetivo invalida o configuracion faltante.

## Capabilities

### New Capabilities
- `invitation-qr-management`: ciclo de vida del QR por invitacion (generacion automatica, URL objetivo por defecto y regeneracion).

### Modified Capabilities
- `admin-invitations-crud`: el alta y la edicion de invitaciones incorporan datos y acciones de QR.
- `openapi-contract-and-docs`: el contrato y la documentacion incluyen los nuevos campos y parametros de QR.
- `react-admin-invitations`: la UI de administracion permite editar URL objetivo del QR, previsualizarlo y regenerarlo.

## Impact

- `wedding-api`: configuracion de entorno, contrato OpenAPI, casos de uso de creacion/actualizacion, validaciones, capa de persistencia y migraciones Prisma.
- `wedding-admin`: formulario de edicion de invitaciones, cliente de datos y feedback de errores para operaciones de QR.
- Dependencias: libreria de generacion de QR en backend (por ejemplo `qrcode`) y cobertura de tests en API/frontend.

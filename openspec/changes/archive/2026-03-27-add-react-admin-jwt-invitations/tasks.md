## 1. API Auth Foundations

- [x] 1.1 Definir variables de entorno de autenticación admin (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRES_IN`) y validar su presencia al arranque
- [x] 1.2 Implementar utilidades de emisión y verificación JWT en la capa de infraestructura compartida
- [x] 1.3 Crear middleware/guard HTTP reutilizable para validar `Authorization: Bearer <token>` en endpoints admin

## 2. Admin Login Endpoint

- [x] 2.1 Añadir operación de login admin en `openapi.yaml` con request/response DTOs y errores `401`
- [x] 2.2 Implementar caso de uso de autenticación admin por credenciales bootstrap
- [x] 2.3 Implementar handler/route Fastify para `POST /admin/auth/login` mapeado al contrato OpenAPI
- [x] 2.4 Cubrir respuestas de error de login sin filtrar información sensible de credenciales

## 3. Protect Admin Invitation CRUD

- [x] 3.1 Aplicar guard JWT a operaciones de listado/lectura/creación/actualización/borrado de invitaciones admin
- [x] 3.2 Ajustar mapeo de errores para devolver `401` cuando falte o sea inválido el token
- [x] 3.3 Verificar que los casos de uso de dominio permanezcan desacoplados de lógica JWT

## 4. OpenAPI and Docs Alignment

- [x] 4.1 Añadir `securitySchemes` bearer JWT en `openapi.yaml`
- [x] 4.2 Declarar `security` en todas las operaciones admin de invitaciones y documentar respuestas `401`
- [x] 4.3 Confirmar que Swagger UI muestre login/admin auth y operaciones protegidas correctamente
- [x] 4.4 Validar que el servidor falla al arrancar si el contrato OpenAPI queda inválido

## 5. React Admin Project Bootstrap

- [x] 5.1 Crear nuevo proyecto frontend admin (por ejemplo `wedding-admin`) con React + TypeScript + React Admin
- [x] 5.2 Configurar estructura base de la app admin (entrypoint, layout, rutas y configuración de entorno)
- [x] 5.3 Implementar cliente HTTP compartido para consumir `wedding-api` con manejo de base URL
- [x] 5.4 Garantizar aislamiento del proyecto admin sin migrar ni modificar `boda-alba-david`

## 6. React Admin Authentication Flow

- [x] 6.1 Implementar `authProvider` de React Admin con login/logout/checkAuth/checkError
- [x] 6.2 Conectar login de React Admin con `POST /admin/auth/login` y persistencia segura del JWT
- [x] 6.3 Añadir inyección automática de `Authorization` bearer token en requests del `dataProvider`
- [x] 6.4 Redirigir a login y limpiar sesión cuando la API responda `401`

## 7. Invitations List and Edit in React Admin

- [x] 7.1 Implementar recurso `invitations` con vista de listado conectada al endpoint admin de lista
- [x] 7.2 Configurar mapeo de paginación/ordenación/filtros del listado al contrato API existente
- [x] 7.3 Implementar vista de edición de invitación conectada al endpoint admin de update
- [x] 7.4 Mostrar errores de validación de API en formulario de edición preservando estado editable

## 8. Testing and Documentation

- [x] 8.1 Añadir pruebas de API para login válido/inválido y acceso admin con/sin token
- [x] 8.2 Actualizar smoke/integration tests para incluir flujo autenticado de CRUD admin
- [x] 8.3 Añadir pruebas frontend del flujo login + listado + edición en el proyecto admin
- [x] 8.4 Documentar runbook local para levantar API con JWT y ejecutar el nuevo panel React Admin
- [x] 8.5 Documentar explícitamente la convivencia de `wedding-admin` con `boda-alba-david` sin plan de migración

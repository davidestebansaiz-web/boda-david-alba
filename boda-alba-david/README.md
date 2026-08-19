# boda-alba-david

Frontend React + TypeScript para confirmar asistencia por token QR en la home.

## Flujo RSVP implementado

1. Entrada de token en la pagina inicial:
- prefill desde URL (`?token=<valor>` o `/rsvp/<token>`)
- entrada manual en input

2. Validacion de token contra API:
- `GET /public/invitations/{token}`
- carga invitados asociados al token

3. Formulario por invitado:
- una fila por invitado
- checkbox de asistencia
- textarea opcional por invitado

4. Envio de respuestas:
- `POST /public/invitations/{token}/rsvp`
- payload con `invitees[]`
- redireccion a vista de exito tras respuesta OK

## Variables de entorno

- `VITE_API_BASE_URL` (opcional): base URL de la API.
- Si no se define, el frontend usa rutas relativas (`/public`, `/admin`).

## Desarrollo local

1. Instalar dependencias:
- `npm install`

2. Levantar frontend:
- `npm run dev`

3. Ejecutar tests:
- `npm test`

4. Build de produccion:
- `npm run build`

## Notas de integracion

- `vite.config.ts` incluye proxy de desarrollo para `/public` y `/admin` hacia `http://localhost:3000`.
- La API backend debe exponer el contrato actualizado de RSVP por invitado.

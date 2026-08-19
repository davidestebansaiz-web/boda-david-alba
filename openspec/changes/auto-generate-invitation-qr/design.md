## Context

El flujo actual de invitaciones administra token, datos del grupo e informacion RSVP, pero no incluye un QR gestionado por el sistema. El equipo necesita que al crear una invitacion exista un QR reutilizable que apunte al frontend publico de la boda y que se pueda regenerar cuando cambie la URL objetivo.

La API backend (`wedding-api`) ya centraliza reglas de negocio y contrato OpenAPI, mientras que `wedding-admin` consume ese contrato para alta/edicion. El cambio atraviesa contrato, dominio, persistencia y UI.

## Goals / Non-Goals

**Goals:**
- Generar QR automaticamente al crear una invitacion.
- Derivar URL objetivo por defecto desde configuracion de entorno (`WEDDING_WEBSITE_BASE_URL`) y token de invitacion.
- Permitir override de `qrTargetUrl` al editar invitacion y regenerar QR desde admin.
- Exponer datos de QR de forma consistente en OpenAPI y React Admin.
- Mantener el token publico de RSVP estable (no regenerar token como parte de esta funcionalidad).

**Non-Goals:**
- Implementar almacenamiento externo de imagenes (S3/CDN) en esta iteracion.
- Añadir endpoints publicos nuevos para QR.
- Rehacer el flujo de RSVP del frontend publico.

## Decisions

### 1) Persistir URL objetivo y payload renderizable de QR en Invitation

Decision:
- Añadir campos persistidos en `Invitation` para `qrTargetUrl`, `qrSvg` (o equivalente renderizable) y `qrUpdatedAt`.

Rationale:
- Evita regeneraciones innecesarias en cada GET y simplifica el consumo de React Admin.
- Facilita auditoria funcional de cuando fue la ultima regeneracion.

Alternatives considered:
- Generar QR on-demand en lectura: reduce almacenamiento pero aumenta costo por request y complica consistencia de previews.
- Guardar solo `qrTargetUrl`: obligaria al frontend a depender de una libreria QR, mezclando responsabilidades.

### 2) Regla de URL por defecto basada en variable de entorno obligatoria

Decision:
- Introducir `WEDDING_WEBSITE_BASE_URL` como variable obligatoria de arranque.
- En create, calcular `qrTargetUrl = normalize(baseUrl) + '?token=' + encodeURIComponent(token)` cuando no haya override explicito.

Rationale:
- Permite cambiar dominio por entorno sin tocar codigo.
- Evita configuraciones manuales por invitacion para el caso principal.

Alternatives considered:
- Hardcodear dominio en codigo: no portable entre local/staging/produccion.
- Configurar dominio solo en frontend: desalinea origen de verdad del QR y rompe trazabilidad en API.

### 3) Regeneracion QR integrada en update de invitacion

Decision:
- Extender `AdminInvitationUpdateRequest` con `qrTargetUrl?` y `regenerateQr?`.
- Regenerar QR cuando `qrTargetUrl` cambia o cuando `regenerateQr=true`.

Rationale:
- Evita crear endpoint adicional y mantiene un flujo unico de edicion.
- Encaja con el modelo actual de React Admin edit/save.

Alternatives considered:
- Endpoint dedicado `POST /admin/invitations/{id}/regenerate-qr`: mas explicito pero incrementa complejidad contractual y de cliente.

### 4) Generacion de QR en backend con dependencia dedicada

Decision:
- Usar libreria backend (por ejemplo `qrcode`) para producir SVG estable.

Rationale:
- El backend controla formato y coherencia de la representacion.
- Reduce logica de transformacion en frontend.

Alternatives considered:
- Generar QR en frontend: haria que distintos clientes produzcan resultados distintos y no deja QR persistido en backend.

## Risks / Trade-offs

- [Payload de respuesta mayor por incluir SVG] -> Mitigacion: limitar complejidad del SVG y evaluar version resumida si impacta listados.
- [URLs mal formadas por configuracion] -> Mitigacion: validar `WEDDING_WEBSITE_BASE_URL` al arranque y `qrTargetUrl` en create/update.
- [Regeneraciones concurrentes] -> Mitigacion: usar update atomico con `updatedAt/qrUpdatedAt` y pruebas de concurrencia basicas.
- [Acoplamiento de contrato a un formato QR concreto] -> Mitigacion: documentar formato actual y reservar posibilidad de versionado de campo en futuras iteraciones.

## Migration Plan

1. Añadir campos QR en Prisma schema y crear migracion.
2. Backfill de invitaciones existentes:
   - calcular `qrTargetUrl` desde `WEDDING_WEBSITE_BASE_URL` con query param `token`.
   - generar `qrSvg` y `qrUpdatedAt`.
3. Actualizar OpenAPI y handlers HTTP.
4. Actualizar `wedding-admin` para mostrar/editar/regenerar QR.
5. Ejecutar pruebas API + frontend + smoke.

Rollback:
- Revertir despliegue de API/admin y aplicar rollback de migracion segun estrategia de entorno.
- Si rollback de schema no es inmediato, mantener campos QR ignorados por versiones anteriores.

## Open Questions

- ¿Se necesita accion de descarga directa en PNG además del SVG en esta iteracion?
- ¿El listado de invitaciones debe incluir QR completo o solo en vista detalle para reducir payload?
- ¿Debe permitirse override de URL tambien en create o solo en update para simplificar UX inicial?

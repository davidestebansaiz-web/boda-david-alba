# wedding-api

Contract-first Fastify API for invitation admin CRUD and public RSVP by token.

## Scope Notes

- `openapi.yaml` is the contract source of truth.
- Admin invitation endpoints require JWT bearer authentication.
- Admin login endpoint is `POST /admin/auth/login`.
- Public token endpoints return only public-safe fields.
- Public RSVP is invitee-based: each token resolves invitee rows and accepts one attendance/note entry per invitee.
- `wedding-admin` is a separate project from `boda-alba-david`; there is no migration from the public frontend.

## Admin Auth Contract

### 1) Login and receive JWT

- `POST /admin/auth/login`
- Request body: `username`, `password`
- Returns `accessToken`, `tokenType` (`Bearer`), and `expiresIn`

Example payload:

```json
{
  "username": "admin",
  "password": "super-secret"
}
```

### 2) Call protected admin endpoints

- Include `Authorization: Bearer <accessToken>` in admin requests:
  - `POST /admin/invitations`
  - `GET /admin/invitations`
  - `GET /admin/invitations/{invitationId}`
  - `PATCH /admin/invitations/{invitationId}`
  - `DELETE /admin/invitations/{invitationId}`

## Public RSVP Contract (Invitee-Based)

### 1) Resolve token context

- `GET /public/invitations/{token}`
- Returns invitees and current responses to prefill the home-page RSVP form.

Example response:

```json
{
  "invitationId": "inv_123",
  "token": "qr_alba_david_family_001",
  "guestName": "Familia Garcia",
  "maxGuests": 4,
  "invitees": [
    { "id": "guest-1", "displayName": "Familia Garcia" },
    { "id": "guest-2", "displayName": "Acompanante 1" }
  ],
  "currentResponses": [
    { "inviteeId": "guest-1", "attending": true, "note": "Llegamos pronto" },
    { "inviteeId": "guest-2", "attending": false, "note": null }
  ]
}
```

### 2) Submit RSVP by token

- `POST /public/invitations/{token}/rsvp`
- Accepts `invitees[]` with per-invitee attendance and optional note.

Example payload:

```json
{
  "invitees": [
    { "inviteeId": "guest-1", "attending": true, "note": "Llegamos pronto" },
    { "inviteeId": "guest-2", "attending": false, "note": null }
  ]
}
```

## Local Setup

1. Copy `.env.example` to `.env`.
2. Set required auth env vars (in `.env` or shell):
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (for example `30m`)
   - `WEDDING_WEBSITE_BASE_URL` (for example `http://albaydavidsecasan.es`)
     - Default invitation QR URL is composed as `<WEDDING_WEBSITE_BASE_URL>/<token>`.
3. Start Postgres in Docker:
   - `npm run db:up`
4. Apply migrations:
   - `npm run db:deploy`
5. Seed baseline data:
   - `npm run db:seed`
6. Start API:
   - `npm run dev`
7. Open docs:
   - `http://localhost:3000/docs`

## Full Local Frontends

- Public RSVP frontend (unchanged):
  - `cd ../boda-alba-david && npm run dev`
- Admin frontend (new separate project):
  - `cd ../wedding-admin && npm run dev`

## Useful Commands

- `npm test`
- `npm run smoke`
- `npm run db:backfill:qr`
- `npm run db:down`

## Baseline Seed Tokens

- `qr_alba_david_family_001`
- `qr_alba_david_friends_002`
- `qr_alba_david_colleagues_003`

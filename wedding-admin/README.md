# wedding-admin

Standalone React Admin project for invitation administration.

This project is intentionally separate from `boda-alba-david`:
- `boda-alba-david` remains the public RSVP frontend
- `wedding-admin` is the private backoffice frontend
- No migration from `boda-alba-david` is performed in this change

## Local run

1. Start API (`wedding-api`) with auth env vars:

```bash
cd wedding-api
ADMIN_USERNAME=admin \
ADMIN_PASSWORD=super-secret \
JWT_SECRET=dev-secret \
JWT_EXPIRES_IN=30m \
npm run dev
```

2. Start admin frontend:

```bash
cd wedding-admin
npm install
npm run dev
```

By default Vite proxies `/admin` and `/public` to `http://localhost:3000`.

## Optional API base URL

Set `VITE_API_BASE_URL` if you do not want to use the Vite proxy.

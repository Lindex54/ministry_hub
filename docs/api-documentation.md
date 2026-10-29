# API Documentation

The API is served under `/api` by the Express app in `backend/src/app.js`. Everything
else is rendered by the Next.js frontend from the same process (`backend/src/server.js`).

## Status: foundation stage

Only infrastructure exists so far — no domain modules (members, visitors, attendance,
evangelism, follow-ups, communications, ministries, branches, services, events, users,
auth) have routes yet. Those are implemented one at a time; this document grows with them.

## Available routes

- `GET /api/health` — liveness check, always `{ "status": "ok" }`.
- `GET /api/health/db` — checks the MySQL connection pool.
  - `200 { status: "ok", serverVersion }` when connected.
  - `503 { status: "not-configured", message }` when `DB_*`/`DATABASE_URL` are unset.
  - `503 { status: "unreachable", reason }` when configured but unreachable.
- Any other `/api/*` route currently returns `404 { message }`.

## Architecture conventions (for modules as they're added)

- `backend/src/routes/` — thin Express routers per module, mounted in `routes/index.js`.
- `backend/src/modules/<name>/` — controller + service + validation schemas per module.
- `backend/src/middleware/validate.middleware.js` — `validate({ body, params, query })`
  takes Zod schemas and replaces `req.body`/`req.params`/`req.query` with the parsed result.
- `backend/src/utils/asyncHandler.js` — wrap async route handlers so rejected promises
  reach the centralized error handler instead of crashing the process.
- `backend/src/utils/AppError.js` — throw `AppError.notFound(...)`,
  `AppError.badRequest(...)`, etc. from services/controllers for consistent error
  responses (`{ message, errors? }` with the right status code).
- `backend/src/middleware/auth.middleware.js` / `permissions.middleware.js` — JWT
  authentication and permission checks, ready to mount once the users/auth module exists.
- `backend/src/middleware/tenant.middleware.js` — resolves `req.tenant.branchId` for
  branch-scoped data isolation once modules need it.

## Security

- `helmet` sets standard security headers on every response.
- `cors` only allows `FRONTEND_URL` and any origins listed in `ALLOWED_ORIGINS`
  (comma-separated); other origins get a `403`.
- `express-rate-limit` caps requests per IP (`RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX`).
- Centralized error handling never leaks stack traces when `NODE_ENV=production`.

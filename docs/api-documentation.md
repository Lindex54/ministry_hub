# API Documentation

The API is served under `/api` by the Express app in `backend/src/app.js`. Everything
else is rendered by the Next.js frontend from the same process (`backend/src/server.js`).

## Status: data-access models wired, no routes yet

The database layer is wired: every table in `docs/database-design.md` has a model file
under `backend/src/modules/<area>/*.model.js` exporting async CRUD functions built on
`getPool()` from `config/database.js` (plain parameterized SQL, no ORM) — verified live
against the `ministry_hub` database (inserts, join-table helpers, cascading deletes all
confirmed). No Express routes/controllers call these models yet, and the frontend still
runs on its mock data. Routes are added one module at a time, on top of these models.

Model files, by module:

- `modules/churches/church.model.js` — churches
- `modules/branches/branch.model.js` — branches
- `modules/staff/staff.model.js` — staff
- `modules/users/user.model.js`, `role.model.js`, `permission.model.js` — users,
  user_branches, roles, role_permissions, permissions
- `modules/ministries/ministry.model.js` — ministries, ministry_branches,
  ministry↔member lookups
- `modules/members/member.model.js` — members, member_ministries
- `modules/visitors/visitor.model.js` — visitors, visitor_visits
- `modules/services/service.model.js` — services, branch_services
- `modules/evangelism/evangelism-contact.model.js`, `evangelism-encounter.model.js`,
  `outreach-activity.model.js` — evangelism_contacts, evangelism_encounters,
  outreach_activities, outreach_activity_team
- `modules/follow-ups/follow-up-task.model.js` — follow_up_tasks, follow_up_task_history
- `modules/attendance/attendance.model.js` — attendance_occurrences,
  attendance_expected_members, attendance_records
- `modules/events/event.model.js` — events, event_attendees
- `modules/communications/template.model.js`, `campaign.model.js` —
  communication_templates, communication_campaigns, communication_campaign_recipients

## Available routes

- `GET /api/health` — liveness check, always `{ "status": "ok" }`.
- `GET /api/health/db` — checks the MySQL connection pool.
  - `200 { status: "ok", serverVersion }` when connected.
  - `503 { status: "not-configured", message }` when `DB_*`/`DATABASE_URL` are unset.
  - `503 { status: "unreachable", reason }` when configured but unreachable.
- `GET /api/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD` — live dashboard data computed
  from the database for the given date range (`from`/`to` optional, default to the
  last 30 days). Built by `modules/dashboard/dashboard.service.js`, aggregating across
  members, visitors, attendance_occurrences/records, follow_up_tasks, and events —
  see `dashboard.service.js` for the exact bucketing/stat logic. Returns
  `{ period, stats, attendance, membership, recentAttendance, followUps, upcomingEvents }`,
  matching what `frontend/src/features/dashboard/components/DashboardOverview.jsx`
  renders (the frontend's Dashboard mock data was removed; the page now fetches this
  route live). With an empty database every figure is genuinely `0`/empty, not an error.
- `GET /api/members?branchId=&status=` — list members (camelCase, branch resolved to its
  name, ministries resolved to a name array). `GET /api/members/:id` — single member,
  `404` if missing. `POST /api/members` — create (validates with Zod; `branch` is a
  branch *name*, resolved server-side to `branch_id`; `ministries` is an array of
  ministry *names*, resolved to `member_ministries` rows, `"None"`/unknown names
  skipped); the membership number is generated server-side (`MH-{year}-{seq}`), not
  client-supplied. `PATCH /api/members/:id` — partial update, same name-based
  `branch`/`ministries` resolution when present. `GET /api/members/next-number` —
  previews the next membership number for the registration form. Built by
  `modules/members/{member.service,member.controller,member.validation}.js` on top of
  `member.model.js`.
- `GET /api/branches` and `GET /api/ministries` — minimal read-only `{id, name, status}`
  lists. Added only so Members has real options to select from; full CRUD for these two
  modules comes when Ministries/Branches itself is wired (it still runs on mock data in
  the frontend).
- `GET /api/visitors` — list (camelCase, each with a `visitHistory` array joined from
  `visitor_visits` + `services`). `GET /api/visitors/:id` — single visitor, `404` if
  missing. `POST /api/visitors` — create; if the submitted `phone` (normalized the same
  way as the frontend's `normalizePhone`) matches an existing visitor, the request is
  treated as a returning visit instead of a new record: non-empty fields are merged in,
  consent is OR'd (never revoked by a registration that leaves it unchecked), and a new
  `visitor_visits` row is added — mirrors the old mock `VisitorsProvider.addVisitor`
  dedupe behavior exactly. Response is `{ visitor, isReturning }`. `PATCH
  /api/visitors/:id` — partial update, also accepts `convertedMemberId` (set when a
  visitor is registered as a member, so "Register as member" doesn't re-offer an
  already-converted visitor — see the `converted_member_id` column added in migration
  `0019`). `POST /api/visitors/:id/visits` — records an additional visit
  (`{date, service, notes}`), resolving `service` by name against the real `services`
  table. Built by `modules/visitors/{visitor.service,visitor.controller,visitor.validation}.js`.
- `GET /api/communications/campaigns` — returns persisted communication campaign
  history with per-recipient SMTP delivery outcomes. `POST
  /api/communications/campaigns/email/send` — immediately sends one personalized
  plain-text email per eligible recipient through the configured SMTP mailbox. The
  body is `{ title, subject, body, association?, recipients: [{ personType,
  personId }] }`; `personType` is `member` or `visitor`. Before sending, the backend
  resolves addresses from MySQL rather than trusting browser-submitted addresses,
  re-checks contact consent and email opt-in, removes duplicate destinations, and
  replaces `{{name}}` separately for each recipient. The campaign status is `Sent`,
  `Partially sent`, or `Failed`; each recipient records its own outcome. SMTP settings
  are documented in `backend/.env.example` and `docs/deployment.md`. SMS and scheduled
  delivery are not implemented.
- Any other `/api/*` route currently returns `404 { message }`.

## Members — first fully-wired CRUD module

Members is the first module wired end-to-end: `frontend/src/features/members/MembersProvider.jsx`
fetches/creates/updates through `/api/members` instead of mock data
(`members.mock.js`'s `mockMembers` array was removed, keeping only
`membershipStatuses`/`getMemberDisplayName`/`getMemberInitials`). The registration form
(`MemberForm.jsx`) now gets its branch/ministry dropdown options from
`useMemberFormOptions.js` (a small hook fetching `/api/branches` + `/api/ministries`
directly) instead of `useMinistries()`, because Ministries/Branches itself is still
mock-only — using the real `MinistriesProvider` would have emptied out those
still-mock pages. `database/seeders/` is still empty by convention; the real branches
(4), ministries (12), and services (4) that make the Members/Visitors forms usable
today were seeded via a one-off idempotent script,
`backend/src/db/seed-reference-data.mjs` (run with `node src/db/seed-reference-data.mjs`
from `backend/`), matching the names already used throughout the still-mock frontend so
branch/ministry/service names stay consistent across modules until Ministries/Branches/
Services is wired for real.

## Visitors — second fully-wired CRUD module

Same pattern as Members: `frontend/src/features/visitors/VisitorsProvider.jsx` fetches/
creates/updates through `/api/visitors` instead of `mockVisitors`. Unlike Members,
`visitors.mock.js` was **not** trimmed — `mockVisitors` is still a real dependency of
two other still-mock modules (`attendance/data/attendance.mock.js`'s seed registers,
`outreach/OutreachProvider.jsx`'s unified people list), so deleting it would have broken
those pages. Only `VisitorsProvider` stopped importing it. The visitor profile's
follow-up list was already sourced from `useOutreach().getPersonTasks(...)`, not the
mock `visitor.followUps` array, so no follow-up wiring was needed here — the API always
returns `followUps: []` for parity, and real follow-up persistence is Outreach's job
when that module gets wired. "Export visitors" now writes a real `.xlsx` file
client-side via `exceljs` (dynamically imported in `VisitorsOverview.jsx`'s
`exportVisitors()`, so it's not in the main bundle) instead of the old CSV. Note: `xlsx`
(SheetJS) was tried first but has an unpatched high-severity advisory on the npm
registry (fixAvailable: false) — `exceljs` has none, so that's the standing choice for
any future spreadsheet export/import work in this project.

## Frontend ↔ backend wiring in dev

`frontend/src/lib/api.js` calls `NEXT_PUBLIC_API_URL` (`.env.local`, defaults to `/api`).
In production the unified server (`backend/src/server.js`) serves both Next.js and
`/api/*` on one port, so relative `/api` paths just work. When the frontend dev server
runs standalone (`cd frontend && npm run dev` on :3000, separate from the backend),
`frontend/next.config.mjs` rewrites `/api/:path*` to `BACKEND_ORIGIN` (defaults to
`http://localhost:5000`) so the same relative `/api` calls still reach the backend.

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

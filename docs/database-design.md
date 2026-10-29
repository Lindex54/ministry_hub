# Database Design

## Status: foundation stage

No domain tables exist yet — `database/schema.sql` and `database/migrations/` are
intentionally empty. This stage only sets up the mechanism for creating and applying
tables safely; the actual schema (churches, branches, ministries, members, visitors,
evangelism records, attendance registers, follow-up assignments, users, roles, services,
events, communications, and the relationships between them) is designed and migrated in,
module by module, in later steps.

## Engine

MySQL, managed day-to-day through phpMyAdmin. The backend connects via `mysql2`
(`backend/src/config/database.js`), using a connection pool, never a per-request
connection.

## Migrations

Plain `.sql` files in `database/migrations/`, named with a numeric prefix
(`0001_create_churches_table.sql`, `0002_create_branches_table.sql`, ...) so filename
order is apply order. No ORM — this keeps every table directly inspectable and editable
in phpMyAdmin.

- `npm run db:migrate --workspace backend` applies every pending migration.
- `npm run db:migrate:status --workspace backend` lists applied vs. pending migrations.
- Applied migrations are tracked in a `schema_migrations` table, created automatically
  by the migration runner (`backend/src/db/migrate.js`) the first time it runs.

## Planned multi-branch design (not yet implemented)

Ministry Hub supports one church with multiple branches. The intended shape, to be
introduced as each module is built:

- `churches` — the top-level organization.
- `branches` — belongs to a church; most operational data is scoped to a branch.
- `users` / `roles` / `permissions` — authentication and role-based access, with a
  user optionally scoped to one or more branches.
- `members`, `visitors`, `evangelism_records` — person records, each tied to a branch.
- `ministries` + a `branch_ministries` join table — a ministry can operate at several
  branches without duplicating its definition (matches the frontend's Ministries module).
- `attendance_occurrences` / `attendance_records` — one register per branch/service/date.
- `follow_up_assignments` — links back to a member, visitor, or evangelism record.
- `services`, `events`, `communications` — branch-scoped, with shared/global options
  where the frontend already supports them (e.g. church-wide communications).

Foreign keys will enforce branch ownership; shared/global records (e.g. a church-wide
announcement) are modeled explicitly rather than inferred.

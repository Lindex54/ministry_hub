# Database Design

## Status: schema migrated, modules not yet wired

All 28 tables below exist in the `ministry_hub` MySQL database (applied via
`database/migrations/0001`–`0017`, verified with `npm run db:migrate:status
--workspace backend`). No seed data has been inserted and no backend route reads
from or writes to them yet — the frontend still runs entirely on its mock data/providers.
Wiring each module to these tables (routes, controllers, services, replacing mock
imports) is the next stage, done one module at a time.

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

## Conventions used throughout

- Every table gets an `id` (`BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`) plus
  `created_at`/`updated_at` timestamps, even though they're omitted below for brevity.
- The frontend's `personKey` scheme (`member:<id>`, `visitor:<id>`, `evangelism:<id>`)
  and its leader fields that can point at either a staff worker or a member become
  **polymorphic pairs** in the schema: a `*_type` ENUM column next to a `*_id` column.
  No generic FK constraint can span two tables, so the app layer resolves `*_id` against
  whichever table `*_type` names; this mirrors `getPerson(key)` in `OutreachProvider.jsx`.
- Every operational table carries a `branch_id` (nullable only where the frontend
  already treats something as church-wide, e.g. communication campaigns/templates).

## Planned schema

### Organization & access

- **`churches`** — `name`. Single row today; kept so the schema doesn't need a breaking
  change if Ministry Hub ever serves more than one church.
- **`branches`** — `church_id` FK, `name`, `location`, `district`, `address`, `phone`,
  `email`, `date_established`, `leader_type` ENUM(`staff`,`member`) + `leader_id`,
  `assistant_leader_type` + `assistant_leader_id`, `description`, `status`
  (`Active`/`Inactive`). Source: `branches/data/branches.mock.js` — note Kira Branch's
  assistant leader is a member while every leader is a staff worker, hence the
  polymorphic pair instead of two plain FKs.
- **`staff`** — `name`, `role` (Pastor, Evangelist, Church worker, ...), `phone`,
  `email`, `branch_id` FK nullable, `status`. These are the "workers" used as branch
  leaders, ministry leaders, evangelism team members, and follow-up assignees
  (`outreach/data/outreach.mock.js`'s `workers`). Not every staff member needs a login,
  so this is separate from `users`.
- **`users`**, **`roles`**, **`permissions`**, **`role_permissions`** (join),
  **`user_branches`** (join) — auth foundation already scaffolded in
  `backend/src/middleware/auth.middleware.js` / `permissions.middleware.js`, unwired.
  `users.staff_id` FK nullable links a login to a staff record; `user_branches` scopes
  a user to one or more branches for `tenant.middleware.js`.

### Ministries

- **`ministries`** — `name`, `description`, `leader_type`/`leader_id`,
  `assistant_leader_type`/`assistant_leader_id`, `date_established`, `status`.
  Source: `ministries/data/ministries.mock.js` (leaders there are always members, but
  the polymorphic pair keeps it consistent with branches and future flexibility).
- **`ministry_branches`** (join: `ministry_id`, `branch_id`) — a ministry operates at
  several branches without duplicating its definition, matching `branchIds` in the mock.
- **`member_ministries`** (join: `member_id`, `ministry_id`) — replaces the mock's
  `member.ministries` string array.

### People

- **`members`** — `membership_number` (unique), `first_name`, `last_name`,
  `preferred_name`, `gender`, `date_of_birth`, `profile_photo`, `primary_phone`,
  `alternative_phone`, `email`, `district`, `address`, `branch_id` FK, `date_joined`,
  `status` (`Active`/`Inactive`/`Transferred`), `emergency_name`,
  `emergency_relationship`, `emergency_phone`, `consent_to_contact`, `sms_opt_in`,
  `email_opt_in` (the last three fold in `outreach.mock.js`'s `memberPreferences`).
  Source: `members/data/members.mock.js`.
- **`visitors`** — `first_name`, `last_name`, `phone`, `email`, `gender`,
  `district_address`, `invited_by`, `prayer_request`, `permission_to_contact`,
  `branch_id` FK. Source: `visitors/data/visitors.mock.js`.
- **`visitor_visits`** — `visitor_id` FK, `visit_date`, `service_id` FK `services`,
  `notes`. Replaces each visitor's embedded `visitHistory` array.
- **`evangelism_contacts`** — `first_name`, `last_name`, `phone`, `gender`,
  `district_village`, `permission_to_contact`, `follow_up_needed`, `branch_id` FK.
  Source: `evangelism/data/evangelism.mock.js`'s `mockEvangelismRecords`.
- **`evangelism_encounters`** — `evangelism_contact_id` FK, `encounter_date`,
  `location`, `activity_id` FK `outreach_activities` nullable, `evangelized_by` FK
  `staff`, `response` (Accepted Christ / Interested / ...), `notes`. Replaces each
  contact's embedded `history` array.
- **`outreach_activities`** — `name`, `type` (Door-to-door, Street, Campus, Community,
  Crusade), `activity_date`, `location`, `branch_id` FK, `headcount`, `notes`. Source:
  `evangelism/data/evangelism.mock.js`'s `mockOutreachActivities`.
- **`outreach_activity_team`** (join: `activity_id`, `staff_id`) — replaces each
  activity's `team` array of worker ids.

### Follow-ups (unified across members, visitors, evangelism contacts)

- **`follow_up_tasks`** — `person_type` ENUM(`member`,`visitor`,`evangelism_contact`),
  `person_id`, `assigned_to_staff_id` FK `staff`, `method` (Phone Call/Physical Visit),
  `scheduled_date`, `priority`, `reason`, `status`
  (Pending/In Progress/Completed/Unable to Reach). One task type serves all three
  modules, matching `OutreachProvider.jsx`'s single `tasks` list keyed by `personKey`
  rather than separate per-module follow-up tables.
- **`follow_up_task_history`** — `task_id` FK, `occurred_at`, `worker_id` FK `staff`,
  `status`, `reached`, `outcome`, `notes`, `another_follow_up` boolean. Replaces each
  task's embedded `history` array (and each visitor's `followUps[].outcome`).

### Attendance

- **`services`** — `name` (Sunday Main Service, Wednesday Fellowship, ...),
  `description`. A catalog, not branch-specific by itself.
- **`branch_services`** (join: `branch_id`, `service_id`) — which services a given
  branch actually runs, replacing `attendance.mock.js`'s `branchServices` map (e.g. only
  Central Campus and Kira Branch run Youth Worship Night).
- **`attendance_occurrences`** — `branch_id` FK, `service_id` FK, `occurrence_date`.
  Unique on (`branch_id`, `service_id`, `occurrence_date`) — one register per
  branch/service/date, matching `occurrenceKey()` in `attendance-utils.mjs`.
- **`attendance_expected_members`** (join: `occurrence_id`, `member_id`) — the
  explicit expected roster for an occurrence, separate from who actually showed up.
- **`attendance_records`** — `occurrence_id` FK, `person_type` ENUM(`member`,
  `visitor`), `person_id`, `status` (Present/Absent), `category`. Unique on
  (`occurrence_id`, `person_type`, `person_id`).

### Events & communications

- **`events`** — `name`, `event_date`, `branch_id` FK nullable (null = church-wide).
  Source: `outreach/data/outreach.mock.js`'s `events`.
- **`event_attendees`** (join: `event_id`, `person_type`, `person_id`) — replaces each
  event's `people` array of person keys.
- **`communication_templates`** — `name`, `subject`, `body`. Source: `outreach.mock.js`'s
  `templates` (supports `{{name}}` interpolation, handled in app code).
- **`communication_campaigns`** — `title`, `channel` ENUM(`sms`,`email`), `subject`,
  `body`, `timing` ENUM(`now`,`scheduled`), `scheduled_at` nullable, `association`,
  `status`, `recipient_count`, `simulated_at` nullable, `created_by` FK `staff`.
  Source: `outreach/components/CampaignComposer.jsx`.
- **`communication_campaign_recipients`** — `campaign_id` FK, `person_type`,
  `person_id`, `destination` (the resolved phone/email used). Replaces each campaign's
  `recipients` array.

## Relationship summary

- `churches 1—N branches`; `branches 1—N members/visitors/evangelism_contacts/staff`.
- `ministries N—N branches` via `ministry_branches`; `ministries N—N members` via
  `member_ministries`.
- `members/visitors/evangelism_contacts` are the three "person" tables every
  polymorphic `person_type`/`person_id` pair points at (follow-ups, attendance,
  event attendees, campaign recipients).
- `visitors 1—N visitor_visits`; `evangelism_contacts 1—N evangelism_encounters`;
  `outreach_activities 1—N evangelism_encounters` (nullable) and `N—N staff` via
  `outreach_activity_team`.
- `branches N—N services` via `branch_services`; `services/branches 1—N
  attendance_occurrences`; `attendance_occurrences 1—N attendance_records` and
  `1—N attendance_expected_members`.
- `follow_up_tasks 1—N follow_up_task_history`; both reference `staff` for who did
  the work.
- `communication_campaigns 1—N communication_campaign_recipients`.

Foreign keys enforce branch ownership everywhere a `branch_id` column exists;
church-wide records (a shared communication template, a church-wide event) are
modeled with a nullable `branch_id` rather than inferred from absence of data.

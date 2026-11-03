# Ministry Hub

Ministry Hub is organized as a monorepo containing a Next.js frontend, an Express API, database assets, and project documentation.

## Applications

- `frontend/` — Next.js web application
- `backend/` — Node.js and Express API
- `database/` — SQL schema, migrations, and seeders
- `docs/` — requirements and technical documentation

## Getting started

Install workspace dependencies from the repository root:

```bash
npm install
```

Run the complete application with:

```bash
npm run dev
```

The frontend and backend share one server and one domain. Page requests are handled by Next.js, while API requests use the `/api` prefix (for example, `/api/health`).

## Development sample data

After configuring MySQL and applying the migrations, populate a development database with realistic, linked church records:

```bash
npm run db:seed
```

The command preserves existing records and is safe to run repeatedly. It creates reference data when missing, then adds sample members, visitors, ministry assignments, attendance, outreach, evangelism, follow-ups, events, and communications. Do not run sample data seeds against a production database.

See `docs/deployment.md` for the Hostinger deployment settings.


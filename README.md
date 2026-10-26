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

See `docs/deployment.md` for the Hostinger deployment settings.


# Hostinger Deployment

Ministry Hub is deployed as one Node.js web application. Next.js serves the user interface and Express serves the API under `/api`, so both use a single domain:

- Website: `https://your-domain.com`
- API: `https://your-domain.com/api`
- Health check: `https://your-domain.com/api/health`

## Hostinger settings

Deploy the repository as a single Node.js application and keep the root directory set to the repository root (`./`) so npm can install both workspaces.

Use these application settings:

- Node.js version: 20.x or 22.x
- Build command: `npm run build`
- Start command: `npm start`
- Entry file, if Hostinger requests one: `backend/src/server.js`
- Environment variable: `NODE_ENV=production`
- Environment variable: `DATABASE_URL=<production database connection>`

## SMTP email

Outgoing email uses SMTP. Configure these environment variables in Hostinger (and in
`backend/.env` for local development):

- `SMTP_HOST` (Gmail: `smtp.gmail.com`)
- `SMTP_PORT` (use `465` with `SMTP_SECURE=true`, or `587` with
  `SMTP_SECURE=false` for STARTTLS)
- `SMTP_USER` (the full mailbox address)
- `SMTP_PASSWORD` (for Gmail, use a Google App Password rather than the normal
  account password)
- `SMTP_FROM_EMAIL` (normally the same value as `SMTP_USER`)
- `SMTP_FROM_NAME` (optional; defaults to `Ministry Hub`)
- `SMTP_REPLY_TO` (optional)

Never commit an app password. After setting the values, verify the SMTP login without
sending a message by running `npm run email:test-connection --workspace backend`.

Do not create a separate Hostinger website or subdomain for the backend. The single Node.js process starts Express and delegates all non-API requests to the built Next.js application.

Hostinger supplies the listening port through the `PORT` environment variable. Do not assign a production port manually.

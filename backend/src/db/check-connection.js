// Standalone MySQL connectivity check: `npm run db:test` (from backend/).
// Exits 0 when connected, 1 otherwise — safe to use in CI or before deploys.
import { closeDatabase, testConnection } from "../config/database.js";
import { environment, isDatabaseConfigured } from "../config/environment.js";

async function main() {
  console.log("[db:test] Checking MySQL connectivity...");

  if (!isDatabaseConfigured()) {
    console.error(
      "[db:test] Not configured. Copy backend/.env.example to backend/.env and set DATABASE_URL, or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD."
    );
    process.exitCode = 1;
    return;
  }

  const target = environment.database.url
    ? "(DATABASE_URL)"
    : `${environment.database.user || "<no user>"}@${environment.database.host}:${environment.database.port}/${environment.database.name || "<no database>"}`;
  console.log(`[db:test] Target: ${target}`);

  const result = await testConnection();
  if (result.connected) {
    console.log(`[db:test] Success. MySQL server version: ${result.serverVersion}`);
  } else {
    console.error(`[db:test] Failed: ${result.reason}`);
    if (result.error) console.error(`[db:test] Detail: ${result.error.message}`);
    console.error(
      "[db:test] Checklist: is MySQL installed and running, does the database exist, are DB_USER/DB_PASSWORD correct, and can this host reach DB_HOST:DB_PORT?"
    );
    process.exitCode = 1;
  }

  await closeDatabase();
}

main();

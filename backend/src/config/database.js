import mysql from "mysql2/promise";
import { environment, isDatabaseConfigured } from "./environment.js";

let pool = null;

function buildPoolConfig() {
  const base = {
    waitForConnections: true,
    connectionLimit: environment.database.connectionLimit,
    queueLimit: 0,
    dateStrings: true,
    timezone: "Z",
  };

  if (environment.database.url) {
    return { uri: environment.database.url, ...base };
  }

  return {
    host: environment.database.host,
    port: environment.database.port,
    database: environment.database.name,
    user: environment.database.user,
    password: environment.database.password,
    ...base,
  };
}

// Lazily creates (and reuses) the MySQL connection pool. Does not itself verify
// connectivity — call testConnection() for that.
export function getPool() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "MySQL is not configured. Set DATABASE_URL, or DB_HOST/DB_NAME/DB_USER/DB_PASSWORD, in backend/.env."
    );
  }
  if (!pool) pool = mysql.createPool(buildPoolConfig());
  return pool;
}

// Runs a lightweight query to confirm the pool can actually reach MySQL.
// Returns { connected: true, serverVersion } on success, or
// { connected: false, reason } on failure — never throws.
export async function testConnection() {
  if (!isDatabaseConfigured()) {
    return { connected: false, reason: "not-configured" };
  }
  try {
    const [rows] = await getPool().query("SELECT VERSION() AS version");
    return { connected: true, serverVersion: rows[0]?.version };
  } catch (error) {
    return { connected: false, reason: error.code ?? error.message, error };
  }
}

// Called once at server startup. Logs the outcome but never throws, so the
// Express/Next.js server still starts even when MySQL is unreachable.
export async function connectDatabase() {
  if (!isDatabaseConfigured()) {
    console.warn(
      "[database] Skipped connecting: MySQL is not configured yet. Copy backend/.env.example to backend/.env and fill in DB_* values."
    );
    return { connected: false, reason: "not-configured" };
  }

  const result = await testConnection();
  if (result.connected) {
    console.log(`[database] Connected to MySQL ${result.serverVersion} (${environment.database.host}:${environment.database.port}/${environment.database.name}).`);
  } else {
    console.error(`[database] Could not connect to MySQL: ${result.reason}. The server will keep running; fix the connection and restart.`);
  }
  return result;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Minimal SQL-file migration runner for MySQL.
//
// Usage (from backend/):
//   npm run db:migrate          Apply every pending migration in database/migrations/
//   npm run db:migrate:status   List which migrations are applied vs. pending
//
// Migration files live in database/migrations/ at the repo root and are plain
// .sql files named with a numeric prefix, e.g. 0001_create_churches_table.sql.
// Applying them in filename order and recording each one in the
// `schema_migrations` table is all this script does — no ORM, no magic.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { environment, isDatabaseConfigured } from "../config/environment.js";
import { listMigrationFiles, pendingMigrations } from "./migration-utils.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, "../../../database/migrations");

async function openConnection() {
  if (environment.database.url) {
    return mysql.createConnection({ uri: environment.database.url, multipleStatements: true, dateStrings: true, timezone: "Z" });
  }
  return mysql.createConnection({
    host: environment.database.host,
    port: environment.database.port,
    database: environment.database.name,
    user: environment.database.user,
    password: environment.database.password,
    multipleStatements: true,
    dateStrings: true,
    timezone: "Z",
  });
}

async function ensureMigrationsTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

async function getAppliedNames(connection) {
  const [rows] = await connection.query("SELECT name FROM schema_migrations ORDER BY name ASC");
  return rows.map((row) => row.name);
}

async function applyMigration(connection, name) {
  const sql = readFileSync(path.join(migrationsDirectory, name), "utf8");
  await connection.beginTransaction();
  try {
    if (sql.trim()) await connection.query(sql);
    await connection.query("INSERT INTO schema_migrations (name) VALUES (?)", [name]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function status() {
  const files = listMigrationFiles(migrationsDirectory);
  if (!isDatabaseConfigured()) {
    console.log(`[migrate] ${files.length} migration file(s) found in database/migrations/.`);
    console.log("[migrate] MySQL is not configured, so applied/pending status cannot be checked. See backend/.env.example.");
    return;
  }
  const connection = await openConnection();
  try {
    await ensureMigrationsTable(connection);
    const applied = await getAppliedNames(connection);
    const pending = pendingMigrations(files, applied);
    console.log(`[migrate] ${applied.length} applied, ${pending.length} pending, ${files.length} total.`);
    for (const name of files) console.log(`  ${applied.includes(name) ? "[applied]" : "[pending]"} ${name}`);
  } finally {
    await connection.end();
  }
}

async function up() {
  if (!isDatabaseConfigured()) {
    console.error("[migrate] MySQL is not configured. Copy backend/.env.example to backend/.env and set DB_* values, then retry.");
    process.exitCode = 1;
    return;
  }
  const files = listMigrationFiles(migrationsDirectory);
  const connection = await openConnection();
  try {
    await ensureMigrationsTable(connection);
    const applied = await getAppliedNames(connection);
    const pending = pendingMigrations(files, applied);
    if (!pending.length) {
      console.log(`[migrate] Up to date. ${files.length} migration(s) already applied.`);
      return;
    }
    for (const name of pending) {
      console.log(`[migrate] Applying ${name}...`);
      await applyMigration(connection, name);
      console.log(`[migrate] Applied ${name}.`);
    }
    console.log(`[migrate] Done. Applied ${pending.length} migration(s).`);
  } finally {
    await connection.end();
  }
}

const command = process.argv[2] ?? "up";
if (command === "status") {
  await status();
} else if (command === "up") {
  await up();
} else {
  console.error(`[migrate] Unknown command "${command}". Use "up" or "status".`);
  process.exitCode = 1;
}

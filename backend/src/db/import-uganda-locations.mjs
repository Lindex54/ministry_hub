// One-off import: loads the real Uganda administrative location hierarchy
// (district -> county -> sub-county -> parish -> village) from a mysqldump
// SQL file produced by the author's UPAMS project. Idempotent — skips entirely
// if `districts` already has rows. IDs are preserved exactly as dumped so the
// parent foreign keys (county.district_id, etc.) stay correct.
import { readFileSync } from "fs";
import { getPool, closeDatabase } from "../config/database.js";

const DUMP_PATH = process.argv[2] ?? "C:/Users/USER/Downloads/upams_db.sql";

const TABLES = [
  { table: "districts", columns: ["id", "name", "code", "is_active", "created_at", "updated_at"] },
  { table: "counties", columns: ["id", "district_id", "name", "code", "is_active", "created_at", "updated_at"] },
  { table: "sub_counties", columns: ["id", "county_id", "name", "code", "is_active", "created_at", "updated_at"] },
  { table: "parishes", columns: ["id", "sub_county_id", "name", "code", "is_active", "created_at", "updated_at"] },
  { table: "villages", columns: ["id", "parish_id", "name", "code", "is_active", "created_at", "updated_at"] },
];

// Quote-aware tuple splitter — naive paren-depth counting breaks on values
// that contain a literal "(" or ")" inside a quoted string (the dump has a
// few, e.g. a parish named `Karwesanga(Rugaaga)`).
function splitTuples(valuesBlock) {
  const tuples = [];
  let depth = 0;
  let inString = false;
  let current = "";
  for (let i = 0; i < valuesBlock.length; i += 1) {
    const char = valuesBlock[i];
    if (inString) {
      current += char;
      if (char === "\\") { current += valuesBlock[i + 1]; i += 1; continue; }
      if (char === "'") inString = false;
      continue;
    }
    if (char === "'") { inString = true; current += char; continue; }
    if (char === "(") {
      depth += 1;
      if (depth === 1) { current = ""; continue; }
    }
    if (char === ")") {
      depth -= 1;
      if (depth === 0) { tuples.push(current); continue; }
    }
    if (depth > 0) current += char;
  }
  return tuples;
}

// Minimal SQL literal parser for the dump's own value shapes: integers, quoted
// strings (with \' and \\ escapes), and NULL. Good enough for this one file.
function parseTuple(raw) {
  const values = [];
  let i = 0;
  while (i < raw.length) {
    while (raw[i] === " " || raw[i] === ",") i += 1;
    if (i >= raw.length) break;
    if (raw[i] === "'") {
      let value = "";
      i += 1;
      while (i < raw.length && raw[i] !== "'") {
        if (raw[i] === "\\" && i + 1 < raw.length) { value += raw[i + 1]; i += 2; }
        else { value += raw[i]; i += 1; }
      }
      i += 1;
      values.push(value);
    } else {
      let value = "";
      while (i < raw.length && raw[i] !== ",") { value += raw[i]; i += 1; }
      value = value.trim();
      values.push(value === "NULL" ? null : value);
    }
  }
  return values;
}

function extractRows(sql, table) {
  const insertRegex = new RegExp(`INSERT INTO \`${table}\` \\([^)]*\\) VALUES\\s*([\\s\\S]*?);`, "g");
  const rows = [];
  let match;
  while ((match = insertRegex.exec(sql))) {
    for (const tuple of splitTuples(match[1])) {
      rows.push(parseTuple(tuple));
    }
  }
  return rows;
}

async function importTable(pool, { table, columns }, sql) {
  const rows = extractRows(sql, table);
  if (!rows.length) {
    console.log(`[import] No rows found for ${table} in the dump — skipping.`);
    return;
  }

  const values = rows.map((row) => columns.map((column, index) => {
    if (column === "is_active") return row[index] === "1" || row[index] === 1;
    return row[index];
  }));

  const batchSize = 500;
  for (let start = 0; start < values.length; start += batchSize) {
    const batch = values.slice(start, start + batchSize);
    await pool.query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES ?`, [batch]);
  }
  console.log(`[import] Imported ${rows.length} rows into ${table}.`);
}

async function run() {
  const pool = getPool();
  const [countRows] = await pool.query("SELECT COUNT(*) AS count FROM districts");
  if (countRows[0].count > 0) {
    console.log("[import] districts already has data — skipping (already imported).");
    return;
  }

  const sql = readFileSync(DUMP_PATH, "utf8");
  for (const tableSpec of TABLES) {
    await importTable(pool, tableSpec, sql);
  }
}

run()
  .then(async () => { await closeDatabase(); })
  .catch(async (error) => { console.error("[import] Failed:", error); await closeDatabase(); process.exitCode = 1; });

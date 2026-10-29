import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { listMigrationFiles, pendingMigrations } from "../src/db/migration-utils.js";

test("listMigrationFiles returns only .sql files, sorted by name", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "migrations-"));
  try {
    writeFileSync(path.join(directory, "0002_second.sql"), "-- second");
    writeFileSync(path.join(directory, "0001_first.sql"), "-- first");
    writeFileSync(path.join(directory, "README.md"), "not a migration");
    assert.deepEqual(listMigrationFiles(directory), ["0001_first.sql", "0002_second.sql"]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("listMigrationFiles returns an empty array when the directory does not exist", () => {
  assert.deepEqual(listMigrationFiles(path.join(tmpdir(), "does-not-exist-" + Date.now())), []);
});

test("pendingMigrations excludes already-applied names, preserving file order", () => {
  const files = ["0001_a.sql", "0002_b.sql", "0003_c.sql"];
  assert.deepEqual(pendingMigrations(files, ["0001_a.sql"]), ["0002_b.sql", "0003_c.sql"]);
});

test("pendingMigrations returns everything when nothing has been applied", () => {
  const files = ["0001_a.sql", "0002_b.sql"];
  assert.deepEqual(pendingMigrations(files, []), files);
});

import { readdirSync } from "node:fs";

// Pure helpers kept separate from the CLI so they can be unit tested without a
// database connection.

export function listMigrationFiles(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "en"));
}

export function pendingMigrations(allFiles, appliedNames) {
  const applied = new Set(appliedNames);
  return allFiles.filter((name) => !applied.has(name));
}

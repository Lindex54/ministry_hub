import { getPool } from "../../config/database.js";

const COLUMNS = [
  "church_id", "name", "location", "district", "address", "phone", "email",
  "date_established", "leader_type", "leader_id", "assistant_leader_type",
  "assistant_leader_id", "description", "status",
];

export async function listBranches({ status, district } = {}) {
  const clauses = [];
  const params = [];
  if (status) { clauses.push("status = ?"); params.push(status); }
  if (district) { clauses.push("district = ?"); params.push(district); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(`SELECT * FROM branches ${where} ORDER BY name ASC`, params);
  return rows;
}

export async function findBranchById(id) {
  const [rows] = await getPool().query("SELECT * FROM branches WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createBranch(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO branches (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findBranchById(result.insertId);
}

export async function updateBranch(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findBranchById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE branches SET ${assignments} WHERE id = ?`, [...values, id]);
  return findBranchById(id);
}

export async function deleteBranch(id) {
  const [result] = await getPool().query("DELETE FROM branches WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

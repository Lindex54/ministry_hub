import { getPool } from "../../config/database.js";

const COLUMNS = ["name", "role", "phone", "email", "branch_id", "status"];

export async function listStaff({ branchId, status } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  if (status) { clauses.push("status = ?"); params.push(status); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(`SELECT * FROM staff ${where} ORDER BY name ASC`, params);
  return rows;
}

export async function findStaffById(id) {
  const [rows] = await getPool().query("SELECT * FROM staff WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createStaff(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO staff (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findStaffById(result.insertId);
}

export async function updateStaff(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findStaffById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE staff SET ${assignments} WHERE id = ?`, [...values, id]);
  return findStaffById(id);
}

export async function deleteStaff(id) {
  const [result] = await getPool().query("DELETE FROM staff WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

import { getPool } from "../../config/database.js";

const COLUMNS = [
  "first_name", "last_name", "phone", "gender", "district_village",
  "permission_to_contact", "follow_up_needed", "branch_id",
];

export async function listEvangelismContacts({ branchId } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM evangelism_contacts ${where} ORDER BY first_name ASC, last_name ASC`,
    params
  );
  return rows;
}

export async function findEvangelismContactById(id) {
  const [rows] = await getPool().query("SELECT * FROM evangelism_contacts WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createEvangelismContact(data) {
  const values = COLUMNS.map((column) => data[column] ?? null);
  const [result] = await getPool().query(
    `INSERT INTO evangelism_contacts (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    values
  );
  return findEvangelismContactById(result.insertId);
}

export async function updateEvangelismContact(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findEvangelismContactById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE evangelism_contacts SET ${assignments} WHERE id = ?`, [...values, id]);
  return findEvangelismContactById(id);
}

export async function deleteEvangelismContact(id) {
  const [result] = await getPool().query("DELETE FROM evangelism_contacts WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

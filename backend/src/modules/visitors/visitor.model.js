import { getPool } from "../../config/database.js";

const COLUMNS = [
  "first_name", "last_name", "phone", "email", "gender", "district_address",
  "invited_by", "prayer_request", "permission_to_contact", "branch_id",
];

export async function listVisitors({ branchId } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM visitors ${where} ORDER BY first_name ASC, last_name ASC`,
    params
  );
  return rows;
}

export async function findVisitorById(id) {
  const [rows] = await getPool().query("SELECT * FROM visitors WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createVisitor(data) {
  const values = COLUMNS.map((column) => data[column] ?? null);
  const [result] = await getPool().query(
    `INSERT INTO visitors (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    values
  );
  return findVisitorById(result.insertId);
}

export async function updateVisitor(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findVisitorById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE visitors SET ${assignments} WHERE id = ?`, [...values, id]);
  return findVisitorById(id);
}

export async function deleteVisitor(id) {
  const [result] = await getPool().query("DELETE FROM visitors WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getVisitorVisits(visitorId) {
  const [rows] = await getPool().query(
    "SELECT * FROM visitor_visits WHERE visitor_id = ? ORDER BY visit_date DESC",
    [visitorId]
  );
  return rows;
}

export async function addVisitorVisit(visitorId, { visitDate, serviceId, notes }) {
  const [result] = await getPool().query(
    "INSERT INTO visitor_visits (visitor_id, visit_date, service_id, notes) VALUES (?, ?, ?, ?)",
    [visitorId, visitDate, serviceId ?? null, notes ?? null]
  );
  const [rows] = await getPool().query("SELECT * FROM visitor_visits WHERE id = ?", [result.insertId]);
  return rows[0] ?? null;
}

export async function deleteVisitorVisit(visitId) {
  const [result] = await getPool().query("DELETE FROM visitor_visits WHERE id = ?", [visitId]);
  return result.affectedRows > 0;
}

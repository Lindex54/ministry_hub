import { getPool } from "../../config/database.js";

const COLUMNS = ["name", "type", "activity_date", "location", "branch_id", "headcount", "notes"];

export async function listOutreachActivities({ branchId } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM outreach_activities ${where} ORDER BY activity_date DESC`,
    params
  );
  return rows;
}

export async function findOutreachActivityById(id) {
  const [rows] = await getPool().query("SELECT * FROM outreach_activities WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createOutreachActivity(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO outreach_activities (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findOutreachActivityById(result.insertId);
}

export async function updateOutreachActivity(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findOutreachActivityById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE outreach_activities SET ${assignments} WHERE id = ?`, [...values, id]);
  return findOutreachActivityById(id);
}

export async function deleteOutreachActivity(id) {
  const [result] = await getPool().query("DELETE FROM outreach_activities WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getActivityTeam(activityId) {
  const [rows] = await getPool().query(
    "SELECT s.* FROM staff s INNER JOIN outreach_activity_team oat ON oat.staff_id = s.id WHERE oat.activity_id = ? ORDER BY s.name ASC",
    [activityId]
  );
  return rows;
}

export async function setActivityTeam(activityId, staffIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM outreach_activity_team WHERE activity_id = ?", [activityId]);
    if (staffIds.length) {
      const values = staffIds.map((staffId) => [activityId, staffId]);
      await connection.query("INSERT INTO outreach_activity_team (activity_id, staff_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getActivityTeam(activityId);
}

import { getPool } from "../../config/database.js";

const COLUMNS = [
  "person_type", "person_id", "assigned_to_staff_id", "method", "scheduled_date",
  "priority", "reason", "status",
];

export async function listFollowUpTasks({ personType, personId, status, assignedToStaffId } = {}) {
  const clauses = [];
  const params = [];
  if (personType) { clauses.push("person_type = ?"); params.push(personType); }
  if (personId) { clauses.push("person_id = ?"); params.push(personId); }
  if (status) { clauses.push("status = ?"); params.push(status); }
  if (assignedToStaffId) { clauses.push("assigned_to_staff_id = ?"); params.push(assignedToStaffId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM follow_up_tasks ${where} ORDER BY scheduled_date ASC`,
    params
  );
  return rows;
}

export async function findFollowUpTaskById(id) {
  const [rows] = await getPool().query("SELECT * FROM follow_up_tasks WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createFollowUpTask(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO follow_up_tasks (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findFollowUpTaskById(result.insertId);
}

export async function updateFollowUpTask(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findFollowUpTaskById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE follow_up_tasks SET ${assignments} WHERE id = ?`, [...values, id]);
  return findFollowUpTaskById(id);
}

export async function deleteFollowUpTask(id) {
  const [result] = await getPool().query("DELETE FROM follow_up_tasks WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getTaskHistory(taskId) {
  const [rows] = await getPool().query(
    "SELECT * FROM follow_up_task_history WHERE task_id = ? ORDER BY occurred_at ASC",
    [taskId]
  );
  return rows;
}

export async function addTaskHistoryEntry(taskId, { workerId, status, reached, outcome, notes, anotherFollowUp }) {
  const [result] = await getPool().query(
    `INSERT INTO follow_up_task_history
      (task_id, worker_id, status, reached, outcome, notes, another_follow_up)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [taskId, workerId ?? null, status, reached ?? null, outcome ?? null, notes ?? null, Boolean(anotherFollowUp)]
  );
  const [rows] = await getPool().query("SELECT * FROM follow_up_task_history WHERE id = ?", [result.insertId]);
  return rows[0] ?? null;
}

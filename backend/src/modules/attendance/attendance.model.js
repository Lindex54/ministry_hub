import { getPool } from "../../config/database.js";

export async function listOccurrences({ branchId, serviceId } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  if (serviceId) { clauses.push("service_id = ?"); params.push(serviceId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM attendance_occurrences ${where} ORDER BY occurrence_date DESC`,
    params
  );
  return rows;
}

export async function findOccurrenceById(id) {
  const [rows] = await getPool().query("SELECT * FROM attendance_occurrences WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function findOccurrence({ branchId, serviceId, occurrenceDate }) {
  const [rows] = await getPool().query(
    "SELECT * FROM attendance_occurrences WHERE branch_id = ? AND service_id = ? AND occurrence_date = ?",
    [branchId, serviceId, occurrenceDate]
  );
  return rows[0] ?? null;
}

export async function createOccurrence({ branchId, serviceId, occurrenceDate }) {
  const [result] = await getPool().query(
    "INSERT INTO attendance_occurrences (branch_id, service_id, occurrence_date) VALUES (?, ?, ?)",
    [branchId, serviceId, occurrenceDate]
  );
  return findOccurrenceById(result.insertId);
}

export async function deleteOccurrence(id) {
  const [result] = await getPool().query("DELETE FROM attendance_occurrences WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getExpectedMembers(occurrenceId) {
  const [rows] = await getPool().query(
    "SELECT member_id FROM attendance_expected_members WHERE occurrence_id = ?",
    [occurrenceId]
  );
  return rows.map((row) => row.member_id);
}

export async function setExpectedMembers(occurrenceId, memberIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM attendance_expected_members WHERE occurrence_id = ?", [occurrenceId]);
    if (memberIds.length) {
      const values = memberIds.map((memberId) => [occurrenceId, memberId]);
      await connection.query("INSERT INTO attendance_expected_members (occurrence_id, member_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getExpectedMembers(occurrenceId);
}

export async function getOccurrenceRecords(occurrenceId) {
  const [rows] = await getPool().query(
    "SELECT * FROM attendance_records WHERE occurrence_id = ?",
    [occurrenceId]
  );
  return rows;
}

export async function upsertAttendanceRecord(occurrenceId, { personType, personId, status, category }) {
  await getPool().query(
    `INSERT INTO attendance_records (occurrence_id, person_type, person_id, status, category)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = VALUES(status), category = VALUES(category)`,
    [occurrenceId, personType, personId, status, category ?? null]
  );
  const [rows] = await getPool().query(
    "SELECT * FROM attendance_records WHERE occurrence_id = ? AND person_type = ? AND person_id = ?",
    [occurrenceId, personType, personId]
  );
  return rows[0] ?? null;
}

export async function deleteAttendanceRecord(occurrenceId, personType, personId) {
  const [result] = await getPool().query(
    "DELETE FROM attendance_records WHERE occurrence_id = ? AND person_type = ? AND person_id = ?",
    [occurrenceId, personType, personId]
  );
  return result.affectedRows > 0;
}

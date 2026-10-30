import { getPool } from "../../config/database.js";

export async function listEvents({ branchId } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(`SELECT * FROM events ${where} ORDER BY event_date ASC`, params);
  return rows;
}

export async function findEventById(id) {
  const [rows] = await getPool().query("SELECT * FROM events WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createEvent({ name, eventDate, branchId }) {
  const [result] = await getPool().query(
    "INSERT INTO events (name, event_date, branch_id) VALUES (?, ?, ?)",
    [name, eventDate, branchId ?? null]
  );
  return findEventById(result.insertId);
}

export async function updateEvent(id, { name, eventDate, branchId }) {
  await getPool().query(
    "UPDATE events SET name = ?, event_date = ?, branch_id = ? WHERE id = ?",
    [name, eventDate, branchId ?? null, id]
  );
  return findEventById(id);
}

export async function deleteEvent(id) {
  const [result] = await getPool().query("DELETE FROM events WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getEventAttendees(eventId) {
  const [rows] = await getPool().query(
    "SELECT person_type, person_id FROM event_attendees WHERE event_id = ?",
    [eventId]
  );
  return rows;
}

export async function setEventAttendees(eventId, attendees) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM event_attendees WHERE event_id = ?", [eventId]);
    if (attendees.length) {
      const values = attendees.map(({ personType, personId }) => [eventId, personType, personId]);
      await connection.query("INSERT INTO event_attendees (event_id, person_type, person_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getEventAttendees(eventId);
}

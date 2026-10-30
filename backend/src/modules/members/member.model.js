import { getPool } from "../../config/database.js";

const COLUMNS = [
  "membership_number", "first_name", "last_name", "preferred_name", "gender",
  "date_of_birth", "profile_photo", "primary_phone", "alternative_phone", "email",
  "district", "address", "branch_id", "date_joined", "status", "emergency_name",
  "emergency_relationship", "emergency_phone", "consent_to_contact", "sms_opt_in",
  "email_opt_in",
];

export async function listMembers({ branchId, status } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("branch_id = ?"); params.push(branchId); }
  if (status) { clauses.push("status = ?"); params.push(status); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(
    `SELECT * FROM members ${where} ORDER BY first_name ASC, last_name ASC`,
    params
  );
  return rows;
}

export async function findMemberById(id) {
  const [rows] = await getPool().query("SELECT * FROM members WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function findMemberByMembershipNumber(membershipNumber) {
  const [rows] = await getPool().query("SELECT * FROM members WHERE membership_number = ?", [membershipNumber]);
  return rows[0] ?? null;
}

export async function createMember(data) {
  const values = COLUMNS.map((column) => data[column] ?? null);
  const [result] = await getPool().query(
    `INSERT INTO members (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    values
  );
  return findMemberById(result.insertId);
}

export async function updateMember(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findMemberById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE members SET ${assignments} WHERE id = ?`, [...values, id]);
  return findMemberById(id);
}

export async function deleteMember(id) {
  const [result] = await getPool().query("DELETE FROM members WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getMemberMinistries(memberId) {
  const [rows] = await getPool().query(
    "SELECT mi.* FROM ministries mi INNER JOIN member_ministries mm ON mm.ministry_id = mi.id WHERE mm.member_id = ? ORDER BY mi.name ASC",
    [memberId]
  );
  return rows;
}

export async function setMemberMinistries(memberId, ministryIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM member_ministries WHERE member_id = ?", [memberId]);
    if (ministryIds.length) {
      const values = ministryIds.map((ministryId) => [memberId, ministryId]);
      await connection.query("INSERT INTO member_ministries (member_id, ministry_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getMemberMinistries(memberId);
}

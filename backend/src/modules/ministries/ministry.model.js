import { getPool } from "../../config/database.js";

const COLUMNS = [
  "name", "description", "leader_type", "leader_id", "assistant_leader_type",
  "assistant_leader_id", "date_established", "status",
];

export async function listMinistries({ status } = {}) {
  const clauses = [];
  const params = [];
  if (status) { clauses.push("status = ?"); params.push(status); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(`SELECT * FROM ministries ${where} ORDER BY name ASC`, params);
  return rows;
}

export async function findMinistryById(id) {
  const [rows] = await getPool().query("SELECT * FROM ministries WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createMinistry(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO ministries (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findMinistryById(result.insertId);
}

export async function updateMinistry(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findMinistryById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE ministries SET ${assignments} WHERE id = ?`, [...values, id]);
  return findMinistryById(id);
}

export async function deleteMinistry(id) {
  const [result] = await getPool().query("DELETE FROM ministries WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getMinistryBranches(ministryId) {
  const [rows] = await getPool().query(
    "SELECT b.* FROM branches b INNER JOIN ministry_branches mb ON mb.branch_id = b.id WHERE mb.ministry_id = ? ORDER BY b.name ASC",
    [ministryId]
  );
  return rows;
}

export async function setMinistryBranches(ministryId, branchIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM ministry_branches WHERE ministry_id = ?", [ministryId]);
    if (branchIds.length) {
      const values = branchIds.map((branchId) => [ministryId, branchId]);
      await connection.query("INSERT INTO ministry_branches (ministry_id, branch_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getMinistryBranches(ministryId);
}

export async function getMinistryMembers(ministryId) {
  const [rows] = await getPool().query(
    "SELECT m.* FROM members m INNER JOIN member_ministries mm ON mm.member_id = m.id WHERE mm.ministry_id = ? ORDER BY m.first_name ASC",
    [ministryId]
  );
  return rows;
}

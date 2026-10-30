import { getPool } from "../../config/database.js";

const COLUMNS = ["name", "email", "password_hash", "role_id", "staff_id", "status", "last_login_at"];

export async function listUsers({ status, roleId } = {}) {
  const clauses = [];
  const params = [];
  if (status) { clauses.push("status = ?"); params.push(status); }
  if (roleId) { clauses.push("role_id = ?"); params.push(roleId); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().query(`SELECT * FROM users ${where} ORDER BY name ASC`, params);
  return rows;
}

export async function findUserById(id) {
  const [rows] = await getPool().query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function findUserByEmail(email) {
  const [rows] = await getPool().query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] ?? null;
}

export async function createUser(data) {
  const values = COLUMNS.map((column) => data[column] ?? null);
  const [result] = await getPool().query(
    `INSERT INTO users (${COLUMNS.join(", ")}) VALUES (${COLUMNS.map(() => "?").join(", ")})`,
    values
  );
  return findUserById(result.insertId);
}

export async function updateUser(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findUserById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE users SET ${assignments} WHERE id = ?`, [...values, id]);
  return findUserById(id);
}

export async function deleteUser(id) {
  const [result] = await getPool().query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getUserBranches(userId) {
  const [rows] = await getPool().query(
    "SELECT b.* FROM branches b INNER JOIN user_branches ub ON ub.branch_id = b.id WHERE ub.user_id = ? ORDER BY b.name ASC",
    [userId]
  );
  return rows;
}

export async function setUserBranches(userId, branchIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM user_branches WHERE user_id = ?", [userId]);
    if (branchIds.length) {
      const values = branchIds.map((branchId) => [userId, branchId]);
      await connection.query("INSERT INTO user_branches (user_id, branch_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getUserBranches(userId);
}

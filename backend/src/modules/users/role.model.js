import { getPool } from "../../config/database.js";

export async function listRoles() {
  const [rows] = await getPool().query("SELECT * FROM roles ORDER BY name ASC");
  return rows;
}

export async function findRoleById(id) {
  const [rows] = await getPool().query("SELECT * FROM roles WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createRole({ name, description }) {
  const [result] = await getPool().query(
    "INSERT INTO roles (name, description) VALUES (?, ?)",
    [name, description ?? null]
  );
  return findRoleById(result.insertId);
}

export async function updateRole(id, { name, description }) {
  await getPool().query("UPDATE roles SET name = ?, description = ? WHERE id = ?", [name, description ?? null, id]);
  return findRoleById(id);
}

export async function deleteRole(id) {
  const [result] = await getPool().query("DELETE FROM roles WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getRolePermissions(roleId) {
  const [rows] = await getPool().query(
    "SELECT p.* FROM permissions p INNER JOIN role_permissions rp ON rp.permission_id = p.id WHERE rp.role_id = ? ORDER BY p.name ASC",
    [roleId]
  );
  return rows;
}

export async function setRolePermissions(roleId, permissionIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);
    if (permissionIds.length) {
      const values = permissionIds.map((permissionId) => [roleId, permissionId]);
      await connection.query("INSERT INTO role_permissions (role_id, permission_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getRolePermissions(roleId);
}

import { getPool } from "../../config/database.js";

export async function listPermissions() {
  const [rows] = await getPool().query("SELECT * FROM permissions ORDER BY name ASC");
  return rows;
}

export async function findPermissionById(id) {
  const [rows] = await getPool().query("SELECT * FROM permissions WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createPermission({ name, description }) {
  const [result] = await getPool().query(
    "INSERT INTO permissions (name, description) VALUES (?, ?)",
    [name, description ?? null]
  );
  return findPermissionById(result.insertId);
}

export async function deletePermission(id) {
  const [result] = await getPool().query("DELETE FROM permissions WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

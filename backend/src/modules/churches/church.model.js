import { getPool } from "../../config/database.js";

export async function listChurches() {
  const [rows] = await getPool().query("SELECT * FROM churches ORDER BY name ASC");
  return rows;
}

export async function findChurchById(id) {
  const [rows] = await getPool().query("SELECT * FROM churches WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createChurch({ name }) {
  const [result] = await getPool().query("INSERT INTO churches (name) VALUES (?)", [name]);
  return findChurchById(result.insertId);
}

export async function updateChurch(id, { name }) {
  await getPool().query("UPDATE churches SET name = ? WHERE id = ?", [name, id]);
  return findChurchById(id);
}

export async function deleteChurch(id) {
  const [result] = await getPool().query("DELETE FROM churches WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

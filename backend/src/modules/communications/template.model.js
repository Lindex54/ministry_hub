import { getPool } from "../../config/database.js";

export async function listTemplates() {
  const [rows] = await getPool().query("SELECT * FROM communication_templates ORDER BY name ASC");
  return rows;
}

export async function findTemplateById(id) {
  const [rows] = await getPool().query("SELECT * FROM communication_templates WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createTemplate({ name, subject, body }) {
  const [result] = await getPool().query(
    "INSERT INTO communication_templates (name, subject, body) VALUES (?, ?, ?)",
    [name, subject ?? null, body]
  );
  return findTemplateById(result.insertId);
}

export async function updateTemplate(id, { name, subject, body }) {
  await getPool().query(
    "UPDATE communication_templates SET name = ?, subject = ?, body = ? WHERE id = ?",
    [name, subject ?? null, body, id]
  );
  return findTemplateById(id);
}

export async function deleteTemplate(id) {
  const [result] = await getPool().query("DELETE FROM communication_templates WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

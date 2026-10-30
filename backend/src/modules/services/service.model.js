import { getPool } from "../../config/database.js";

export async function listServices() {
  const [rows] = await getPool().query("SELECT * FROM services ORDER BY name ASC");
  return rows;
}

export async function findServiceById(id) {
  const [rows] = await getPool().query("SELECT * FROM services WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createService({ name, description }) {
  const [result] = await getPool().query(
    "INSERT INTO services (name, description) VALUES (?, ?)",
    [name, description ?? null]
  );
  return findServiceById(result.insertId);
}

export async function updateService(id, { name, description }) {
  await getPool().query("UPDATE services SET name = ?, description = ? WHERE id = ?", [name, description ?? null, id]);
  return findServiceById(id);
}

export async function deleteService(id) {
  const [result] = await getPool().query("DELETE FROM services WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getBranchServices(branchId) {
  const [rows] = await getPool().query(
    "SELECT s.* FROM services s INNER JOIN branch_services bs ON bs.service_id = s.id WHERE bs.branch_id = ? ORDER BY s.name ASC",
    [branchId]
  );
  return rows;
}

export async function setBranchServices(branchId, serviceIds) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM branch_services WHERE branch_id = ?", [branchId]);
    if (serviceIds.length) {
      const values = serviceIds.map((serviceId) => [branchId, serviceId]);
      await connection.query("INSERT INTO branch_services (branch_id, service_id) VALUES ?", [values]);
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  return getBranchServices(branchId);
}

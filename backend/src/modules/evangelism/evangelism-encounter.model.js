import { getPool } from "../../config/database.js";

export async function getEncountersForContact(contactId) {
  const [rows] = await getPool().query(
    "SELECT * FROM evangelism_encounters WHERE evangelism_contact_id = ? ORDER BY encounter_date DESC",
    [contactId]
  );
  return rows;
}

export async function findEncounterById(id) {
  const [rows] = await getPool().query("SELECT * FROM evangelism_encounters WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function addEncounter({ evangelismContactId, encounterDate, location, activityId, evangelizedBy, response, notes }) {
  const [result] = await getPool().query(
    `INSERT INTO evangelism_encounters
      (evangelism_contact_id, encounter_date, location, activity_id, evangelized_by, response, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [evangelismContactId, encounterDate, location ?? null, activityId ?? null, evangelizedBy ?? null, response ?? null, notes ?? null]
  );
  return findEncounterById(result.insertId);
}

export async function updateEncounter(id, data) {
  const columnMap = {
    encounterDate: "encounter_date", location: "location", activityId: "activity_id",
    evangelizedBy: "evangelized_by", response: "response", notes: "notes",
  };
  const keys = Object.keys(data).filter((key) => key in columnMap);
  if (!keys.length) return findEncounterById(id);
  const assignments = keys.map((key) => `${columnMap[key]} = ?`).join(", ");
  const values = keys.map((key) => data[key]);
  await getPool().query(`UPDATE evangelism_encounters SET ${assignments} WHERE id = ?`, [...values, id]);
  return findEncounterById(id);
}

export async function deleteEncounter(id) {
  const [result] = await getPool().query("DELETE FROM evangelism_encounters WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

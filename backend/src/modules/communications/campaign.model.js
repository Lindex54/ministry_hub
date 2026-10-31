import { getPool } from "../../config/database.js";

const COLUMNS = [
  "title", "channel", "subject", "body", "timing", "scheduled_at", "association",
  "status", "recipient_count", "simulated_at", "sent_at", "created_by",
];

export async function listCampaigns() {
  const [rows] = await getPool().query("SELECT * FROM communication_campaigns ORDER BY created_at DESC");
  return rows;
}

export async function findCampaignById(id) {
  const [rows] = await getPool().query("SELECT * FROM communication_campaigns WHERE id = ?", [id]);
  return rows[0] ?? null;
}

export async function createCampaign(data) {
  const columns = COLUMNS.filter((column) => column in data);
  const values = columns.map((column) => data[column]);
  const [result] = await getPool().query(
    `INSERT INTO communication_campaigns (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return findCampaignById(result.insertId);
}

export async function updateCampaign(id, data) {
  const columns = COLUMNS.filter((column) => column in data);
  if (!columns.length) return findCampaignById(id);
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  const values = columns.map((column) => data[column]);
  await getPool().query(`UPDATE communication_campaigns SET ${assignments} WHERE id = ?`, [...values, id]);
  return findCampaignById(id);
}

export async function deleteCampaign(id) {
  const [result] = await getPool().query("DELETE FROM communication_campaigns WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function getCampaignRecipients(campaignId) {
  const [rows] = await getPool().query(
    "SELECT * FROM communication_campaign_recipients WHERE campaign_id = ?",
    [campaignId]
  );
  return rows;
}

export async function addCampaignRecipients(campaignId, recipients) {
  if (!recipients.length) return getCampaignRecipients(campaignId);
  const values = recipients.map(({ personType, personId, name, destination, deliveryStatus }) => [
    campaignId, personType, personId, name ?? null, destination ?? null, deliveryStatus ?? "pending",
  ]);
  await getPool().query(
    "INSERT INTO communication_campaign_recipients (campaign_id, person_type, person_id, name, destination, delivery_status) VALUES ?",
    [values]
  );
  return getCampaignRecipients(campaignId);
}

export async function updateCampaignRecipient(id, data) {
  const allowed = ["delivery_status", "error_message", "sent_at"];
  const columns = allowed.filter((column) => column in data);
  if (!columns.length) return null;
  const assignments = columns.map((column) => `${column} = ?`).join(", ");
  await getPool().query(
    `UPDATE communication_campaign_recipients SET ${assignments} WHERE id = ?`,
    [...columns.map((column) => data[column]), id]
  );
  const [rows] = await getPool().query("SELECT * FROM communication_campaign_recipients WHERE id = ?", [id]);
  return rows[0] ?? null;
}

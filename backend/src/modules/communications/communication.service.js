import { getPool } from "../../config/database.js";
import { isEmailConfigured } from "../../config/environment.js";
import { sendEmail } from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";
import {
  addCampaignRecipients,
  createCampaign,
  getCampaignRecipients,
  listCampaigns,
  updateCampaign,
  updateCampaignRecipient,
} from "./campaign.model.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function personalize(body, name) {
  return body.replaceAll("{{name}}", name || "friend");
}

function toApiRecipient(row) {
  return {
    id: String(row.id),
    key: `${row.person_type}:${row.person_id}`,
    name: row.name ?? "",
    destination: row.destination ?? "",
    deliveryStatus: row.delivery_status,
    errorMessage: row.error_message ?? "",
    sentAt: row.sent_at,
  };
}

function toApiCampaign(row, recipients = []) {
  return {
    id: String(row.id),
    title: row.title,
    channel: row.channel,
    subject: row.subject ?? "",
    body: row.body,
    timing: row.timing,
    scheduledAt: row.scheduled_at,
    association: row.association ?? "none",
    status: row.status,
    recipientCount: row.recipient_count,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    recipients: recipients.map(toApiRecipient),
  };
}

async function resolveRecipients(requested) {
  const memberIds = [...new Set(requested.filter((item) => item.personType === "member").map((item) => item.personId))];
  const visitorIds = [...new Set(requested.filter((item) => item.personType === "visitor").map((item) => item.personId))];
  const resolved = [];

  if (memberIds.length) {
    const [members] = await getPool().query(
      `SELECT id, first_name, last_name, preferred_name, email, consent_to_contact, email_opt_in
       FROM members WHERE id IN (?)`,
      [memberIds]
    );
    for (const member of members) {
      if (!member.consent_to_contact || !member.email_opt_in || !EMAIL_PATTERN.test(member.email ?? "")) continue;
      resolved.push({
        personType: "member",
        personId: member.id,
        name: member.preferred_name || `${member.first_name} ${member.last_name}`.trim(),
        destination: member.email.trim().toLowerCase(),
      });
    }
  }

  if (visitorIds.length) {
    const [visitors] = await getPool().query(
      `SELECT id, first_name, last_name, email, permission_to_contact
       FROM visitors WHERE id IN (?)`,
      [visitorIds]
    );
    for (const visitor of visitors) {
      if (!visitor.permission_to_contact || !EMAIL_PATTERN.test(visitor.email ?? "")) continue;
      resolved.push({
        personType: "visitor",
        personId: visitor.id,
        name: `${visitor.first_name} ${visitor.last_name}`.trim(),
        destination: visitor.email.trim().toLowerCase(),
      });
    }
  }

  const seen = new Set();
  return resolved.filter((recipient) => {
    if (seen.has(recipient.destination)) return false;
    seen.add(recipient.destination);
    return true;
  });
}

export async function listEmailCampaigns() {
  const campaigns = await listCampaigns();
  return Promise.all(campaigns.map(async (campaign) => (
    toApiCampaign(campaign, await getCampaignRecipients(campaign.id))
  )));
}

export async function sendEmailCampaign(values) {
  if (!isEmailConfigured()) {
    throw AppError.conflict("SMTP email is not configured. Add the SMTP settings and app password first.");
  }

  const recipients = await resolveRecipients(values.recipients);
  if (!recipients.length) {
    throw AppError.badRequest("No eligible recipients remain. Check consent, email opt-in, and email addresses.");
  }

  let campaign = await createCampaign({
    title: values.title,
    channel: "email",
    subject: values.subject,
    body: values.body,
    timing: "now",
    scheduled_at: null,
    association: values.association === "none" ? null : values.association,
    status: "Sending",
    recipient_count: recipients.length,
  });
  const deliveryRows = await addCampaignRecipients(campaign.id, recipients);

  let sentCount = 0;
  for (const delivery of deliveryRows) {
    try {
      await sendEmail({
        to: delivery.destination,
        subject: values.subject,
        text: personalize(values.body, delivery.name),
      });
      sentCount += 1;
      await updateCampaignRecipient(delivery.id, {
        delivery_status: "sent",
        error_message: null,
        sent_at: new Date(),
      });
    } catch (error) {
      await updateCampaignRecipient(delivery.id, {
        delivery_status: "failed",
        error_message: String(error.message ?? "SMTP delivery failed").slice(0, 500),
      });
    }
  }

  const status = sentCount === recipients.length ? "Sent" : sentCount ? "Partially sent" : "Failed";
  campaign = await updateCampaign(campaign.id, { status, sent_at: sentCount ? new Date() : null });
  return toApiCampaign(campaign, await getCampaignRecipients(campaign.id));
}

export const workers = [
  { id: "worker-sarah", name: "Sarah Kato", role: "Pastor" },
  { id: "worker-daniel", name: "Daniel Mugisha", role: "Evangelist" },
  { id: "worker-grace", name: "Grace Atim", role: "Church worker" },
  { id: "worker-peter", name: "Peter Lwanga", role: "Church worker" },
];

export const evangelismContacts = [
  { id: "contact-001", firstName: "Rose", lastName: "Nankya", phone: "0772 601 308", email: "", address: "Kawempe, Kampala", branch: "Kawempe Branch", consent: true },
  { id: "contact-002", firstName: "James", lastName: "Obote", phone: "0701 520 663", email: "james.obote@example.org", address: "Kira, Wakiso", branch: "Kira Branch", consent: false },
];

export const events = [
  { id: "leadership", name: "Leadership Planning Meeting", date: "2026-10-28", people: ["member:member-001", "member:member-002", "member:member-005"] },
  { id: "youth", name: "Youth Worship Night", date: "2026-10-30", people: ["member:member-003", "member:member-007", "visitor:visitor-003", "visitor:visitor-010"] },
  { id: "outreach", name: "Community Outreach", date: "2026-11-01", people: ["member:member-005", "member:member-010", "visitor:visitor-005"] },
];

// Explicit demonstration preferences, independent of membership status.
export const memberPreferences = {
  "member-001": { consent: true, sms: true, email: true },
  "member-002": { consent: true, sms: true, email: false },
  "member-003": { consent: true, sms: true, email: true },
  "member-004": { consent: false, sms: false, email: false },
  "member-005": { consent: true, sms: true, email: true },
  "member-006": { consent: true, sms: true, email: false },
  "member-007": { consent: true, sms: false, email: true },
  "member-008": { consent: false, sms: false, email: false },
  "member-009": { consent: true, sms: false, email: false },
  "member-010": { consent: true, sms: true, email: true },
  "member-011": { consent: true, sms: true, email: true },
  "member-012": { consent: true, sms: true, email: true },
};

export const templates = [
  { id: "sunday", name: "Sunday service reminder", subject: "Join us this Sunday", body: "Hello {{name}}, join us for Sunday Main Service at 10:00 AM. We look forward to worshipping together. — Ministry Hub" },
  { id: "event", name: "Event invitation", subject: "You are invited", body: "Hello {{name}}, you are invited to our upcoming church gathering. Please contact the church office for event details. — Ministry Hub" },
  { id: "announcement", name: "Church announcement", subject: "Church announcement", body: "Hello {{name}}, here is an update from our church office: [add announcement details]. — Ministry Hub" },
  { id: "ministry", name: "Ministry meeting", subject: "Ministry meeting reminder", body: "Hello {{name}}, a reminder about our ministry meeting. [Add date, time, and location.] — Ministry Hub" },
];

export const taskStatuses = ["Pending", "In Progress", "Completed", "Unable to Reach"];
export const followUpMethods = ["Phone Call", "Physical Visit"];

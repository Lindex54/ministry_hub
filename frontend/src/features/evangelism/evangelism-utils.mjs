import { normalizePhone } from "../outreach/outreach-utils.mjs";

export function findRecordByPhone(records, phone) {
  if (!phone) return null;
  const normalized = normalizePhone(phone);
  return records.find((record) => record.phone && normalizePhone(record.phone) === normalized) ?? null;
}

export function peopleEvangelized(records, activities) {
  const headcountReached = activities.reduce((total, activity) => total + (Number(activity.headcount) || 0), 0);
  return records.length + headcountReached;
}

export function countSoulsAccepted(records) {
  return records.filter((record) => record.history.some((entry) => entry.response === "Accepted Christ")).length;
}

export function countPositiveResponses(records) {
  return records.filter((record) => {
    const latest = [...record.history].sort((a, b) => b.date.localeCompare(a.date))[0];
    return latest && (latest.response === "Accepted Christ" || latest.response === "Interested");
  }).length;
}

export function countIndividuallyLinked(records, activityId) {
  return new Set(records.filter((record) => record.history.some((entry) => entry.activityId === activityId)).map((record) => record.id)).size;
}

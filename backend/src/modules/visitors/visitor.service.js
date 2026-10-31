import { getPool } from "../../config/database.js";
import {
  findVisitorById, createVisitor, updateVisitor as updateVisitorRow, addVisitorVisit,
} from "./visitor.model.js";

const COLUMN_MAP = {
  firstName: "first_name", lastName: "last_name", phone: "phone", email: "email",
  gender: "gender", districtAddress: "district_address", invitedBy: "invited_by",
  prayerRequest: "prayer_request", permissionToContact: "permission_to_contact",
  convertedMemberId: "converted_member_id",
};

function normalizePhone(value = "") {
  return value.replace(/[\s()-]/g, "").replace(/^0/, "+256");
}

function toApiVisitHistory(rows) {
  return rows.map((row) => ({
    id: `visit-${row.id}`,
    date: row.visit_date,
    service: row.service_name ?? "",
    notes: row.notes ?? "",
  }));
}

async function getVisitsWithServiceName(visitorId) {
  const [rows] = await getPool().query(
    `SELECT vv.*, s.name AS service_name FROM visitor_visits vv
     LEFT JOIN services s ON s.id = vv.service_id
     WHERE vv.visitor_id = ? ORDER BY vv.visit_date DESC`,
    [visitorId]
  );
  return rows;
}

function toApiVisitor(row, visitRows) {
  return {
    id: String(row.id),
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    gender: row.gender ?? "",
    districtAddress: row.district_address ?? "",
    invitedBy: row.invited_by ?? "",
    prayerRequest: row.prayer_request ?? "",
    permissionToContact: Boolean(row.permission_to_contact),
    convertedMemberId: row.converted_member_id ? String(row.converted_member_id) : undefined,
    visitHistory: toApiVisitHistory(visitRows),
    followUps: [],
  };
}

export async function listApiVisitors() {
  const [rows] = await getPool().query("SELECT * FROM visitors ORDER BY first_name ASC, last_name ASC");
  const visitsByVisitor = await getPool().query(
    `SELECT vv.*, s.name AS service_name FROM visitor_visits vv
     LEFT JOIN services s ON s.id = vv.service_id
     ORDER BY vv.visit_date DESC`
  ).then(([visitRows]) => {
    const map = new Map();
    for (const visit of visitRows) {
      if (!map.has(visit.visitor_id)) map.set(visit.visitor_id, []);
      map.get(visit.visitor_id).push(visit);
    }
    return map;
  });
  return rows.map((row) => toApiVisitor(row, visitsByVisitor.get(row.id) ?? []));
}

export async function getApiVisitorById(id) {
  const row = await findVisitorById(id);
  if (!row) return null;
  const visits = await getVisitsWithServiceName(id);
  return toApiVisitor(row, visits);
}

async function resolveServiceId(serviceName) {
  if (!serviceName) return null;
  const [rows] = await getPool().query("SELECT id FROM services WHERE name = ?", [serviceName]);
  return rows[0]?.id ?? null;
}

async function resolveBranchId(branchName) {
  if (!branchName) return null;
  const [rows] = await getPool().query("SELECT id FROM branches WHERE name = ?", [branchName]);
  return rows[0]?.id ?? null;
}

function pickColumns(values) {
  const data = {};
  for (const [key, column] of Object.entries(COLUMN_MAP)) {
    if (key in values && values[key] !== undefined) data[column] = values[key] === "" ? null : values[key];
  }
  return data;
}

async function findVisitorByPhone(phone) {
  const target = normalizePhone(phone);
  const [rows] = await getPool().query("SELECT id, phone FROM visitors");
  return rows.find((row) => normalizePhone(row.phone ?? "") === target) ?? null;
}

// Mirrors the mock VisitorsProvider.addVisitor behavior: a new registration whose
// phone matches an existing visitor is treated as a returning visit, merging in any
// newly-provided fields rather than creating a duplicate record.
export async function createApiVisitor(values) {
  const match = await findVisitorByPhone(values.phone);

  if (match) {
    const existing = await findVisitorById(match.id);
    const mergeData = {};
    if (values.firstName) mergeData.first_name = values.firstName;
    if (values.lastName) mergeData.last_name = values.lastName;
    if (values.email) mergeData.email = values.email;
    if (values.gender) mergeData.gender = values.gender;
    if (values.districtAddress) mergeData.district_address = values.districtAddress;
    if (values.invitedBy) mergeData.invited_by = values.invitedBy;
    if (values.prayerRequest) mergeData.prayer_request = values.prayerRequest;
    mergeData.permission_to_contact = Boolean(existing.permission_to_contact) || Boolean(values.permissionToContact);
    if (Object.keys(mergeData).length) await updateVisitorRow(match.id, mergeData);

    if (values.dateOfVisit && values.serviceAttended) {
      const serviceId = await resolveServiceId(values.serviceAttended);
      await addVisitorVisit(match.id, { visitDate: values.dateOfVisit, serviceId, notes: "Returning visit recorded during registration." });
    }

    return { visitor: await getApiVisitorById(match.id), isReturning: true };
  }

  const data = pickColumns(values);
  if (values.branch) {
    const branchId = await resolveBranchId(values.branch);
    if (branchId) data.branch_id = branchId;
  }

  const created = await createVisitor(data);

  if (values.dateOfVisit && values.serviceAttended) {
    const serviceId = await resolveServiceId(values.serviceAttended);
    await addVisitorVisit(created.id, { visitDate: values.dateOfVisit, serviceId, notes: "Initial visitor registration." });
  }

  return { visitor: await getApiVisitorById(created.id), isReturning: false };
}

export async function updateApiVisitor(id, values) {
  const existing = await findVisitorById(id);
  if (!existing) return null;

  const data = pickColumns(values);
  if (Object.keys(data).length) await updateVisitorRow(id, data);

  return getApiVisitorById(id);
}

export async function addApiVisit(visitorId, { date, service, notes }) {
  const existing = await findVisitorById(visitorId);
  if (!existing) return null;
  const serviceId = await resolveServiceId(service);
  await addVisitorVisit(visitorId, { visitDate: date, serviceId, notes: notes ?? "" });
  return getApiVisitorById(visitorId);
}

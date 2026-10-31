import { getPool } from "../../config/database.js";
import {
  findMemberById, createMember, updateMember as updateMemberRow, setMemberMinistries,
} from "./member.model.js";

const COLUMN_MAP = {
  firstName: "first_name", lastName: "last_name", preferredName: "preferred_name",
  gender: "gender", dateOfBirth: "date_of_birth", profilePhoto: "profile_photo",
  primaryPhone: "primary_phone", alternativePhone: "alternative_phone", email: "email",
  district: "district", address: "address", dateJoined: "date_joined", status: "status",
  emergencyName: "emergency_name", emergencyRelationship: "emergency_relationship",
  emergencyPhone: "emergency_phone",
};

function toApiMember(row, ministryNames) {
  return {
    id: String(row.id),
    membershipNumber: row.membership_number,
    firstName: row.first_name,
    lastName: row.last_name,
    preferredName: row.preferred_name ?? "",
    gender: row.gender ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    profilePhoto: row.profile_photo ?? "",
    primaryPhone: row.primary_phone ?? "",
    alternativePhone: row.alternative_phone ?? "",
    email: row.email ?? "",
    district: row.district ?? "",
    address: row.address ?? "",
    branch: row.branch_name ?? "",
    dateJoined: row.date_joined ?? "",
    status: row.status,
    ministries: ministryNames,
    emergencyName: row.emergency_name ?? "",
    emergencyRelationship: row.emergency_relationship ?? "",
    emergencyPhone: row.emergency_phone ?? "",
  };
}

async function getMinistryNamesByMemberId(memberIds) {
  const map = new Map(memberIds.map((id) => [id, []]));
  if (!memberIds.length) return map;
  const [rows] = await getPool().query(
    `SELECT mm.member_id, mi.name FROM member_ministries mm
     INNER JOIN ministries mi ON mi.id = mm.ministry_id
     WHERE mm.member_id IN (?)`,
    [memberIds]
  );
  for (const row of rows) map.get(row.member_id)?.push(row.name);
  return map;
}

export async function listApiMembers({ branchId, status } = {}) {
  const clauses = [];
  const params = [];
  if (branchId) { clauses.push("m.branch_id = ?"); params.push(branchId); }
  if (status) { clauses.push("m.status = ?"); params.push(status); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const [rows] = await getPool().query(
    `SELECT m.*, b.name AS branch_name FROM members m
     LEFT JOIN branches b ON b.id = m.branch_id
     ${where}
     ORDER BY m.first_name ASC, m.last_name ASC`,
    params
  );
  const ministryMap = await getMinistryNamesByMemberId(rows.map((row) => row.id));
  return rows.map((row) => toApiMember(row, ministryMap.get(row.id) ?? []));
}

export async function getApiMemberById(id) {
  const [rows] = await getPool().query(
    `SELECT m.*, b.name AS branch_name FROM members m
     LEFT JOIN branches b ON b.id = m.branch_id
     WHERE m.id = ?`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const ministryMap = await getMinistryNamesByMemberId([row.id]);
  return toApiMember(row, ministryMap.get(row.id) ?? []);
}

async function resolveBranchId(branchName) {
  const [rows] = await getPool().query("SELECT id FROM branches WHERE name = ?", [branchName]);
  return rows[0]?.id ?? null;
}

async function resolveMinistryIds(ministryNames) {
  const names = (ministryNames ?? []).filter((name) => name && name !== "None");
  if (!names.length) return [];
  const [rows] = await getPool().query("SELECT id FROM ministries WHERE name IN (?)", [names]);
  return rows.map((row) => row.id);
}

async function nextMembershipNumber() {
  const year = new Date().getFullYear();
  const [rows] = await getPool().query(
    "SELECT membership_number FROM members WHERE membership_number LIKE ? ORDER BY membership_number DESC LIMIT 1",
    [`MH-${year}-%`]
  );
  const last = rows[0]?.membership_number;
  const lastSeq = last ? Number(last.split("-").at(-1)) : 0;
  const nextSeq = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `MH-${year}-${String(nextSeq).padStart(4, "0")}`;
}

export async function previewNextMembershipNumber() {
  return nextMembershipNumber();
}

function pickColumns(values) {
  const data = {};
  for (const [key, column] of Object.entries(COLUMN_MAP)) {
    if (key in values && values[key] !== undefined) data[column] = values[key] === "" ? null : values[key];
  }
  return data;
}

export async function createApiMember(values) {
  let branchId = null;
  if (values.branch) {
    branchId = await resolveBranchId(values.branch);
    if (!branchId) throw Object.assign(new Error(`Unknown branch "${values.branch}".`), { statusCode: 400 });
  }

  const data = pickColumns(values);
  data.membership_number = await nextMembershipNumber();
  if (branchId) data.branch_id = branchId;
  if (!data.status) data.status = "Active";

  const created = await createMember(data);
  const ministryIds = await resolveMinistryIds(values.ministries);
  if (ministryIds.length) await setMemberMinistries(created.id, ministryIds);

  return getApiMemberById(created.id);
}

export async function updateApiMember(id, values) {
  const existing = await findMemberById(id);
  if (!existing) return null;

  const data = pickColumns(values);
  if (values.branch) {
    const branchId = await resolveBranchId(values.branch);
    if (!branchId) throw Object.assign(new Error(`Unknown branch "${values.branch}".`), { statusCode: 400 });
    data.branch_id = branchId;
  }
  if (Object.keys(data).length) await updateMemberRow(id, data);

  if (values.ministries) {
    const ministryIds = await resolveMinistryIds(values.ministries);
    await setMemberMinistries(id, ministryIds);
  }

  return getApiMemberById(id);
}

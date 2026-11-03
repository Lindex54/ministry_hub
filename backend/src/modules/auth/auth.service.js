import bcrypt from "bcryptjs";
import { getPool } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { findUserByUsername, findUserByEmail, findUserById, updateUser } from "../users/user.model.js";
import { findRoleById, getRolePermissions } from "../users/role.model.js";

// Uganda administrative location hierarchy (district -> village) is optional
// on every user's own profile — this resolves the selected IDs to names.
async function getUserLocation(row) {
  if (!row.district_id && !row.county_id && !row.sub_county_id && !row.parish_id && !row.village_id) {
    return { districtId: "", districtName: "", countyId: "", countyName: "", subCountyId: "", subCountyName: "", parishId: "", parishName: "", villageId: "", villageName: "" };
  }
  const [rows] = await getPool().query(
    `SELECT loc_d.name AS district_name, loc_c.name AS county_name, loc_sc.name AS sub_county_name,
            loc_p.name AS parish_name, loc_v.name AS village_name
     FROM (SELECT ? AS district_id, ? AS county_id, ? AS sub_county_id, ? AS parish_id, ? AS village_id) ids
     LEFT JOIN districts loc_d ON loc_d.id = ids.district_id
     LEFT JOIN counties loc_c ON loc_c.id = ids.county_id
     LEFT JOIN sub_counties loc_sc ON loc_sc.id = ids.sub_county_id
     LEFT JOIN parishes loc_p ON loc_p.id = ids.parish_id
     LEFT JOIN villages loc_v ON loc_v.id = ids.village_id`,
    [row.district_id, row.county_id, row.sub_county_id, row.parish_id, row.village_id]
  );
  const names = rows[0] ?? {};
  return {
    districtId: row.district_id ? String(row.district_id) : "",
    districtName: names.district_name ?? "",
    countyId: row.county_id ? String(row.county_id) : "",
    countyName: names.county_name ?? "",
    subCountyId: row.sub_county_id ? String(row.sub_county_id) : "",
    subCountyName: names.sub_county_name ?? "",
    parishId: row.parish_id ? String(row.parish_id) : "",
    parishName: names.parish_name ?? "",
    villageId: row.village_id ? String(row.village_id) : "",
    villageName: names.village_name ?? "",
  };
}

async function toApiUser(row) {
  const role = row.role_id ? await findRoleById(row.role_id) : null;
  const permissions = row.role_id ? (await getRolePermissions(row.role_id)).map((permission) => permission.name) : [];
  return {
    id: String(row.id),
    name: row.name,
    username: row.username ?? "",
    email: row.email,
    role: role?.name ?? "",
    permissions,
    status: row.status,
    location: await getUserLocation(row),
  };
}

function tokenPayload(user) {
  return { sub: user.id, name: user.name, role: user.role, permissions: user.permissions };
}

export async function loginWithPassword({ identifier, password }) {
  const row = identifier.includes("@") ? await findUserByEmail(identifier) : await findUserByUsername(identifier);
  if (!row) throw AppError.unauthorized("Incorrect username/email or password.");
  if (row.status !== "Active") throw AppError.forbidden("This account is inactive. Contact your administrator.");

  const passwordMatches = await bcrypt.compare(password, row.password_hash);
  if (!passwordMatches) throw AppError.unauthorized("Incorrect username/email or password.");

  await updateUser(row.id, { last_login_at: new Date() });

  const user = await toApiUser(row);
  const payload = tokenPayload(user);
  return {
    user,
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: user.id }),
  };
}

export async function refreshSession(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const row = await findUserById(payload.sub);
  if (!row || row.status !== "Active") throw AppError.unauthorized("Session is no longer valid.");
  const user = await toApiUser(row);
  return { user, accessToken: signAccessToken(tokenPayload(user)) };
}

export async function getCurrentUser(userId) {
  const row = await findUserById(userId);
  if (!row) throw AppError.notFound("User not found.");
  return toApiUser(row);
}

export async function updateOwnProfile(userId, values) {
  const existing = await findUserById(userId);
  if (!existing) throw AppError.notFound("User not found.");

  if (values.username && values.username !== existing.username) {
    const other = await findUserByUsername(values.username);
    if (other && other.id !== existing.id) throw AppError.badRequest("That username is already taken.");
  }
  if (values.email && values.email !== existing.email) {
    const other = await findUserByEmail(values.email);
    if (other && other.id !== existing.id) throw AppError.badRequest("That email is already in use.");
  }

  const data = {};
  if (values.name !== undefined) data.name = values.name;
  if (values.username !== undefined) data.username = values.username;
  if (values.email !== undefined) data.email = values.email;
  if (values.districtId !== undefined) data.district_id = values.districtId || null;
  if (values.countyId !== undefined) data.county_id = values.countyId || null;
  if (values.subCountyId !== undefined) data.sub_county_id = values.subCountyId || null;
  if (values.parishId !== undefined) data.parish_id = values.parishId || null;
  if (values.villageId !== undefined) data.village_id = values.villageId || null;

  const updated = await updateUser(userId, data);
  return toApiUser(updated);
}

export async function changeOwnPassword(userId, { currentPassword, newPassword }) {
  const existing = await findUserById(userId);
  if (!existing) throw AppError.notFound("User not found.");

  const currentMatches = await bcrypt.compare(currentPassword, existing.password_hash);
  if (!currentMatches) throw AppError.unauthorized("Current password is incorrect.");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await updateUser(userId, { password_hash: passwordHash });
}

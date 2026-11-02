import bcrypt from "bcryptjs";
import { AppError } from "../../utils/AppError.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { findUserByUsername, findUserByEmail, findUserById, updateUser } from "../users/user.model.js";
import { findRoleById, getRolePermissions } from "../users/role.model.js";

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

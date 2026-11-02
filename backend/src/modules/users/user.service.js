import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AppError } from "../../utils/AppError.js";
import {
  listUsers, findUserById, findUserByUsername, findUserByEmail, createUser, updateUser, deleteUser,
} from "./user.model.js";
import { findRoleById } from "./role.model.js";

function toApiUser(row, role) {
  return {
    id: String(row.id),
    name: row.name,
    username: row.username ?? "",
    email: row.email,
    roleId: row.role_id ? String(row.role_id) : "",
    role: role?.name ?? "",
    status: row.status,
    lastLoginAt: row.last_login_at ?? "",
  };
}

async function withRole(row) {
  const role = row.role_id ? await findRoleById(row.role_id) : null;
  return toApiUser(row, role);
}

function generatePassword() {
  return crypto.randomBytes(9).toString("base64url");
}

export async function listApiUsers() {
  const rows = await listUsers();
  return Promise.all(rows.map(withRole));
}

export async function getApiUserById(id) {
  const row = await findUserById(id);
  return row ? withRole(row) : null;
}

export async function createApiUser({ name, username, email, roleId, password }) {
  if (await findUserByUsername(username)) throw AppError.badRequest("That username is already taken.");
  if (await findUserByEmail(email)) throw AppError.badRequest("That email is already in use.");

  const temporaryPassword = password ? password : generatePassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const created = await createUser({
    name,
    username,
    email,
    password_hash: passwordHash,
    role_id: roleId || null,
    status: "Active",
  });

  return { user: await withRole(created), temporaryPassword };
}

export async function updateApiUser(id, { name, username, email, roleId, status }) {
  const existing = await findUserById(id);
  if (!existing) return null;

  if (username && username !== existing.username) {
    const other = await findUserByUsername(username);
    if (other && other.id !== existing.id) throw AppError.badRequest("That username is already taken.");
  }
  if (email && email !== existing.email) {
    const other = await findUserByEmail(email);
    if (other && other.id !== existing.id) throw AppError.badRequest("That email is already in use.");
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (username !== undefined) data.username = username;
  if (email !== undefined) data.email = email;
  if (roleId !== undefined) data.role_id = roleId || null;
  if (status !== undefined) data.status = status;

  const updated = await updateUser(id, data);
  return withRole(updated);
}

export async function resetApiUserPassword(id) {
  const existing = await findUserById(id);
  if (!existing) return null;
  const temporaryPassword = generatePassword();
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const updated = await updateUser(id, { password_hash: passwordHash });
  return { user: await withRole(updated), temporaryPassword };
}

export async function deleteApiUser(id) {
  return deleteUser(id);
}

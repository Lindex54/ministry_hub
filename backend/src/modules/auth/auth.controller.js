import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  loginWithPassword, refreshSession, getCurrentUser, updateOwnProfile, changeOwnPassword,
} from "./auth.service.js";

export const login = asyncHandler(async (request, response) => {
  const result = await loginWithPassword(request.body);
  response.locals.auditUser = result.user;
  response.json(result);
});

export const refresh = asyncHandler(async (request, response) => {
  const result = await refreshSession(request.body.refreshToken);
  response.json(result);
});

export const me = asyncHandler(async (request, response) => {
  response.json(await getCurrentUser(request.user.sub));
});

export const updateMe = asyncHandler(async (request, response) => {
  response.json(await updateOwnProfile(request.user.sub, request.body));
});

export const changePassword = asyncHandler(async (request, response) => {
  await changeOwnPassword(request.user.sub, request.body);
  response.status(204).end();
});

// Tokens aren't tracked server-side (no blacklist table yet), so logging out
// is purely a client-side token discard — this endpoint just acknowledges it.
export const logout = asyncHandler(async (_request, response) => {
  response.status(204).end();
});

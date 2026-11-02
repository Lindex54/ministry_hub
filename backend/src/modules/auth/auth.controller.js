import { asyncHandler } from "../../utils/asyncHandler.js";
import { loginWithPassword, refreshSession, getCurrentUser } from "./auth.service.js";

export const login = asyncHandler(async (request, response) => {
  const result = await loginWithPassword(request.body);
  response.json(result);
});

export const refresh = asyncHandler(async (request, response) => {
  const result = await refreshSession(request.body.refreshToken);
  response.json(result);
});

export const me = asyncHandler(async (request, response) => {
  response.json(await getCurrentUser(request.user.sub));
});

// Tokens aren't tracked server-side (no blacklist table yet), so logging out
// is purely a client-side token discard — this endpoint just acknowledges it.
export const logout = asyncHandler(async (_request, response) => {
  response.status(204).end();
});

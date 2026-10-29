import jwt from "jsonwebtoken";
import { environment, isAuthConfigured } from "../config/environment.js";
import { AppError } from "./AppError.js";

function requireAuthConfigured() {
  if (!isAuthConfigured()) {
    throw new AppError("Authentication is not configured. Set JWT_SECRET in the backend environment.", 500);
  }
}

export function signAccessToken(payload) {
  requireAuthConfigured();
  return jwt.sign(payload, environment.jwt.secret, { expiresIn: environment.jwt.expiresIn });
}

export function verifyAccessToken(token) {
  requireAuthConfigured();
  try {
    return jwt.verify(token, environment.jwt.secret);
  } catch {
    throw AppError.unauthorized("Invalid or expired access token.");
  }
}

export function signRefreshToken(payload) {
  requireAuthConfigured();
  const secret = environment.jwt.refreshSecret || environment.jwt.secret;
  return jwt.sign(payload, secret, { expiresIn: environment.jwt.refreshExpiresIn });
}

export function verifyRefreshToken(token) {
  requireAuthConfigured();
  const secret = environment.jwt.refreshSecret || environment.jwt.secret;
  try {
    return jwt.verify(token, secret);
  } catch {
    throw AppError.unauthorized("Invalid or expired refresh token.");
  }
}

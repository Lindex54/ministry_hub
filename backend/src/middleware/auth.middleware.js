import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Attaches a user when a valid access token is present, but leaves public
// routes accessible. This lets the audit logger identify signed-in users even
// on older module routes that do not yet enforce authentication themselves.
export function identifyUser(request, _response, next) {
  const header = request.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme === "Bearer" && token) {
    try { request.user = verifyAccessToken(token); } catch { /* protected routes validate below */ }
  }
  next();
}

// Verifies a Bearer access token and attaches its payload to req.user.
// Not yet mounted on any route — there is no users table or login endpoint
// for it to authenticate against until the auth module is implemented.
export function authenticate(request, _response, next) {
  if (request.user) return next();
  const header = request.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(AppError.unauthorized("Missing or malformed Authorization header."));
  }
  try {
    request.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

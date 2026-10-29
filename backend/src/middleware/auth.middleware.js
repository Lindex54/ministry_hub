import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

// Verifies a Bearer access token and attaches its payload to req.user.
// Not yet mounted on any route — there is no users table or login endpoint
// for it to authenticate against until the auth module is implemented.
export function authenticate(request, _response, next) {
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

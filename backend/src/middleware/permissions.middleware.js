import { AppError } from "../utils/AppError.js";

// authorize("members:write", "members:delete") requires authenticate() to have
// already run (so req.user is set) and that the user has every listed
// permission. Role -> permission mapping will be added with the users module.
export function authorize(...permissions) {
  return (request, _response, next) => {
    if (!request.user) return next(AppError.unauthorized());
    const granted = new Set(request.user.permissions ?? []);
    const missing = permissions.filter((permission) => !granted.has(permission));
    if (missing.length) {
      return next(AppError.forbidden(`Missing required permission(s): ${missing.join(", ")}.`));
    }
    next();
  };
}

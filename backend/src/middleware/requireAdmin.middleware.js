import { AppError } from "../utils/AppError.js";

// Only one role exists today (Administrator) with no granular permissions
// assigned, so this checks the role name directly rather than going through
// authorize()'s permission-set check.
export function requireAdmin(request, _response, next) {
  if (request.user?.role !== "Administrator") {
    return next(AppError.forbidden("Only administrators can manage user accounts."));
  }
  next();
}

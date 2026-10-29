import { environment } from "../config/environment.js";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

// Centralized error handler. Every route should forward errors via next(error)
// (asyncHandler does this automatically for async handlers) rather than
// responding directly, so error shape and logging stay consistent.
export function errorHandler(error, request, response, _next) {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : error.statusCode ?? 500;

  if (!isAppError || statusCode >= 500) {
    console.error(`[error] ${request.method} ${request.originalUrl} ->`, error);
  }

  const body = {
    message: isAppError || statusCode < 500 ? error.message : "Internal server error",
  };
  if (isAppError && error.details !== undefined) body.errors = error.details;
  if (!environment.isProduction && statusCode >= 500) body.stack = error.stack;

  response.status(statusCode).json(body);
}

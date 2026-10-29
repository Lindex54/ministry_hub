export class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    if (details !== undefined) this.details = details;
    Error.captureStackTrace?.(this, AppError);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = "Authentication is required.") {
    return new AppError(message, 401);
  }

  static forbidden(message = "You do not have permission to perform this action.") {
    return new AppError(message, 403);
  }

  static notFound(message = "The requested resource was not found.") {
    return new AppError(message, 404);
  }

  static conflict(message, details) {
    return new AppError(message, 409, details);
  }

  static unprocessable(message, details) {
    return new AppError(message, 422, details);
  }
}

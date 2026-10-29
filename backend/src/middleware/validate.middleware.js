import { AppError } from "../utils/AppError.js";

// validate({ body, params, query }) checks each provided zod schema against the
// matching part of the request, replacing it with the parsed (and therefore
// type-coerced/defaulted) value on success, or raising a 422 AppError on failure.
export function validate(schemas = {}) {
  return (request, _response, next) => {
    for (const key of ["params", "query", "body"]) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(request[key]);
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
        return next(AppError.unprocessable("Validation failed.", errors));
      }
      request[key] = result.data;
    }
    next();
  };
}

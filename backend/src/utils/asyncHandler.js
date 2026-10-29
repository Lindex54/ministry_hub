// Wraps an async Express route/middleware handler so rejected promises reach
// the centralized error handler instead of crashing the process.
export function asyncHandler(handler) {
  return function wrapped(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

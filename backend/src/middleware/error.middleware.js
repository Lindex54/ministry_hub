export function errorHandler(error, _request, response, _next) {
  response.status(error.status ?? 500).json({
    message: error.message ?? "Internal server error",
  });
}


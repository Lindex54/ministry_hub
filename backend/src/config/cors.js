import { environment } from "./environment.js";
import { AppError } from "../utils/AppError.js";

const allowedOrigins = new Set([environment.frontendUrl, ...environment.allowedOrigins]);

export const corsOptions = {
  origin(origin, callback) {
    // Same-origin requests (curl, server-to-server, no Origin header) are allowed.
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    callback(AppError.forbidden(`Origin "${origin}" is not allowed by CORS.`));
  },
  credentials: true,
};

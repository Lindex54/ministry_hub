import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { environment } from "../config/environment.js";

export const securityHeaders = helmet({
  // The API never serves cross-origin embedded resources itself (Next.js owns
  // the HTML/CSP needs for pages), so keep this focused on API hardening.
  crossOriginResourcePolicy: { policy: "same-site" },
});

export const apiRateLimiter = rateLimit({
  windowMs: environment.rateLimit.windowMs,
  max: environment.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

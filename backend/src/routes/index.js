import { Router } from "express";
import { isDatabaseConfigured } from "../config/environment.js";
import { testConnection } from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

// Separate from /health so uptime checks can stay fast; this one touches MySQL.
router.get(
  "/health/db",
  asyncHandler(async (_request, response) => {
    if (!isDatabaseConfigured()) {
      return response.status(503).json({ status: "not-configured", message: "MySQL is not configured. See backend/.env.example." });
    }
    const result = await testConnection();
    if (result.connected) {
      return response.json({ status: "ok", serverVersion: result.serverVersion });
    }
    response.status(503).json({ status: "unreachable", reason: result.reason });
  })
);

// Domain modules (members, visitors, attendance, evangelism, follow-ups,
// communications, ministries, branches, services, events, users, auth, ...)
// mount their routers here as each module is implemented, e.g.:
//   router.use("/members", membersRouter);

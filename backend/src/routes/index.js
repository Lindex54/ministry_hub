import { Router } from "express";
import { isDatabaseConfigured } from "../config/environment.js";
import { testConnection } from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { membersRouter } from "./members.routes.js";
import { branchesRouter } from "./branches.routes.js";
import { ministriesRouter } from "./ministries.routes.js";
import { visitorsRouter } from "./visitors.routes.js";
import { communicationsRouter } from "./communications.routes.js";
import { staffRouter } from "./staff.routes.js";
import { followUpTasksRouter } from "./follow-up-tasks.routes.js";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { rolesRouter } from "./roles.routes.js";
import { locationsRouter } from "./locations.routes.js";
import { auditLogsRouter } from "./audit-logs.routes.js";
import { auditRequest } from "../middleware/audit.middleware.js";
import { identifyUser } from "../middleware/auth.middleware.js";

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

router.use(identifyUser, auditRequest);

router.use("/dashboard", dashboardRouter);
router.use("/members", membersRouter);
router.use("/branches", branchesRouter);
router.use("/ministries", ministriesRouter);
router.use("/visitors", visitorsRouter);
router.use("/communications", communicationsRouter);
router.use("/staff", staffRouter);
router.use("/follow-up-tasks", followUpTasksRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/roles", rolesRouter);
router.use("/locations", locationsRouter);
router.use("/audit-logs", auditLogsRouter);

// Remaining domain modules (attendance, evangelism,
// services, events, ...) mount their routers
// here as each is implemented.

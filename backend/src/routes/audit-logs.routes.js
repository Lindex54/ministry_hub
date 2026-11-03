import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.middleware.js";
import { getAuditLogs, getUserSecurityCheck } from "../modules/audit-logs/audit-log.controller.js";

export const auditLogsRouter = Router();

auditLogsRouter.use(authenticate, requireAdmin);
auditLogsRouter.get("/", getAuditLogs);
auditLogsRouter.get("/users/:userId", getUserSecurityCheck);

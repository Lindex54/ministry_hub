import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { getAuditLogSummary, getUserSecurityProfile, listAuditLogs } from "./audit-log.model.js";

const ACTIONS = new Set(["Login", "Logout", "View", "Create", "Update", "Delete", "Action"]);
const OUTCOMES = new Set(["Success", "Failed"]);

export const getAuditLogs = asyncHandler(async (request, response) => {
  const action = ACTIONS.has(request.query.action) ? request.query.action : "";
  const outcome = OUTCOMES.has(request.query.outcome) ? request.query.outcome : "";
  const [logs, summary] = await Promise.all([
    listAuditLogs({ page: request.query.page, search: request.query.search ?? "", action, outcome }),
    getAuditLogSummary(),
  ]);
  response.json({ ...logs, summary });
});

export const getUserSecurityCheck = asyncHandler(async (request, response) => {
  if (!/^\d+$/.test(request.params.userId)) throw AppError.badRequest("Invalid user ID.");
  const profile = await getUserSecurityProfile(request.params.userId, {
    page: request.query.page,
    search: request.query.search ?? "",
    outcome: OUTCOMES.has(request.query.outcome) ? request.query.outcome : "",
    range: ["all", "today", "7d", "30d", "90d", "custom"].includes(request.query.range) ? request.query.range : "all",
    from: request.query.from ?? "",
    to: request.query.to ?? "",
  });
  if (!profile) throw AppError.notFound("User account not found.");
  response.json(profile);
});

import { asyncHandler } from "../../utils/asyncHandler.js";
import { getAuditLogSummary, listAuditLogs } from "./audit-log.model.js";

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

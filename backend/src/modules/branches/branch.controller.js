import { asyncHandler } from "../../utils/asyncHandler.js";
import { listBranches } from "./branch.model.js";

// Minimal read-only endpoint — just enough for other modules (like Members) to
// offer real branch options. Full branch CRUD routes come when the
// Branches/Ministries module itself is wired.
export const getBranches = asyncHandler(async (request, response) => {
  const branches = await listBranches(request.query);
  response.json(branches.map((row) => ({
    id: String(row.id),
    name: row.name,
    status: row.status,
  })));
});

import { asyncHandler } from "../../utils/asyncHandler.js";
import { listMinistries } from "./ministry.model.js";

// Minimal read-only endpoint — just enough for other modules (like Members) to
// offer real ministry options. Full ministry CRUD routes come when the
// Ministries module itself is wired.
export const getMinistries = asyncHandler(async (request, response) => {
  const ministries = await listMinistries(request.query);
  response.json(ministries.map((row) => ({
    id: String(row.id),
    name: row.name,
    status: row.status,
  })));
});

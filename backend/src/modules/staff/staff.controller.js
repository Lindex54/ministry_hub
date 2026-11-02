import { asyncHandler } from "../../utils/asyncHandler.js";
import { listStaff } from "./staff.model.js";

// Minimal read-only endpoint — just enough for Follow-ups to offer real
// worker options. Full staff CRUD routes come when a Staff/Users module
// itself is wired.
export const getStaff = asyncHandler(async (request, response) => {
  const staff = await listStaff(request.query);
  response.json(staff.map((row) => ({
    id: String(row.id),
    name: row.name,
    role: row.role ?? "",
    status: row.status,
  })));
});

import { asyncHandler } from "../../utils/asyncHandler.js";
import { listRoles } from "./role.model.js";

// Minimal read-only endpoint so the Add User form has real role options.
// Full role/permission management comes with a later Roles admin UI.
export const listRolesRoute = asyncHandler(async (_request, response) => {
  const roles = await listRoles();
  response.json(roles.map((row) => ({ id: String(row.id), name: row.name, description: row.description ?? "" })));
});

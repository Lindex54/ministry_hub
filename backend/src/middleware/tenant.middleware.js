// Resolves which church/branch a request is scoped to, for modules that need
// branch-level data isolation (Members, Visitors, Attendance, etc.). For now
// this just reads the authenticated user's assigned branch, falling back to an
// explicit X-Branch-Id header for staff with multi-branch access. Nothing
// enforces it yet — that lands with the modules that need it.
export function resolveTenant(request, _response, next) {
  const headerBranchId = request.headers["x-branch-id"];
  request.tenant = {
    churchId: request.user?.churchId ?? null,
    branchId: headerBranchId ?? request.user?.branchId ?? null,
  };
  next();
}

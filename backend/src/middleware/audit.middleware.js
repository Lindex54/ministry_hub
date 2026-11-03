import { createAuditLog } from "../modules/audit-logs/audit-log.model.js";

function describeRequest(method, path) {
  const segments = path.split("/").filter(Boolean);
  const resource = segments[0] ?? "system";
  const possibleId = segments[1];
  const resourceId = possibleId && /^\d+$/.test(possibleId) ? possibleId : null;
  let action = "Action";
  if (resource === "auth" && segments[1] === "login") action = "Login";
  else if (resource === "auth" && segments[1] === "logout") action = "Logout";
  else if (method === "GET") action = "View";
  else if (method === "POST") action = "Create";
  else if (["PATCH", "PUT"].includes(method)) action = "Update";
  else if (method === "DELETE") action = "Delete";
  return { action, resource, resourceId };
}

export function auditRequest(request, response, next) {
  const fullPath = request.originalUrl.split("?")[0];
  const apiPath = fullPath.replace(/^\/api(?=\/|$)/, "") || "/";
  if (apiPath.startsWith("/audit-logs") || apiPath.startsWith("/health")) return next();
  const descriptor = describeRequest(request.method, apiPath);

  response.on("finish", () => {
    const auditUser = response.locals.auditUser ?? request.user;
    const isLogin = apiPath === "/auth/login";
    if (!auditUser && !isLogin) return;
    const identifier = isLogin ? request.body?.identifier : null;
    createAuditLog({
      user_id: auditUser?.id ?? auditUser?.sub ?? null,
      actor_name: auditUser?.name ?? identifier ?? "Unknown user",
      actor_username: auditUser?.username ?? (identifier && !identifier.includes("@") ? identifier : null),
      actor_role: auditUser?.role ?? null,
      action: descriptor.action,
      method: request.method,
      resource: descriptor.resource,
      resource_id: descriptor.resourceId,
      path: fullPath,
      status_code: response.statusCode,
      outcome: response.statusCode < 400 ? "Success" : "Failed",
      ip_address: request.ip ?? request.socket?.remoteAddress ?? null,
      user_agent: request.get("user-agent")?.slice(0, 500) ?? null,
    }).catch((error) => console.error("[audit] Could not record activity:", error.message));
  });
  next();
}

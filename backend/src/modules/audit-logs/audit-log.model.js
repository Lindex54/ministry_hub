import { getPool } from "../../config/database.js";

const PAGE_SIZE = 10;

export async function createAuditLog(data) {
  const columns = [
    "user_id", "actor_name", "actor_username", "actor_role", "action", "method",
    "resource", "resource_id", "path", "status_code", "outcome", "ip_address", "user_agent",
  ];
  const values = columns.map((column) => data[column] ?? null);
  const [result] = await getPool().query(
    `INSERT INTO audit_logs (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    values
  );
  return result.insertId;
}

function filtersFor({ search, action, outcome }) {
  const clauses = [];
  const params = [];
  if (search) {
    const term = `%${search}%`;
    clauses.push("(al.actor_name LIKE ? OR al.actor_username LIKE ? OR al.resource LIKE ? OR al.path LIKE ? OR al.ip_address LIKE ?)");
    params.push(term, term, term, term, term);
  }
  if (action) { clauses.push("al.action = ?"); params.push(action); }
  if (outcome) { clauses.push("al.outcome = ?"); params.push(outcome); }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function listAuditLogs({ page = 1, search = "", action = "", outcome = "" } = {}) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const { where, params } = filtersFor({ search: search.trim().slice(0, 100), action, outcome });
  const pool = getPool();
  const [[{ total = 0 }]] = await pool.query(`SELECT COUNT(DISTINCT al.id) AS total FROM audit_logs al ${where}`, params);
  const totalCount = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const [rows] = await pool.query(
    `SELECT al.id, al.user_id, COALESCE(al.user_id, matched_user.id) AS resolved_user_id,
      al.actor_name, al.actor_username, al.actor_role, al.action, al.method,
      al.resource, al.resource_id, al.path, al.status_code, al.outcome,
      al.ip_address, al.user_agent, al.created_at
     FROM audit_logs al
     LEFT JOIN users matched_user ON al.user_id IS NULL AND (
       (al.actor_username IS NOT NULL AND matched_user.username = al.actor_username)
       OR matched_user.username = al.actor_name
       OR matched_user.email = al.actor_name
     )
     ${where}
     ORDER BY al.created_at DESC, al.id DESC
     LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset]
  );
  return {
    data: rows,
    pagination: { page: currentPage, pageSize: PAGE_SIZE, total: totalCount, totalPages },
  };
}

function loginMatchSql() {
  return `(al.user_id = ? OR (al.user_id IS NULL AND (
    al.actor_username = ? OR al.actor_name = ? OR al.actor_name = ?
  )))`;
}

function loginHistoryFilters({ search = "", outcome = "", range = "all", from = "", to = "" } = {}) {
  const clauses = [];
  const params = [];
  const cleanSearch = search.trim().slice(0, 100);
  if (cleanSearch) {
    const term = `%${cleanSearch}%`;
    clauses.push("(al.ip_address LIKE ? OR al.user_agent LIKE ?)");
    params.push(term, term);
  }
  if (["Success", "Failed"].includes(outcome)) {
    clauses.push("al.outcome = ?");
    params.push(outcome);
  }
  if (range === "today") clauses.push("DATE(al.created_at) = CURDATE()");
  else if (range === "7d") clauses.push("al.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
  else if (range === "30d") clauses.push("al.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
  else if (range === "90d") clauses.push("al.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)");
  else if (range === "custom") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { clauses.push("al.created_at >= ?"); params.push(`${from} 00:00:00`); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { clauses.push("al.created_at < DATE_ADD(?, INTERVAL 1 DAY)"); params.push(`${to} 00:00:00`); }
  }
  return { clauses, params };
}

export async function getUserSecurityProfile(userId, { page = 1, search = "", outcome = "", range = "all", from = "", to = "" } = {}) {
  const pool = getPool();
  const [[user]] = await pool.query(
    `SELECT u.id, u.name, u.username, u.email, u.status, u.last_login_at, u.created_at,
      r.name AS role_name, s.name AS staff_name, s.phone AS staff_phone, b.name AS branch_name
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     LEFT JOIN staff s ON s.id = u.staff_id
     LEFT JOIN branches b ON b.id = s.branch_id
     WHERE u.id = ?`,
    [userId]
  );
  if (!user) return null;

  const matchParams = [user.id, user.username, user.username, user.email];
  const match = loginMatchSql();
  const [[stats]] = await pool.query(
    `SELECT
      COUNT(*) AS total_attempts,
      SUM(al.outcome = 'Success') AS successful,
      SUM(al.outcome = 'Failed') AS failed,
      COUNT(DISTINCT al.ip_address) AS distinct_ips,
      MAX(CASE WHEN al.outcome = 'Success' THEN al.created_at END) AS last_successful_login,
      MAX(CASE WHEN al.outcome = 'Failed' THEN al.created_at END) AS last_failed_attempt
     FROM audit_logs al
     WHERE al.action = 'Login' AND ${match}`,
    matchParams
  );

  const totalAttempts = Number(stats.total_attempts ?? 0);
  const historyFilters = loginHistoryFilters({ search, outcome, range, from, to });
  const historyWhere = historyFilters.clauses.length ? ` AND ${historyFilters.clauses.join(" AND ")}` : "";
  const [[{ filtered_total = 0 }]] = await pool.query(
    `SELECT COUNT(*) AS filtered_total
     FROM audit_logs al
     WHERE al.action = 'Login' AND ${match}${historyWhere}`,
    [...matchParams, ...historyFilters.params]
  );
  const historyTotal = Number(filtered_total);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(historyTotal / pageSize));
  const currentPage = Math.min(Math.max(1, Number.parseInt(page, 10) || 1), totalPages);
  const [history] = await pool.query(
    `SELECT al.id, al.outcome, al.status_code, al.ip_address, al.user_agent, al.created_at
     FROM audit_logs al
     WHERE al.action = 'Login' AND ${match}${historyWhere}
     ORDER BY al.created_at DESC, al.id DESC
     LIMIT ? OFFSET ?`,
    [...matchParams, ...historyFilters.params, pageSize, (currentPage - 1) * pageSize]
  );

  return {
    user: {
      id: String(user.id),
      name: user.name,
      username: user.username ?? "",
      email: user.email,
      role: user.role_name ?? "",
      status: user.status,
      staffName: user.staff_name ?? "",
      phone: user.staff_phone ?? "",
      branch: user.branch_name ?? "",
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    },
    stats: {
      totalAttempts,
      successful: Number(stats.successful ?? 0),
      failed: Number(stats.failed ?? 0),
      distinctIps: Number(stats.distinct_ips ?? 0),
      lastSuccessfulLogin: stats.last_successful_login,
      lastFailedAttempt: stats.last_failed_attempt,
    },
    loginHistory: {
      data: history,
      pagination: { page: currentPage, pageSize, total: historyTotal, totalPages },
    },
  };
}

export async function getAuditLogSummary() {
  const [[row]] = await getPool().query(
    `SELECT
      COUNT(*) AS total,
      SUM(DATE(created_at) = CURDATE()) AS today,
      SUM(outcome = 'Failed') AS failed,
      COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) AS active_users
     FROM audit_logs`
  );
  return {
    total: Number(row.total ?? 0),
    today: Number(row.today ?? 0),
    failed: Number(row.failed ?? 0),
    activeUsers: Number(row.active_users ?? 0),
  };
}

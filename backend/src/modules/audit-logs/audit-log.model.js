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
    clauses.push("(actor_name LIKE ? OR actor_username LIKE ? OR resource LIKE ? OR path LIKE ? OR ip_address LIKE ?)");
    params.push(term, term, term, term, term);
  }
  if (action) { clauses.push("action = ?"); params.push(action); }
  if (outcome) { clauses.push("outcome = ?"); params.push(outcome); }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export async function listAuditLogs({ page = 1, search = "", action = "", outcome = "" } = {}) {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const { where, params } = filtersFor({ search: search.trim().slice(0, 100), action, outcome });
  const pool = getPool();
  const [[{ total = 0 }]] = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, params);
  const totalCount = Number(total);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const [rows] = await pool.query(
    `SELECT id, user_id, actor_name, actor_username, actor_role, action, method,
      resource, resource_id, path, status_code, outcome, ip_address, user_agent, created_at
     FROM audit_logs ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT ? OFFSET ?`,
    [...params, PAGE_SIZE, offset]
  );
  return {
    data: rows,
    pagination: { page: currentPage, pageSize: PAGE_SIZE, total: totalCount, totalPages },
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

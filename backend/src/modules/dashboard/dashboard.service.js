import { getPool } from "../../config/database.js";
import { listUpcomingEvents } from "../events/event.model.js";

const DAY_MS = 86400000;

function toDateOnly(value) {
  // Accepts a "YYYY-MM-DD" string or a Date; returns a UTC-midnight Date.
  if (value instanceof Date) return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatISO(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function diffDays(from, to) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function weekdayLabel(date) {
  return date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

function monthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

function formatMonthDay(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" });
}

function formatFullDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
}

function getRangeKey(from, to) {
  const days = diffDays(from, to) + 1;
  if (days <= 14) return "short";
  if (days <= 60) return "medium";
  return "long";
}

export function resolveRange(fromParam, toParam) {
  const to = toParam ? toDateOnly(toParam) : toDateOnly(new Date());
  const from = fromParam ? toDateOnly(fromParam) : addDays(to, -29);
  return { from, to, key: getRangeKey(from, to) };
}

// Splits [start, end] into buckets matching the chart granularity used for that range length.
function buildBuckets(start, end, rangeKey) {
  const buckets = [];
  if (rangeKey === "short") {
    for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
      buckets.push({ start: cursor, end: cursor, label: weekdayLabel(cursor) });
    }
    return buckets;
  }
  if (rangeKey === "medium") {
    let index = 1;
    for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 7)) {
      const bucketEnd = addDays(cursor, 6).getTime() > end.getTime() ? end : addDays(cursor, 6);
      buckets.push({ start: cursor, end: bucketEnd, label: `Week ${index}` });
      index += 1;
    }
    return buckets;
  }
  // long: one bucket per calendar month touched by the range.
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cursor.getTime() <= end.getTime()) {
    const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const bucketStart = cursor.getTime() < start.getTime() ? start : cursor;
    const bucketEnd = monthEnd.getTime() > end.getTime() ? end : monthEnd;
    buckets.push({ start: bucketStart, end: bucketEnd, label: monthLabel(cursor) });
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return buckets;
}

function sumByBuckets(buckets, countsByDate) {
  return buckets.map(({ start, end }) => {
    let total = 0;
    for (const [dateKey, count] of countsByDate) {
      const date = toDateOnly(dateKey);
      if (date.getTime() >= start.getTime() && date.getTime() <= end.getTime()) total += count;
    }
    return total;
  });
}

function alignLength(values, length) {
  if (values.length === length) return values;
  if (values.length > length) return values.slice(0, length);
  return [...values, ...Array(length - values.length).fill(0)];
}

async function getPresentCountsByDate(from, to) {
  const [rows] = await getPool().query(
    `SELECT ao.occurrence_date AS d, COUNT(*) AS c
     FROM attendance_records ar
     INNER JOIN attendance_occurrences ao ON ao.id = ar.occurrence_id
     WHERE ar.status = 'Present' AND ao.occurrence_date BETWEEN ? AND ?
     GROUP BY ao.occurrence_date`,
    [formatISO(from), formatISO(to)]
  );
  return new Map(rows.map((row) => [row.d, Number(row.c)]));
}

async function getMemberCountsByDate(from, to) {
  const [rows] = await getPool().query(
    `SELECT date_joined AS d, COUNT(*) AS c FROM members
     WHERE date_joined BETWEEN ? AND ? GROUP BY date_joined`,
    [formatISO(from), formatISO(to)]
  );
  return new Map(rows.map((row) => [row.d, Number(row.c)]));
}

async function getAttendanceTrend(from, to, rangeKey) {
  const totalDays = diffDays(from, to) + 1;
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(totalDays - 1));

  const [currentCounts, previousCounts] = await Promise.all([
    getPresentCountsByDate(from, to),
    getPresentCountsByDate(previousFrom, previousTo),
  ]);

  const currentBuckets = buildBuckets(from, to, rangeKey);
  const previousBuckets = buildBuckets(previousFrom, previousTo, rangeKey);

  const current = sumByBuckets(currentBuckets, currentCounts);
  const previous = alignLength(sumByBuckets(previousBuckets, previousCounts), current.length);
  const labels = currentBuckets.map((bucket) => bucket.label);

  return { labels, current, previous };
}

async function getMembershipTrend(from, to, rangeKey) {
  const counts = await getMemberCountsByDate(from, to);
  const buckets = buildBuckets(from, to, rangeKey);
  return { labels: buckets.map((bucket) => bucket.label), values: sumByBuckets(buckets, counts) };
}

function percentChange(current, previous) {
  if (!previous) return current > 0 ? "+100%" : "0%";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

async function getStats(from, to) {
  const pool = getPool();
  const totalDays = diffDays(from, to) + 1;
  const previousTo = addDays(from, -1);
  const previousFrom = addDays(previousTo, -(totalDays - 1));

  const [[{ totalMembers }]] = await pool.query(
    "SELECT COUNT(*) AS totalMembers FROM members WHERE status = 'Active'"
  );
  const [[{ joinedThisPeriod }]] = await pool.query(
    "SELECT COUNT(*) AS joinedThisPeriod FROM members WHERE date_joined BETWEEN ? AND ?",
    [formatISO(from), formatISO(to)]
  );

  const [occurrences] = await pool.query(
    `SELECT ao.id, ao.occurrence_date, s.name AS service_name,
       (SELECT COUNT(*) FROM attendance_records ar WHERE ar.occurrence_id = ao.id AND ar.status = 'Present') AS present_count
     FROM attendance_occurrences ao
     INNER JOIN services s ON s.id = ao.service_id
     ORDER BY ao.occurrence_date DESC, ao.id DESC
     LIMIT 2`
  );
  const latest = occurrences[0] ?? null;
  const previousOccurrence = occurrences[1] ?? null;

  const [[{ visitorsThisPeriod }]] = await pool.query(
    "SELECT COUNT(*) AS visitorsThisPeriod FROM visitors WHERE DATE(created_at) BETWEEN ? AND ?",
    [formatISO(from), formatISO(to)]
  );
  const [[{ visitorsPreviousPeriod }]] = await pool.query(
    "SELECT COUNT(*) AS visitorsPreviousPeriod FROM visitors WHERE DATE(created_at) BETWEEN ? AND ?",
    [formatISO(previousFrom), formatISO(previousTo)]
  );

  const [[{ pendingFollowUps }]] = await pool.query(
    "SELECT COUNT(*) AS pendingFollowUps FROM follow_up_tasks WHERE status IN ('Pending', 'In Progress')"
  );
  const [[{ overdueFollowUps }]] = await pool.query(
    "SELECT COUNT(*) AS overdueFollowUps FROM follow_up_tasks WHERE status IN ('Pending', 'In Progress') AND scheduled_date < CURDATE()"
  );

  return {
    members: { value: totalMembers.toLocaleString("en-US"), change: `+${joinedThisPeriod} this period` },
    attendance: {
      value: latest ? String(latest.present_count) : "0",
      change: latest && previousOccurrence
        ? `${percentChange(latest.present_count, previousOccurrence.present_count)} vs previous service`
        : "No previous service recorded",
      detail: latest ? `${latest.service_name} · ${formatMonthDay(toDateOnly(latest.occurrence_date))}` : "No services recorded yet",
    },
    visitors: {
      value: String(visitorsThisPeriod),
      change: `${percentChange(visitorsThisPeriod, visitorsPreviousPeriod)} vs previous period`,
    },
    followUps: {
      value: String(pendingFollowUps),
      change: `${overdueFollowUps} overdue`,
    },
  };
}

async function getRecentAttendance(limit = 5) {
  const [rows] = await getPool().query(
    `SELECT ao.id, ao.occurrence_date, s.name AS service_name,
       (SELECT COUNT(*) FROM attendance_records ar WHERE ar.occurrence_id = ao.id AND ar.status = 'Present') AS present_count
     FROM attendance_occurrences ao
     INNER JOIN services s ON s.id = ao.service_id
     ORDER BY ao.occurrence_date DESC, ao.id DESC
     LIMIT ?`,
    [limit]
  );
  const today = toDateOnly(new Date());
  return rows.map((row) => ({
    id: `occurrence-${row.id}`,
    service: row.service_name,
    date: formatFullDate(toDateOnly(row.occurrence_date)),
    attendance: Number(row.present_count),
    status: toDateOnly(row.occurrence_date).getTime() <= today.getTime() ? "Completed" : "Scheduled",
  }));
}

async function resolvePersonNames(personRefs) {
  const byType = { member: [], visitor: [], evangelism_contact: [] };
  for (const { personType, personId } of personRefs) {
    if (byType[personType]) byType[personType].push(personId);
  }
  const names = new Map();
  const pool = getPool();

  if (byType.member.length) {
    const [rows] = await pool.query(
      `SELECT id, CONCAT(COALESCE(NULLIF(preferred_name, ''), first_name), ' ', last_name) AS name
       FROM members WHERE id IN (?)`,
      [byType.member]
    );
    for (const row of rows) names.set(`member:${row.id}`, row.name);
  }
  if (byType.visitor.length) {
    const [rows] = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', last_name) AS name FROM visitors WHERE id IN (?)",
      [byType.visitor]
    );
    for (const row of rows) names.set(`visitor:${row.id}`, row.name);
  }
  if (byType.evangelism_contact.length) {
    const [rows] = await pool.query(
      "SELECT id, CONCAT(first_name, ' ', COALESCE(last_name, '')) AS name FROM evangelism_contacts WHERE id IN (?)",
      [byType.evangelism_contact]
    );
    for (const row of rows) names.set(`evangelism_contact:${row.id}`, row.name.trim());
  }
  return names;
}

async function getFollowUpHighlights(limit = 4) {
  const [rows] = await getPool().query(
    `SELECT ft.id, ft.person_type, ft.person_id, ft.scheduled_date, ft.reason, ft.status, s.name AS assignee_name
     FROM follow_up_tasks ft
     LEFT JOIN staff s ON s.id = ft.assigned_to_staff_id
     WHERE ft.status IN ('Pending', 'In Progress', 'Unable to Reach')
     ORDER BY ft.scheduled_date ASC
     LIMIT ?`,
    [limit]
  );
  if (!rows.length) return [];

  const names = await resolvePersonNames(rows.map((row) => ({ personType: row.person_type, personId: row.person_id })));
  const today = toDateOnly(new Date());

  return rows.map((row) => {
    const dueDate = row.scheduled_date ? toDateOnly(row.scheduled_date) : null;
    let status = row.status;
    if (dueDate && dueDate.getTime() < today.getTime() && row.status !== "Completed") status = "Overdue";
    else if (dueDate && dueDate.getTime() === today.getTime()) status = "Due today";
    return {
      id: `task-${row.id}`,
      name: names.get(`${row.person_type}:${row.person_id}`) ?? "Unknown person",
      type: row.reason ?? "Follow-up",
      assignee: row.assignee_name ?? "Unassigned",
      due: dueDate ? formatMonthDay(dueDate) : "No date set",
      status,
    };
  });
}

async function getUpcomingEventsList(limit = 3) {
  const rows = await listUpcomingEvents(limit);
  return rows.map((row) => ({
    id: `event-${row.id}`,
    name: row.name,
    date: formatMonthDay(toDateOnly(row.event_date)),
    time: row.event_time ?? "Time TBC",
    location: row.location ?? "Location TBC",
  }));
}

export async function getDashboardData({ from: fromParam, to: toParam } = {}) {
  const { from, to, key } = resolveRange(fromParam, toParam);

  const [stats, attendance, membership, recentAttendance, followUps, upcomingEvents] = await Promise.all([
    getStats(from, to),
    getAttendanceTrend(from, to, key),
    getMembershipTrend(from, to, key),
    getRecentAttendance(5),
    getFollowUpHighlights(4),
    getUpcomingEventsList(3),
  ]);

  return { period: key, stats, attendance, membership, recentAttendance, followUps, upcomingEvents };
}

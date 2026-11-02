import { AppError } from "../../utils/AppError.js";
import { findMemberById } from "../members/member.model.js";
import { findVisitorById } from "../visitors/visitor.model.js";
import { findStaffById } from "../staff/staff.model.js";
import {
  listFollowUpTasks, findFollowUpTaskById, createFollowUpTask, updateFollowUpTask,
  getTaskHistory, addTaskHistoryEntry,
} from "./follow-up-task.model.js";

const PREFIX_TO_PERSON_TYPE = { member: "member", visitor: "visitor", evangelism: "evangelism_contact" };
const PERSON_TYPE_TO_PREFIX = { member: "member", visitor: "visitor", evangelism_contact: "evangelism" };

function parsePersonKey(personKey) {
  const [prefix, id] = String(personKey).split(":");
  const personType = PREFIX_TO_PERSON_TYPE[prefix];
  if (!personType || !id) throw AppError.badRequest(`Invalid person reference "${personKey}".`);
  return { personType, personId: id };
}

async function assertPersonExists(personType, personId) {
  if (personType === "member") {
    if (!(await findMemberById(personId))) throw AppError.badRequest("That member was not found.");
    return;
  }
  if (personType === "visitor") {
    if (!(await findVisitorById(personId))) throw AppError.badRequest("That visitor was not found.");
    return;
  }
  // Evangelism isn't wired to the database yet — contacts only exist as mock
  // data in the frontend, so there is nothing real to attach a task to.
  throw AppError.badRequest(
    "Evangelism contacts aren't stored in the database yet, so follow-up tasks can't be assigned to them."
  );
}

function toApiHistoryEntry(row) {
  return {
    id: String(row.id),
    date: row.occurred_at,
    workerId: row.worker_id != null ? String(row.worker_id) : "",
    status: row.status,
    reached: row.reached ?? "Not recorded",
    outcome: row.outcome ?? "",
    notes: row.notes ?? "",
    anotherFollowUp: Boolean(row.another_follow_up),
    nextDate: row.next_date ?? "",
  };
}

async function toApiTask(row) {
  const history = await getTaskHistory(row.id);
  return {
    id: String(row.id),
    personKey: `${PERSON_TYPE_TO_PREFIX[row.person_type] ?? row.person_type}:${row.person_id}`,
    workerId: row.assigned_to_staff_id != null ? String(row.assigned_to_staff_id) : "",
    method: row.method ?? "",
    scheduledDate: row.scheduled_date ?? "",
    priority: row.priority ?? "Normal",
    reason: row.reason ?? "",
    status: row.status,
    history: history.map(toApiHistoryEntry),
  };
}

export async function listApiFollowUpTasks({ workerId, status, method } = {}) {
  const rows = await listFollowUpTasks({ assignedToStaffId: workerId, status });
  const tasks = await Promise.all(rows.map(toApiTask));
  return method ? tasks.filter((task) => task.method === method) : tasks;
}

export async function getApiFollowUpTaskById(id) {
  const row = await findFollowUpTaskById(id);
  return row ? toApiTask(row) : null;
}

async function resolveStaffId(workerId) {
  const staff = await findStaffById(workerId);
  if (!staff) throw AppError.badRequest("That worker was not found.");
  return staff.id;
}

export async function createApiFollowUpTask(values) {
  const { personType, personId } = parsePersonKey(values.personKey);
  await assertPersonExists(personType, personId);
  const staffId = await resolveStaffId(values.workerId);

  const created = await createFollowUpTask({
    person_type: personType,
    person_id: personId,
    assigned_to_staff_id: staffId,
    method: values.method,
    scheduled_date: values.scheduledDate,
    priority: values.priority || "Normal",
    reason: values.reason,
    status: "Pending",
  });

  await addTaskHistoryEntry(created.id, {
    workerId: staffId,
    status: "Pending",
    reached: "Not recorded",
    outcome: "Assignment created",
    notes: "",
    anotherFollowUp: false,
  });

  return toApiTask(created);
}

export async function addApiFollowUpFeedback(id, feedback) {
  const task = await findFollowUpTaskById(id);
  if (!task) return null;

  await addTaskHistoryEntry(id, {
    workerId: task.assigned_to_staff_id,
    status: feedback.status,
    reached: feedback.reached,
    outcome: feedback.outcome,
    notes: feedback.notes ?? "",
    anotherFollowUp: Boolean(feedback.anotherFollowUp),
    nextDate: feedback.anotherFollowUp ? feedback.nextDate || null : null,
  });

  await updateFollowUpTask(id, { status: feedback.status });
  return toApiTask(await findFollowUpTaskById(id));
}

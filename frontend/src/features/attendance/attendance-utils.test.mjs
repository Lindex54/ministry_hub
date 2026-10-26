import test from "node:test";
import assert from "node:assert/strict";
import { attendanceTotals, occurrenceKey, recordAttendance, setExpectedPerson } from "./attendance-utils.mjs";

const member = { key: "member:1", category: "Member" };
const visitor = { key: "visitor:1", category: "Visitor" };
const occurrence = (changes = {}) => ({ id: "one", expected: [member.key], records: {}, ...changes });

test("each branch, service, and date produces a distinct occurrence", () => {
  const keys = [occurrenceKey("A", "Sunday", "2026-10-25"), occurrenceKey("B", "Sunday", "2026-10-25"), occurrenceKey("A", "Prayer", "2026-10-25"), occurrenceKey("A", "Sunday", "2026-10-18")];
  assert.equal(new Set(keys).size, 4);
});

test("repeated and bulk present marking never duplicates attendance", () => {
  const first = recordAttendance(occurrence(), [member, visitor, member], "Present");
  const second = recordAttendance(first, [member], "Present");
  assert.equal(Object.keys(second.records).length, 2);
  assert.deepEqual(attendanceTotals(second), { members: 1, visitors: 1, absent: 0, total: 2 });
});

test("one service update cannot mutate another register", () => {
  const first = occurrence(); const second = occurrence({ id: "two" });
  const updated = recordAttendance(first, [member], "Present");
  assert.equal(attendanceTotals(updated).total, 1);
  assert.equal(attendanceTotals(first).total, 0);
  assert.equal(attendanceTotals(second).total, 0);
});

test("only expected members can be absent, never visitors or unlisted members", () => {
  const otherMember = { key: "member:2", category: "Member" };
  const updated = recordAttendance(occurrence(), [member, visitor, otherMember], "Absent");
  assert.deepEqual(Object.keys(updated.records), [member.key]);
  assert.equal(attendanceTotals(updated).absent, 1);
});

test("expected but unrecorded people do not count as absent", () => {
  assert.equal(attendanceTotals(occurrence()).absent, 0);
  const present = recordAttendance(occurrence(), [member], "Present");
  const cleared = recordAttendance(present, [member], "Not Recorded");
  assert.deepEqual(attendanceTotals(cleared), { members: 0, visitors: 0, absent: 0, total: 0 });
});

test("removing an expectation clears an absent status", () => {
  const absent = recordAttendance(occurrence(), [member], "Absent");
  const updated = setExpectedPerson(absent, member.key, false);
  assert.equal(updated.records[member.key].status, "Not Recorded");
  assert.equal(attendanceTotals(updated).absent, 0);
});

test("visitor conversion preserves their category at the historical occurrence", () => {
  const historical = recordAttendance(occurrence({ expected: [visitor.key] }), [visitor], "Present");
  const converted = { ...visitor, category: "Member" };
  const updated = recordAttendance(historical, [converted], "Present");
  assert.equal(attendanceTotals(updated).visitors, 1);
  assert.equal(attendanceTotals(updated).members, 0);
  assert.equal(recordAttendance(updated, [converted], "Absent").records[visitor.key].status, "Present");
});

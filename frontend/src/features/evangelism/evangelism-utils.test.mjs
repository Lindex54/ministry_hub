import test from "node:test";
import assert from "node:assert/strict";
import { countIndividuallyLinked, countPositiveResponses, countSoulsAccepted, findRecordByPhone, peopleEvangelized } from "./evangelism-utils.mjs";

const record = (id, changes = {}) => ({ id, firstName: id, lastName: "", phone: "0772 123 456", history: [{ id: `${id}-a`, date: "2026-10-01", activityId: null, response: "Interested" }], ...changes });

test("peopleEvangelized sums individual records and activity headcounts without double counting", () => {
  const total = peopleEvangelized([record("a"), record("b")], [{ id: "act-1", headcount: 40 }, { id: "act-2", headcount: 10 }]);
  assert.equal(total, 52);
});

test("countSoulsAccepted only counts records with an Accepted Christ response", () => {
  const records = [
    record("a", { history: [{ id: "a-a", date: "2026-10-01", response: "Accepted Christ" }] }),
    record("b", { history: [{ id: "b-a", date: "2026-10-01", response: "Interested" }] }),
  ];
  assert.equal(countSoulsAccepted(records), 1);
});

test("countPositiveResponses uses each record's latest encounter, not every encounter", () => {
  const records = [record("a", { history: [
    { id: "a-a", date: "2026-09-01", response: "Accepted Christ" },
    { id: "a-b", date: "2026-10-01", response: "Declined" },
  ] })];
  assert.equal(countPositiveResponses(records), 0);
});

test("findRecordByPhone matches local and international formats and ignores blank phones", () => {
  const records = [record("a", { phone: "0772 123 456" }), record("b", { phone: "" })];
  assert.equal(findRecordByPhone(records, "+256772123456")?.id, "a");
  assert.equal(findRecordByPhone(records, ""), null);
});

test("countIndividuallyLinked counts unique people, not unique encounters", () => {
  const records = [record("a", { history: [
    { id: "a-a", date: "2026-09-01", activityId: "act-1", response: "Interested" },
    { id: "a-b", date: "2026-10-01", activityId: "act-1", response: "Accepted Christ" },
  ] })];
  assert.equal(countIndividuallyLinked(records, "act-1"), 1);
});

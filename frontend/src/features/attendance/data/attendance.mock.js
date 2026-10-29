import { mockVisitors, serviceOptions } from "@/features/visitors/data/visitors.mock";
import { occurrenceKey } from "../attendance-utils.mjs";

// Seed branches for generating historical mock registers. The live branch directory
// is managed in Ministries > Church Branches; new branches start with no registers yet.
const branches = ["Central Campus", "Kawempe Branch", "Kira Branch", "Mukono Branch"];
export const branchServices = Object.fromEntries(branches.map((branch) => [branch,
  serviceOptions.filter((service) => service !== "Youth Worship Night" || ["Central Campus", "Kira Branch"].includes(branch)),
]));

export function getBranchServices(branch) {
  return branchServices[branch] ?? serviceOptions;
}

export const visitorBranches = {
  "visitor-001": "Central Campus", "visitor-002": "Kawempe Branch", "visitor-003": "Kira Branch",
  "visitor-004": "Mukono Branch", "visitor-005": "Central Campus", "visitor-006": "Central Campus",
  "visitor-007": "Mukono Branch", "visitor-008": "Kawempe Branch", "visitor-009": "Central Campus", "visitor-010": "Kira Branch",
};

// Explicit expected lists for these mock Sunday occurrences, not inferred from membership.
const expectedMembers = {
  "Central Campus": ["member-001", "member-003", "member-011"],
  "Kawempe Branch": ["member-005", "member-007"],
  "Kira Branch": ["member-002", "member-006", "member-010"],
  "Mukono Branch": ["member-012"],
};

export function createMockOccurrences() {
  const occurrences = [];
  for (const branch of branches) {
    for (const date of ["2026-10-18", "2026-10-25"]) {
      const expected = expectedMembers[branch].map((id) => `member:${id}`);
      const records = Object.fromEntries(expected.slice(0, date === "2026-10-18" ? 1 : 2).map((key) => [key, { status: "Present", category: "Member" }]));
      if (date === "2026-10-18" && expected.length > 1) records[expected[1]] = { status: "Absent", category: "Member" };
      occurrences.push({ id: occurrenceKey(branch, "Sunday Main Service", date), branch, service: "Sunday Main Service", date, expected, records, roster: [] });
    }
    for (const [service, date] of [["Wednesday Fellowship", "2026-10-21"], ["Friday Prayer Meeting", "2026-10-23"]]) {
      const expected = expectedMembers[branch].slice(0, 1).map((id) => `member:${id}`);
      occurrences.push({ id: occurrenceKey(branch, service, date), branch, service, date, expected, records: { [expected[0]]: { status: "Present", category: "Member" } }, roster: [] });
    }
  }
  // Existing visitor visits are the same people, dates, and services used by Visitors.
  for (const visitor of mockVisitors) {
    for (const visit of visitor.visitHistory) {
      const branch = visitorBranches[visitor.id];
      const id = occurrenceKey(branch, visit.service, visit.date);
      let occurrence = occurrences.find((item) => item.id === id);
      if (!occurrence) { occurrence = { id, branch, service: visit.service, date: visit.date, expected: [], records: {}, roster: [] }; occurrences.push(occurrence); }
      occurrence.records[`visitor:${visitor.id}`] = { status: "Present", category: "Visitor" };
    }
  }
  return occurrences;
}

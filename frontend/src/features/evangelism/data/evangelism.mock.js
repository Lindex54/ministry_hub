import { churchBranches } from "@/features/members/data/members.mock";
import { workers } from "@/features/outreach/data/outreach.mock";

export const branches = churchBranches;
export const evangelismTeam = workers;

export const outreachActivityTypes = [
  "Door-to-door Evangelism",
  "Street Evangelism",
  "Campus Outreach",
  "Community Outreach",
  "Crusade",
];

export const responseOptions = [
  "Accepted Christ",
  "Interested",
  "Needs Further Discussion",
  "Declined",
  "General Outreach",
];

export const mockOutreachActivities = [
  { id: "activity-001", name: "Kawempe Door-to-Door Outreach", type: "Door-to-door Evangelism", date: "2026-10-11", location: "Kawempe Trading Centre", branch: "Kawempe Branch", team: ["worker-daniel", "worker-grace"], headcount: 42, notes: "Handed out tracts and prayed with households along Bombo Road." },
  { id: "activity-002", name: "Kira Street Evangelism", type: "Street Evangelism", date: "2026-10-18", location: "Kira Market", branch: "Kira Branch", team: ["worker-daniel", "worker-peter"], headcount: 65, notes: "" },
  { id: "activity-003", name: "Makerere Campus Outreach", type: "Campus Outreach", date: "2026-10-24", location: "Makerere University main gate", branch: "Central Campus", team: ["worker-grace", "worker-peter", "worker-sarah"], headcount: 88, notes: "Partnered with the campus Christian fellowship." },
  { id: "activity-004", name: "Mukono Community Outreach", type: "Community Outreach", date: "2026-10-26", location: "Mukono Central Market", branch: "Mukono Branch", team: ["worker-daniel"], headcount: 30, notes: "" },
  { id: "activity-005", name: "Central Campus Crusade", type: "Crusade", date: "2026-11-07", location: "Central Campus grounds", branch: "Central Campus", team: ["worker-sarah", "worker-daniel", "worker-grace", "worker-peter"], headcount: 0, notes: "Upcoming three-night crusade. Headcount will be recorded after each session." },
];

export const mockEvangelismRecords = [
  {
    id: "evang-001", firstName: "Rose", lastName: "Nankya", phone: "0772 601 308", gender: "Female", districtVillage: "Kawempe, Kampala", permissionToContact: true, followUpNeeded: true, branch: "Kawempe Branch",
    history: [{ id: "enc-001-a", date: "2026-10-11", location: "Kawempe Trading Centre", activityId: "activity-001", evangelizedBy: "worker-daniel", response: "Interested", notes: "Open to visiting on Sunday. Gave her a tract and prayed with her." }],
  },
  {
    id: "evang-002", firstName: "James", lastName: "Obote", phone: "0701 520 663", gender: "Male", districtVillage: "Kira, Wakiso", permissionToContact: false, followUpNeeded: false, branch: "Kira Branch",
    history: [{ id: "enc-002-a", date: "2026-10-18", location: "Kira Market", activityId: "activity-002", evangelizedBy: "worker-peter", response: "Needs Further Discussion", notes: "Has questions about other faiths. Asked not to be contacted by phone for now." }],
  },
  {
    id: "evang-003", firstName: "Patricia", lastName: "Nankabirwa", phone: "0755 882 410", gender: "Female", districtVillage: "Makerere, Kampala", permissionToContact: true, followUpNeeded: true, branch: "Central Campus",
    history: [{ id: "enc-003-a", date: "2026-10-24", location: "Makerere University main gate", activityId: "activity-003", evangelizedBy: "worker-grace", response: "Accepted Christ", notes: "Prayed the salvation prayer. Wants a Bible and to join a cell group." }],
  },
  {
    id: "evang-004", firstName: "Isaac", lastName: "", phone: "", gender: "Male", districtVillage: "Mukono Central", permissionToContact: false, followUpNeeded: false, branch: "Mukono Branch",
    history: [{ id: "enc-004-a", date: "2026-10-26", location: "Mukono Central Market", activityId: "activity-004", evangelizedBy: "worker-daniel", response: "Declined", notes: "Polite but not interested at this time." }],
  },
  {
    id: "evang-005", firstName: "Brenda", lastName: "Nansamba", phone: "0784 220 115", gender: "Female", districtVillage: "Kawempe, Kampala", permissionToContact: true, followUpNeeded: true, branch: "Kawempe Branch",
    history: [
      { id: "enc-005-a", date: "2026-09-14", location: "Kawempe Trading Centre", activityId: null, evangelizedBy: "worker-grace", response: "Interested", notes: "First conversation, during a hospital visit." },
      { id: "enc-005-b", date: "2026-10-11", location: "Kawempe Trading Centre", activityId: "activity-001", evangelizedBy: "worker-daniel", response: "Accepted Christ", notes: "Follow-up visits continued. She accepted Christ this time." },
    ],
  },
  {
    id: "evang-006", firstName: "Emmanuel", lastName: "Ssali", phone: "0709 118 822", gender: "Male", districtVillage: "Central Division, Kampala", permissionToContact: true, followUpNeeded: false, branch: "Central Campus",
    history: [{ id: "enc-006-a", date: "2026-10-24", location: "Makerere University main gate", activityId: "activity-003", evangelizedBy: "worker-peter", response: "General Outreach", notes: "Received a tract and had a general conversation about the gospel." }],
  },
];

export function getRecordName(record) {
  return `${record.firstName} ${record.lastName}`.trim();
}

export function getSortedEncounters(record) {
  return [...record.history].sort((a, b) => b.date.localeCompare(a.date));
}

export function getLatestEncounter(record) {
  return getSortedEncounters(record)[0];
}

export function getFirstEncounter(record) {
  return [...record.history].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function isPositiveResponse(response) {
  return response === "Accepted Christ" || response === "Interested";
}

export function hasAcceptedChrist(record) {
  return record.history.some((entry) => entry.response === "Accepted Christ");
}

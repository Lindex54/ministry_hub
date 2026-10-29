export const branchStatuses = ["Active", "Inactive"];

export const mockBranches = [
  { id: "branch-central", name: "Central Campus", location: "Kampala Central", district: "Kampala", address: "Plot 12, Kampala Road, Kampala", phone: "+256 414 123 456", email: "central@ministryhub.org", dateEstablished: "2008-01-10", leaderKey: "worker-sarah", assistantLeaderKey: "", description: "The founding campus and administrative headquarters of Ministry Hub.", status: "Active" },
  { id: "branch-kawempe", name: "Kawempe Branch", location: "Kawempe", district: "Kampala", address: "Bombo Road, Kawempe Trading Centre", phone: "+256 414 223 456", email: "kawempe@ministryhub.org", dateEstablished: "2014-05-18", leaderKey: "worker-grace", assistantLeaderKey: "", description: "Serves the Kawempe and surrounding Bombo Road communities.", status: "Active" },
  { id: "branch-kira", name: "Kira Branch", location: "Kira Municipality", district: "Wakiso", address: "Kira Road, near Kira Market", phone: "+256 414 323 456", email: "kira@ministryhub.org", dateEstablished: "2017-09-02", leaderKey: "worker-peter", assistantLeaderKey: "member-010", description: "Serves Kira, Kireka, and Naalya communities.", status: "Active" },
  { id: "branch-mukono", name: "Mukono Branch", location: "Mukono Central", district: "Mukono", address: "Jinja Road, Mukono Central Market", phone: "+256 414 423 456", email: "", dateEstablished: "2019-03-24", leaderKey: "worker-daniel", assistantLeaderKey: "", description: "Serves Mukono town and the Goma and Seeta divisions.", status: "Active" },
];

export function getBranchMemberCount(branch, members) {
  return members.filter((member) => member.branch === branch.name).length;
}

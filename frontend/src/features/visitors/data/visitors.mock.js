export const serviceOptions = [
  "Sunday Main Service",
  "Wednesday Fellowship",
  "Friday Prayer Meeting",
  "Youth Worship Night",
];

export const followUpStatuses = ["Pending", "In Progress", "Completed", "Unable to Reach"];
export const contactMethods = ["Phone call", "SMS", "Email"];
export const churchWorkers = ["Sarah Kato", "Daniel Mugisha", "Grace Atim", "Peter Lwanga"];

export const mockVisitors = [
  {
    id: "visitor-001", firstName: "Lydia", lastName: "Nakato", phone: "+256 772 384 610", email: "lydia.nakato@example.org", gender: "Female", districtAddress: "Ntinda, Kampala", invitedBy: "Sarah Nabirye", prayerRequest: "Prayer for wisdom concerning a new work opportunity.", permissionToContact: true,
    visitHistory: [
      { id: "visit-001-a", date: "2026-09-27", service: "Sunday Main Service", notes: "Welcomed by the hospitality team." },
      { id: "visit-001-b", date: "2026-10-18", service: "Sunday Main Service", notes: "Returned with a friend." },
    ],
    followUps: [
      { id: "follow-001-a", date: "2026-09-29", assignedTo: "Grace Atim", contactMethod: "Phone call", status: "Completed", outcome: "Reached Lydia and thanked her for visiting." },
      { id: "follow-001-b", date: "2026-10-27", assignedTo: "Grace Atim", contactMethod: "SMS", status: "Pending", outcome: "" },
    ],
  },
  {
    id: "visitor-002", firstName: "Samuel", lastName: "Kiggundu", phone: "0701 442 896", email: "", gender: "Male", districtAddress: "Kawempe, Kampala", invitedBy: "Moses K.", prayerRequest: "", permissionToContact: true,
    visitHistory: [{ id: "visit-002-a", date: "2026-10-25", service: "Sunday Main Service", notes: "First visit." }],
    followUps: [{ id: "follow-002-a", date: "2026-10-28", assignedTo: "Daniel Mugisha", contactMethod: "Phone call", status: "Pending", outcome: "" }],
  },
  {
    id: "visitor-003", firstName: "Patricia", lastName: "Auma", phone: "+256 755 291 604", email: "patricia.auma@example.org", gender: "Female", districtAddress: "Kira, Wakiso", invitedBy: "Youth Ministry", prayerRequest: "Prayer for her university examinations.", permissionToContact: true,
    visitHistory: [
      { id: "visit-003-a", date: "2026-08-30", service: "Youth Worship Night", notes: "Attended the youth gathering." },
      { id: "visit-003-b", date: "2026-10-04", service: "Sunday Main Service", notes: "Joined the main service." },
      { id: "visit-003-c", date: "2026-10-23", service: "Friday Prayer Meeting", notes: "" },
    ],
    followUps: [{ id: "follow-003-a", date: "2026-10-24", assignedTo: "Peter Lwanga", contactMethod: "SMS", status: "In Progress", outcome: "Initial message sent; awaiting response." }],
  },
  {
    id: "visitor-004", firstName: "Robert", lastName: "Musinguzi", phone: "0782 665 140", email: "", gender: "Male", districtAddress: "Mukono", invitedBy: "", prayerRequest: "", permissionToContact: false,
    visitHistory: [{ id: "visit-004-a", date: "2026-10-21", service: "Wednesday Fellowship", notes: "Walk-in visitor." }], followUps: [],
  },
  {
    id: "visitor-005", firstName: "Brenda", lastName: "Namusoke", phone: "+256 704 518 237", email: "brenda.namusoke@example.org", gender: "Female", districtAddress: "Bweyogerere, Wakiso", invitedBy: "Esther N.", prayerRequest: "Prayer for family reconciliation.", permissionToContact: true,
    visitHistory: [
      { id: "visit-005-a", date: "2026-09-06", service: "Sunday Main Service", notes: "" },
      { id: "visit-005-b", date: "2026-09-13", service: "Sunday Main Service", notes: "" },
    ],
    followUps: [{ id: "follow-005-a", date: "2026-09-15", assignedTo: "Sarah Kato", contactMethod: "Phone call", status: "Completed", outcome: "Connected her with the women's ministry leader." }],
  },
  {
    id: "visitor-006", firstName: "Andrew", lastName: "Opio", phone: "0776 904 331", email: "", gender: "Male", districtAddress: "Nakawa, Kampala", invitedBy: "", prayerRequest: "", permissionToContact: true,
    visitHistory: [{ id: "visit-006-a", date: "2026-10-19", service: "Sunday Main Service", notes: "" }],
    followUps: [{ id: "follow-006-a", date: "2026-10-22", assignedTo: "Daniel Mugisha", contactMethod: "Phone call", status: "Unable to Reach", outcome: "Two call attempts were unanswered." }],
  },
  {
    id: "visitor-007", firstName: "Faith", lastName: "Nakirijja", phone: "+256 740 882 915", email: "faith.nakirijja@example.org", gender: "Female", districtAddress: "Seeta, Mukono", invitedBy: "Joan A.", prayerRequest: "", permissionToContact: true,
    visitHistory: [
      { id: "visit-007-a", date: "2026-07-12", service: "Sunday Main Service", notes: "" },
      { id: "visit-007-b", date: "2026-10-11", service: "Sunday Main Service", notes: "" },
    ],
    followUps: [{ id: "follow-007-a", date: "2026-10-13", assignedTo: "Grace Atim", contactMethod: "Email", status: "Completed", outcome: "Shared newcomer information and service schedule." }],
  },
  {
    id: "visitor-008", firstName: "Joseph", lastName: "Wasswa", phone: "0752 190 447", email: "", gender: "Male", districtAddress: "Nansana, Wakiso", invitedBy: "", prayerRequest: "Prayer for recovery from illness.", permissionToContact: false,
    visitHistory: [{ id: "visit-008-a", date: "2026-10-25", service: "Sunday Main Service", notes: "Requested no follow-up communication." }], followUps: [],
  },
  {
    id: "visitor-009", firstName: "Martha", lastName: "Atwine", phone: "+256 783 327 501", email: "martha.atwine@example.org", gender: "Female", districtAddress: "Kansanga, Kampala", invitedBy: "Grace A.", prayerRequest: "", permissionToContact: true,
    visitHistory: [
      { id: "visit-009-a", date: "2026-08-16", service: "Sunday Main Service", notes: "" },
      { id: "visit-009-b", date: "2026-10-18", service: "Sunday Main Service", notes: "" },
    ],
    followUps: [{ id: "follow-009-a", date: "2026-10-20", assignedTo: "Sarah Kato", contactMethod: "SMS", status: "In Progress", outcome: "Responded positively; orientation details to follow." }],
  },
  {
    id: "visitor-010", firstName: "Emmanuel", lastName: "Otim", phone: "0703 618 294", email: "", gender: "Male", districtAddress: "Kampala", invitedBy: "Peter O.", prayerRequest: "", permissionToContact: true,
    visitHistory: [{ id: "visit-010-a", date: "2026-10-24", service: "Youth Worship Night", notes: "First-time youth visitor." }],
    followUps: [{ id: "follow-010-a", date: "2026-10-29", assignedTo: "Peter Lwanga", contactMethod: "SMS", status: "Pending", outcome: "" }],
  },
];

export function getVisitorName(visitor) {
  return `${visitor.firstName} ${visitor.lastName}`;
}

export function getSortedVisits(visitor) {
  return [...visitor.visitHistory].sort((a, b) => b.date.localeCompare(a.date));
}

export function getFirstVisit(visitor) {
  return [...visitor.visitHistory].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function getLatestVisit(visitor) {
  return getSortedVisits(visitor)[0];
}

export function getVisitType(visitor) {
  return visitor.visitHistory.length > 1 ? "Returning" : "New";
}

export function getLatestFollowUp(visitor) {
  return [...visitor.followUps].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function getFollowUpStatus(visitor) {
  return getLatestFollowUp(visitor)?.status ?? "Not Scheduled";
}

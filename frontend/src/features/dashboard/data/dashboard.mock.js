export const defaultDashboardRange = {
  from: new Date(2026, 8, 26),
  to: new Date(2026, 9, 25),
};

const attendanceByRange = {
  short: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    current: [126, 118, 284, 142, 231, 96, 842],
    previous: [119, 124, 268, 137, 219, 91, 801],
  },
  medium: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    current: [792, 816, 829, 842],
    previous: [754, 779, 801, 817],
  },
  long: {
    labels: ["Jul", "Aug", "Sep", "Oct"],
    current: [3018, 3176, 3264, 3341],
    previous: [2894, 2988, 3112, 3204],
  },
};

const membershipByRange = {
  short: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [1, 0, 2, 1, 3, 2, 4] },
  medium: { labels: ["Week 1", "Week 2", "Week 3", "Week 4"], values: [8, 11, 9, 13] },
  long: { labels: ["Jul", "Aug", "Sep", "Oct"], values: [31, 36, 39, 41] },
};

const statsByRange = {
  short: {
    members: { value: "1,284", change: "+4 this week" },
    attendance: { value: "842", change: "+5.1% vs previous service" },
    visitors: { value: "12", change: "+3 vs previous week" },
    followUps: { value: "18", change: "6 overdue" },
  },
  medium: {
    members: { value: "1,284", change: "+41 this period" },
    attendance: { value: "842", change: "+5.1% vs previous service" },
    visitors: { value: "37", change: "+12.1% vs previous period" },
    followUps: { value: "18", change: "6 overdue" },
  },
  long: {
    members: { value: "1,284", change: "+146 this period" },
    attendance: { value: "842", change: "+5.1% vs previous service" },
    visitors: { value: "104", change: "+9.5% vs previous period" },
    followUps: { value: "18", change: "6 overdue" },
  },
};

export const recentAttendance = [
  { id: "att-1", service: "Sunday Main Service", date: "Oct 25, 2026", attendance: 842, status: "Completed" },
  { id: "att-2", service: "Friday Prayer Meeting", date: "Oct 23, 2026", attendance: 231, status: "Completed" },
  { id: "att-3", service: "Wednesday Fellowship", date: "Oct 21, 2026", attendance: 284, status: "Completed" },
  { id: "att-4", service: "Sunday Main Service", date: "Oct 18, 2026", attendance: 801, status: "Completed" },
  { id: "att-5", service: "Friday Prayer Meeting", date: "Oct 16, 2026", attendance: 219, status: "Reviewed" },
];

export const followUps = [
  { id: "fu-1", name: "Esther N.", type: "First-time visitor", assignee: "Sarah K.", due: "Oct 23", status: "Overdue" },
  { id: "fu-2", name: "Michael O.", type: "New member welcome", assignee: "Daniel M.", due: "Oct 25", status: "Due today" },
  { id: "fu-3", name: "Rebecca A.", type: "Visitor check-in", assignee: "Grace T.", due: "Oct 27", status: "Pending" },
  { id: "fu-4", name: "John B.", type: "Membership orientation", assignee: "Peter L.", due: "Oct 28", status: "Pending" },
];

export const upcomingEvents = [
  { id: "event-1", name: "Leadership Planning Meeting", date: "Oct 28", time: "5:30 PM", location: "Conference Room" },
  { id: "event-2", name: "Youth Worship Night", date: "Oct 30", time: "6:00 PM", location: "Main Auditorium" },
  { id: "event-3", name: "Community Outreach", date: "Nov 01", time: "9:00 AM", location: "Kawempe Community Centre" },
];

function getRangeKey(range) {
  if (!range?.from || !range?.to) return "medium";
  const days = Math.ceil(Math.abs(range.to - range.from) / 86400000) + 1;
  if (days <= 14) return "short";
  if (days <= 60) return "medium";
  return "long";
}

export function getDashboardData(range) {
  const key = getRangeKey(range);
  return {
    period: key,
    stats: statsByRange[key],
    attendance: attendanceByRange[key],
    membership: membershipByRange[key],
    recentAttendance,
    followUps,
    upcomingEvents,
  };
}


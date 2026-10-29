export const ministryStatuses = ["Active", "Inactive"];

export const mockMinistries = [
  { id: "ministry-worship", name: "Worship", description: "Leads congregational worship and manages the instrumental and vocal teams.", leaderId: "member-007", assistantLeaderId: "", dateEstablished: "2018-03-01", status: "Active", branchIds: ["branch-central", "branch-kira"] },
  { id: "ministry-choir", name: "Choir", description: "Choral ministry supporting Sunday services and special programs.", leaderId: "member-001", assistantLeaderId: "member-007", dateEstablished: "2012-06-15", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-childrens", name: "Children's Ministry", description: "Sunday school and discipleship for children up to age 12.", leaderId: "member-011", assistantLeaderId: "", dateEstablished: "2013-02-10", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-hospitality", name: "Hospitality", description: "Welcomes members and visitors and coordinates refreshments and ushering support.", leaderId: "member-005", assistantLeaderId: "", dateEstablished: "2014-09-01", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-mukono"] },
  { id: "ministry-media", name: "Media", description: "Sound, livestream, and media production for services and events.", leaderId: "member-006", assistantLeaderId: "", dateEstablished: "2019-01-20", status: "Inactive", branchIds: ["branch-central"] },
  { id: "ministry-mens", name: "Men's Ministry", description: "Discipleship, fellowship, and service projects for men.", leaderId: "member-002", assistantLeaderId: "member-010", dateEstablished: "2012-11-05", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-outreach", name: "Outreach", description: "Coordinates evangelism and community outreach activities.", leaderId: "member-010", assistantLeaderId: "member-005", dateEstablished: "2015-04-12", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-prayer", name: "Prayer", description: "Intercessory prayer meetings and prayer chain coordination.", leaderId: "member-002", assistantLeaderId: "member-011", dateEstablished: "2012-06-15", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-womens", name: "Women's Ministry", description: "Fellowship, discipleship, and welfare support for women.", leaderId: "member-001", assistantLeaderId: "", dateEstablished: "2013-05-18", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-youth", name: "Youth Ministry", description: "Discipleship, worship, and fellowship for teenagers and young adults.", leaderId: "member-003", assistantLeaderId: "member-012", dateEstablished: "2016-08-01", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
  { id: "ministry-ushers", name: "Ushers", description: "Coordinates seating, offering collection, and order during services.", leaderId: "member-004", assistantLeaderId: "", dateEstablished: "2021-02-01", status: "Active", branchIds: ["branch-central", "branch-kira"] },
  { id: "ministry-evangelism", name: "Evangelism", description: "Organizes door-to-door, street, and campus outreach, and crusades.", leaderId: "member-005", assistantLeaderId: "member-010", dateEstablished: "2017-07-01", status: "Active", branchIds: ["branch-central", "branch-kawempe", "branch-kira", "branch-mukono"] },
];

export function getMinistryMemberCount(ministry, members) {
  return members.filter((member) => member.ministries.includes(ministry.name)).length;
}

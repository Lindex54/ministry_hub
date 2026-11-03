// Development/demo seed for the operational Ministry Hub tables.
//
// The data is deliberately deterministic and connected across modules so the
// dashboard and directory screens tell one coherent story. Natural keys are
// checked before every insert, making the script safe to run repeatedly. It
// never deletes or replaces records entered by a user.
import { closeDatabase, getPool } from "../config/database.js";

const MEMBERS = [
  { membership_number: "MH-2026-0101", first_name: "Amina", last_name: "Nansubuga", preferred_name: "Amina", gender: "Female", date_of_birth: "1994-02-18", primary_phone: "0772 641 805", email: "amina.nansubuga@example.com", district: "Kampala", address: "Ntinda, Kampala", branch: "Central Campus", date_joined: "2018-06-17", status: "Active", emergency_name: "Mariam Nansubuga", emergency_relationship: "Sister", emergency_phone: "0701 442 190", ministries: ["Worship", "Choir"] },
  { membership_number: "MH-2026-0102", first_name: "Brian", last_name: "Ssekandi", preferred_name: "Brian", gender: "Male", date_of_birth: "1988-11-05", primary_phone: "0751 809 237", email: "brian.ssekandi@example.com", district: "Kampala", address: "Kisaasi, Kampala", branch: "Central Campus", date_joined: "2016-03-13", status: "Active", emergency_name: "Ruth Ssekandi", emergency_relationship: "Spouse", emergency_phone: "0782 329 114", ministries: ["Men's Ministry", "Ushers"] },
  { membership_number: "MH-2026-0103", first_name: "Catherine", last_name: "Akello", preferred_name: "Cathy", gender: "Female", date_of_birth: "1997-07-22", primary_phone: "0704 285 916", email: "catherine.akello@example.com", district: "Kampala", address: "Makerere, Kampala", branch: "Central Campus", date_joined: "2020-01-26", status: "Active", emergency_name: "Daniel Akello", emergency_relationship: "Brother", emergency_phone: "0776 502 811", ministries: ["Youth Ministry", "Media"] },
  { membership_number: "MH-2026-0104", first_name: "David", last_name: "Ochieng", preferred_name: "David", gender: "Male", date_of_birth: "1982-09-14", primary_phone: "0781 936 420", email: "david.ochieng@example.com", district: "Kampala", address: "Kawempe Division", branch: "Kawempe Branch", date_joined: "2015-08-09", status: "Active", emergency_name: "Florence Ochieng", emergency_relationship: "Spouse", emergency_phone: "0702 145 687", ministries: ["Prayer", "Men's Ministry"] },
  { membership_number: "MH-2026-0105", first_name: "Esther", last_name: "Nabirye", preferred_name: "Esther", gender: "Female", date_of_birth: "1991-04-03", primary_phone: "0773 518 604", email: "esther.nabirye@example.com", district: "Kampala", address: "Mpererwe, Kampala", branch: "Kawempe Branch", date_joined: "2019-05-12", status: "Active", emergency_name: "Joseph Nabirye", emergency_relationship: "Father", emergency_phone: "0752 809 366", ministries: ["Women's Ministry", "Hospitality"] },
  { membership_number: "MH-2026-0106", first_name: "Frank", last_name: "Mugisha", preferred_name: "Frank", gender: "Male", date_of_birth: "1999-12-20", primary_phone: "0706 772 351", email: "frank.mugisha@example.com", district: "Kampala", address: "Bwaise, Kampala", branch: "Kawempe Branch", date_joined: "2022-02-06", status: "Active", emergency_name: "Sarah Mugisha", emergency_relationship: "Mother", emergency_phone: "0785 248 613", ministries: ["Youth Ministry", "Evangelism"] },
  { membership_number: "MH-2026-0107", first_name: "Gloria", last_name: "Atwine", preferred_name: "Gloria", gender: "Female", date_of_birth: "1986-06-29", primary_phone: "0755 193 804", email: "gloria.atwine@example.com", district: "Wakiso", address: "Kira Municipality", branch: "Kira Branch", date_joined: "2018-10-21", status: "Active", emergency_name: "Andrew Atwine", emergency_relationship: "Spouse", emergency_phone: "0778 462 190", ministries: ["Children's Ministry", "Prayer"] },
  { membership_number: "MH-2026-0108", first_name: "Isaac", last_name: "Kato", preferred_name: "Isaac", gender: "Male", date_of_birth: "1993-01-11", primary_phone: "0788 407 625", email: "isaac.kato@example.com", district: "Wakiso", address: "Naalya, Wakiso", branch: "Kira Branch", date_joined: "2021-04-18", status: "Active", emergency_name: "Rebecca Kato", emergency_relationship: "Sister", emergency_phone: "0703 826 541", ministries: ["Worship", "Media"] },
  { membership_number: "MH-2026-0109", first_name: "Joan", last_name: "Namukasa", preferred_name: "Joan", gender: "Female", date_of_birth: "2001-08-07", primary_phone: "0708 316 952", email: "joan.namukasa@example.com", district: "Wakiso", address: "Kireka, Wakiso", branch: "Kira Branch", date_joined: "2023-07-02", status: "Active", emergency_name: "Peter Namukasa", emergency_relationship: "Father", emergency_phone: "0771 582 406", ministries: ["Youth Ministry", "Choir"] },
  { membership_number: "MH-2026-0110", first_name: "Kenneth", last_name: "Wasswa", preferred_name: "Ken", gender: "Male", date_of_birth: "1979-03-25", primary_phone: "0774 860 219", email: "kenneth.wasswa@example.com", district: "Mukono", address: "Goma Division, Mukono", branch: "Mukono Branch", date_joined: "2019-09-15", status: "Active", emergency_name: "Doreen Wasswa", emergency_relationship: "Spouse", emergency_phone: "0756 241 803", ministries: ["Men's Ministry", "Outreach"] },
  { membership_number: "MH-2026-0111", first_name: "Lydia", last_name: "Nakku", preferred_name: "Lydia", gender: "Female", date_of_birth: "1989-10-16", primary_phone: "0757 604 182", email: "lydia.nakku@example.com", district: "Mukono", address: "Seeta, Mukono", branch: "Mukono Branch", date_joined: "2020-11-08", status: "Active", emergency_name: "Michael Nakku", emergency_relationship: "Brother", emergency_phone: "0705 319 874", ministries: ["Women's Ministry", "Hospitality"] },
  { membership_number: "MH-2026-0112", first_name: "Moses", last_name: "Byaruhanga", preferred_name: "Moses", gender: "Male", date_of_birth: "1995-05-30", primary_phone: "0783 275 640", email: "moses.byaruhanga@example.com", district: "Mukono", address: "Mukono Central", branch: "Mukono Branch", date_joined: "2024-01-14", status: "Active", emergency_name: "Agnes Byaruhanga", emergency_relationship: "Mother", emergency_phone: "0779 138 526", ministries: ["Evangelism", "Ushers"] },
  { membership_number: "MH-2026-0113", first_name: "Naomi", last_name: "Aciro", preferred_name: "Naomi", gender: "Female", date_of_birth: "2000-02-09", primary_phone: "0701 893 475", email: "naomi.aciro@example.com", district: "Kampala", address: "Kamwokya, Kampala", branch: "Central Campus", date_joined: "2026-10-04", status: "Active", emergency_name: "Christine Aciro", emergency_relationship: "Mother", emergency_phone: "0754 620 193", ministries: ["Choir"] },
  { membership_number: "MH-2026-0114", first_name: "Paul", last_name: "Tumusiime", preferred_name: "Paul", gender: "Male", date_of_birth: "1996-06-12", primary_phone: "0776 430 918", email: "paul.tumusiime@example.com", district: "Wakiso", address: "Bweyogerere, Wakiso", branch: "Kira Branch", date_joined: "2026-10-11", status: "Active", emergency_name: "Hope Tumusiime", emergency_relationship: "Sister", emergency_phone: "0780 516 247", ministries: ["Outreach"] },
  { membership_number: "MH-2026-0115", first_name: "Ruth", last_name: "Nakato", preferred_name: "Ruth", gender: "Female", date_of_birth: "1992-12-01", primary_phone: "0782 715 309", email: "ruth.nakato@example.com", district: "Kampala", address: "Kanyanya, Kampala", branch: "Kawempe Branch", date_joined: "2026-10-18", status: "Active", emergency_name: "John Nakato", emergency_relationship: "Spouse", emergency_phone: "0707 284 651", ministries: ["Prayer"] },
  { membership_number: "MH-2026-0116", first_name: "Stephen", last_name: "Okot", preferred_name: "Stephen", gender: "Male", date_of_birth: "1984-07-19", primary_phone: "0709 528 164", email: "stephen.okot@example.com", district: "Mukono", address: "Namanve, Mukono", branch: "Mukono Branch", date_joined: "2026-10-25", status: "Active", emergency_name: "Beatrice Okot", emergency_relationship: "Spouse", emergency_phone: "0753 906 428", ministries: ["Men's Ministry"] },
];

const VISITORS = [
  { first_name: "Patricia", last_name: "Auma", phone: "0755291604", email: "patricia.auma@example.com", gender: "Female", district_address: "Kawempe, Kampala", invited_by: "Esther Nabirye", prayer_request: "Prayer for a new employment opportunity.", permission_to_contact: 1, branch: "Kawempe Branch", created_at: "2026-10-05 09:15:00", visits: [["2026-10-04", "Sunday Main Service", "First visit with a friend."], ["2026-10-18", "Sunday Main Service", "Returned for the main service."]] },
  { first_name: "Andrew", last_name: "Lubega", phone: "0770 482 615", email: "andrew.lubega@example.com", gender: "Male", district_address: "Ntinda, Kampala", invited_by: "Brian Ssekandi", prayer_request: "Guidance for his family business.", permission_to_contact: 1, branch: "Central Campus", created_at: "2026-10-12 10:20:00", visits: [["2026-10-11", "Sunday Main Service", "Welcomed by the hospitality team."], ["2026-10-25", "Sunday Main Service", "Second Sunday visit."]] },
  { first_name: "Brenda", last_name: "Namaganda", phone: "0702 936 148", email: "", gender: "Female", district_address: "Seeta, Mukono", invited_by: "Lydia Nakku", prayer_request: "Prayer for her mother's recovery.", permission_to_contact: 1, branch: "Mukono Branch", created_at: "2026-10-19 08:40:00", visits: [["2026-10-18", "Sunday Main Service", "Requested a pastoral call."]] },
  { first_name: "Charles", last_name: "Odongo", phone: "0786 154 723", email: "charles.odongo@example.com", gender: "Male", district_address: "Kireka, Wakiso", invited_by: "Isaac Kato", prayer_request: "", permission_to_contact: 1, branch: "Kira Branch", created_at: "2026-10-26 11:05:00", visits: [["2026-10-25", "Sunday Main Service", "Interested in the men's fellowship."]] },
  { first_name: "Diana", last_name: "Nabukenya", phone: "0758 307 496", email: "diana.nabukenya@example.com", gender: "Female", district_address: "Bwaise, Kampala", invited_by: "Frank Mugisha", prayer_request: "Prayer for peace at home.", permission_to_contact: 1, branch: "Kawempe Branch", created_at: "2026-10-30 17:25:00", visits: [["2026-10-30", "Friday Prayer Meeting", "Joined the evening prayer meeting."]] },
  { first_name: "Emmanuel", last_name: "Kisekka", phone: "0705 841 236", email: "", gender: "Male", district_address: "Mukono Central", invited_by: "Moses Byaruhanga", prayer_request: "", permission_to_contact: 0, branch: "Mukono Branch", created_at: "2026-11-01 12:10:00", visits: [["2026-11-01", "Sunday Main Service", "First-time visitor; no follow-up consent yet."]] },
  { first_name: "Florence", last_name: "Aber", phone: "0775 269 813", email: "florence.aber@example.com", gender: "Female", district_address: "Naalya, Wakiso", invited_by: "Joan Namukasa", prayer_request: "Wisdom concerning further studies.", permission_to_contact: 1, branch: "Kira Branch", created_at: "2026-11-02 09:30:00", visits: [["2026-11-01", "Sunday Main Service", "Met the youth ministry after service."]] },
  { first_name: "George", last_name: "Muwanga", phone: "0789 413 650", email: "george.muwanga@example.com", gender: "Male", district_address: "Kisaasi, Kampala", invited_by: "Amina Nansubuga", prayer_request: "Prayer for spiritual growth.", permission_to_contact: 1, branch: "Central Campus", created_at: "2026-11-02 14:45:00", visits: [["2026-11-01", "Sunday Main Service", "Asked about the next newcomers' class."]] },
];

const OUTREACH_ACTIVITIES = [
  { name: "Kawempe Community Visit", type: "Community outreach", activity_date: "2026-10-10", location: "Kawempe Trading Centre", branch: "Kawempe Branch", headcount: 42, notes: "Home visits, prayer, and distribution of family care packs.", team: ["Daniel Mugisha", "Grace Atim"] },
  { name: "Kira Youth School Outreach", type: "School outreach", activity_date: "2026-10-17", location: "Kira Secondary School", branch: "Kira Branch", headcount: 86, notes: "Career encouragement, music, and a short gospel message.", team: ["Daniel Mugisha", "Peter Lwanga"] },
  { name: "Mukono Market Evangelism", type: "Street evangelism", activity_date: "2026-10-24", location: "Mukono Central Market", branch: "Mukono Branch", headcount: 63, notes: "One-to-one conversations and invitation to the Sunday service.", team: ["Sarah Kato", "Daniel Mugisha"] },
  { name: "Central Campus Neighbourhood Walk", type: "Prayer walk", activity_date: "2026-10-31", location: "Kampala Central", branch: "Central Campus", headcount: 28, notes: "Prayer walk and conversations with nearby businesses.", team: ["Grace Atim", "Peter Lwanga"] },
];

const EVANGELISM_CONTACTS = [
  { first_name: "Harriet", last_name: "Nabwire", phone: "0704 617 382", gender: "Female", district_village: "Kawempe, Kampala", permission_to_contact: 1, follow_up_needed: 1, branch: "Kawempe Branch", activity: "Kawempe Community Visit", encounter_date: "2026-10-10", response: "Requested prayer", notes: "Open to a home fellowship visit.", worker: "Grace Atim" },
  { first_name: "Ivan", last_name: "Sserwanga", phone: "0778 305 914", gender: "Male", district_village: "Kira, Wakiso", permission_to_contact: 1, follow_up_needed: 1, branch: "Kira Branch", activity: "Kira Youth School Outreach", encounter_date: "2026-10-17", response: "Interested", notes: "Asked to be connected to the youth ministry.", worker: "Daniel Mugisha" },
  { first_name: "Juliet", last_name: "Alanyo", phone: "0752 681 430", gender: "Female", district_village: "Mukono Central", permission_to_contact: 1, follow_up_needed: 0, branch: "Mukono Branch", activity: "Mukono Market Evangelism", encounter_date: "2026-10-24", response: "Accepted invitation", notes: "Plans to attend with her sister.", worker: "Sarah Kato" },
  { first_name: "Martin", last_name: "Kiggundu", phone: "0708 943 267", gender: "Male", district_village: "Namanve, Mukono", permission_to_contact: 1, follow_up_needed: 1, branch: "Mukono Branch", activity: "Mukono Market Evangelism", encounter_date: "2026-10-24", response: "Needs follow-up", notes: "Requested a call after work hours.", worker: "Daniel Mugisha" },
  { first_name: "Peace", last_name: "Adoch", phone: "0780 526 149", gender: "Female", district_village: "Kamwokya, Kampala", permission_to_contact: 1, follow_up_needed: 1, branch: "Central Campus", activity: "Central Campus Neighbourhood Walk", encounter_date: "2026-10-31", response: "Requested prayer", notes: "Would like counselling and prayer support.", worker: "Grace Atim" },
  { first_name: "Ronald", last_name: "Mutebi", phone: "0771 864 305", gender: "Male", district_village: "Kampala Central", permission_to_contact: 0, follow_up_needed: 0, branch: "Central Campus", activity: "Central Campus Neighbourhood Walk", encounter_date: "2026-10-31", response: "Listened", notes: "Received an invitation card but declined follow-up.", worker: "Peter Lwanga" },
];

const EVENTS = [
  { name: "New Members Welcome Lunch", event_date: "2026-11-08", event_time: "13:00", location: "Central Campus Fellowship Hall", branch: "Central Campus" },
  { name: "Kira Youth Worship Evening", event_date: "2026-11-14", event_time: "17:00", location: "Kira Branch Main Hall", branch: "Kira Branch" },
  { name: "Women's Fellowship Conference", event_date: "2026-11-21", event_time: "09:00", location: "Central Campus Auditorium", branch: "Central Campus" },
  { name: "Christmas Community Care Day", event_date: "2026-12-12", event_time: "10:00", location: "Mukono Central Community Grounds", branch: "Mukono Branch" },
];

const TEMPLATES = [
  { name: "First-time visitor welcome", subject: "Thank you for visiting Kampala Community Church", body: "Hello {{firstName}}, thank you for worshipping with us. We were glad to welcome you and would love to support you in prayer." },
  { name: "Service reminder", subject: "Sunday service reminder", body: "Hello {{firstName}}, this is a friendly reminder that our Sunday Main Service begins at 9:00 AM. We look forward to seeing you." },
  { name: "Follow-up check-in", subject: "How are you doing?", body: "Hello {{firstName}}, our church family is checking in. Please let us know how you are and whether there is anything we can pray about." },
  { name: "Event invitation", subject: "You are invited", body: "Hello {{firstName}}, you are warmly invited to {{eventName}} on {{eventDate}} at {{eventLocation}}." },
];

function sqlIdentifier(value) {
  if (!/^[a-z_]+$/.test(value)) throw new Error(`Unsafe SQL identifier: ${value}`);
  return `\`${value}\``;
}

async function findOne(connection, table, criteria) {
  const entries = Object.entries(criteria);
  const where = entries.map(([column]) => `${sqlIdentifier(column)} = ?`).join(" AND ");
  const [rows] = await connection.query(`SELECT * FROM ${sqlIdentifier(table)} WHERE ${where} LIMIT 1`, entries.map(([, value]) => value));
  return rows[0] ?? null;
}

async function insertRow(connection, table, data) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  const columns = entries.map(([column]) => sqlIdentifier(column)).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  const [result] = await connection.query(`INSERT INTO ${sqlIdentifier(table)} (${columns}) VALUES (${placeholders})`, entries.map(([, value]) => value));
  return { id: result.insertId, ...data };
}

async function ensureRow(connection, table, criteria, data = criteria) {
  return await findOne(connection, table, criteria) ?? insertRow(connection, table, data);
}

async function updateById(connection, table, id, data) {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  if (!entries.length) return;
  const assignments = entries.map(([column]) => `${sqlIdentifier(column)} = ?`).join(", ");
  await connection.query(`UPDATE ${sqlIdentifier(table)} SET ${assignments} WHERE id = ?`, [...entries.map(([, value]) => value), id]);
}

async function rowsByName(connection, table) {
  const [rows] = await connection.query(`SELECT * FROM ${sqlIdentifier(table)}`);
  return new Map(rows.map((row) => [row.name, row]));
}

async function seed() {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const churches = await rowsByName(connection, "churches");
    if (!churches.size) throw new Error("No church exists. Run `npm run db:seed:reference` first.");
    const branches = await rowsByName(connection, "branches");
    const ministries = await rowsByName(connection, "ministries");
    const services = await rowsByName(connection, "services");
    const staff = await rowsByName(connection, "staff");
    if (!branches.size || !ministries.size || !services.size || !staff.size) {
      throw new Error("Reference branches, ministries, services, or staff are missing. Run `npm run db:seed:reference` first.");
    }

    const staffDetails = [
      { name: "Sarah Kato", phone: "0772 410 682", email: "sarah.kato@ministryhub.org", branch: "Central Campus" },
      { name: "Daniel Mugisha", phone: "0701 638 295", email: "daniel.mugisha@ministryhub.org", branch: "Kawempe Branch" },
      { name: "Grace Atim", phone: "0782 904 173", email: "grace.atim@ministryhub.org", branch: "Kira Branch" },
      { name: "Peter Lwanga", phone: "0754 362 810", email: "peter.lwanga@ministryhub.org", branch: "Mukono Branch" },
    ];
    for (const item of staffDetails) {
      const row = staff.get(item.name);
      if (row) await updateById(connection, "staff", row.id, { phone: item.phone, email: item.email, branch_id: branches.get(item.branch)?.id ?? null });
    }

    const memberRows = new Map();
    for (const item of MEMBERS) {
      const { branch, ministries: ministryNames, ...data } = item;
      const row = await ensureRow(connection, "members", { membership_number: data.membership_number }, { ...data, branch_id: branches.get(branch)?.id ?? null });
      memberRows.set(data.membership_number, row);
      for (const ministryName of ministryNames) {
        const ministry = ministries.get(ministryName);
        if (ministry) await ensureRow(connection, "member_ministries", { member_id: row.id, ministry_id: ministry.id });
      }
    }

    const [allMembers] = await connection.query("SELECT * FROM members ORDER BY id");
    const allMemberByName = new Map(allMembers.map((row) => [`${row.first_name} ${row.last_name}`, row]));

    const ministryDetails = [
      ["Worship", "Leads congregational worship and develops vocalists and instrumentalists.", "2012-03-04", "Amina Nansubuga"],
      ["Choir", "Supports Sunday services and special programmes through choral music.", "2012-06-15", "Naomi Aciro"],
      ["Children's Ministry", "Provides safe, age-appropriate discipleship for children up to age twelve.", "2013-02-10", "Gloria Atwine"],
      ["Hospitality", "Welcomes members and visitors and coordinates reception and refreshments.", "2014-09-01", "Esther Nabirye"],
      ["Media", "Manages sound, projection, photography, livestreams, and digital content.", "2019-01-20", "Catherine Akello"],
      ["Men's Ministry", "Builds fellowship, discipleship, and service among men.", "2012-11-05", "Brian Ssekandi"],
      ["Outreach", "Coordinates practical community care and church outreach activities.", "2015-04-12", "Kenneth Wasswa"],
      ["Prayer", "Coordinates intercession, prayer meetings, and pastoral prayer support.", "2012-06-15", "David Ochieng"],
      ["Women's Ministry", "Provides fellowship, discipleship, mentoring, and welfare support for women.", "2013-05-18", "Lydia Nakku"],
      ["Youth Ministry", "Disciples teenagers and young adults through fellowship and service.", "2016-08-01", "Joan Namukasa"],
      ["Ushers", "Coordinates seating, offering collection, and order during services.", "2014-01-12", "Brian Ssekandi"],
      ["Evangelism", "Equips the church for personal evangelism, missions, and gospel outreach.", "2017-07-01", "Moses Byaruhanga"],
    ];
    for (const [name, description, dateEstablished, leaderName] of ministryDetails) {
      const ministry = ministries.get(name);
      const leader = allMemberByName.get(leaderName);
      if (ministry) await updateById(connection, "ministries", ministry.id, { description, date_established: dateEstablished, leader_type: leader ? "member" : null, leader_id: leader?.id ?? null });
    }

    const allBranchNames = [...branches.keys()];
    for (const ministry of ministries.values()) {
      const coverage = ["Media", "Worship", "Ushers"].includes(ministry.name) ? ["Central Campus", "Kira Branch"] : allBranchNames;
      for (const branchName of coverage) await ensureRow(connection, "ministry_branches", { ministry_id: ministry.id, branch_id: branches.get(branchName).id });
    }
    for (const branch of branches.values()) {
      for (const service of services.values()) await ensureRow(connection, "branch_services", { branch_id: branch.id, service_id: service.id });
    }

    const visitorRows = new Map();
    for (const item of VISITORS) {
      const { branch, visits, ...data } = item;
      let row = await findOne(connection, "visitors", { phone: data.phone });
      if (!row) row = await insertRow(connection, "visitors", { ...data, branch_id: branches.get(branch)?.id ?? null });
      visitorRows.set(data.phone, row);
      for (const [visitDate, serviceName, notes] of visits) {
        await ensureRow(connection, "visitor_visits", { visitor_id: row.id, visit_date: visitDate, service_id: services.get(serviceName)?.id ?? null }, { visitor_id: row.id, visit_date: visitDate, service_id: services.get(serviceName)?.id ?? null, notes });
      }
    }

    const activityRows = new Map();
    for (const item of OUTREACH_ACTIVITIES) {
      const { branch, team, ...data } = item;
      const row = await ensureRow(connection, "outreach_activities", { name: data.name, activity_date: data.activity_date }, { ...data, branch_id: branches.get(branch)?.id ?? null });
      activityRows.set(data.name, row);
      for (const staffName of team) {
        const worker = staff.get(staffName);
        if (worker) await ensureRow(connection, "outreach_activity_team", { activity_id: row.id, staff_id: worker.id });
      }
    }

    const contactRows = [];
    for (const item of EVANGELISM_CONTACTS) {
      const { branch, activity, encounter_date, response, notes, worker, ...data } = item;
      const row = await ensureRow(connection, "evangelism_contacts", { phone: data.phone }, { ...data, branch_id: branches.get(branch)?.id ?? null });
      contactRows.push({ ...row, seed: item });
      await ensureRow(connection, "evangelism_encounters", { evangelism_contact_id: row.id, encounter_date }, { evangelism_contact_id: row.id, encounter_date, location: item.district_village, activity_id: activityRows.get(activity)?.id ?? null, evangelized_by: staff.get(worker)?.id ?? null, response, notes });
    }

    const followUps = [
      { type: "visitor", row: visitorRows.get("0770 482 615"), staff: "Sarah Kato", method: "Phone call", date: "2026-11-03", priority: "Medium", reason: "Second-visit welcome", status: "Pending" },
      { type: "visitor", row: visitorRows.get("0702 936 148"), staff: "Peter Lwanga", method: "Phone call", date: "2026-11-04", priority: "High", reason: "Prayer and pastoral care", status: "In Progress" },
      { type: "visitor", row: visitorRows.get("0758 307 496"), staff: "Daniel Mugisha", method: "WhatsApp", date: "2026-11-05", priority: "High", reason: "Family prayer request", status: "Pending" },
      { type: "evangelism_contact", row: contactRows.find((item) => item.phone === "0704 617 382"), staff: "Grace Atim", method: "Home visit", date: "2026-11-06", priority: "Medium", reason: "Connect to home fellowship", status: "Pending" },
      { type: "evangelism_contact", row: contactRows.find((item) => item.phone === "0778 305 914"), staff: "Daniel Mugisha", method: "Phone call", date: "2026-11-03", priority: "Medium", reason: "Youth ministry connection", status: "Pending" },
      { type: "member", row: memberRows.get("MH-2026-0114"), staff: "Grace Atim", method: "In person", date: "2026-11-01", priority: "Low", reason: "New member check-in", status: "Completed" },
    ];
    for (const task of followUps) {
      if (!task.row) continue;
      const row = await ensureRow(connection, "follow_up_tasks", { person_type: task.type, person_id: task.row.id, reason: task.reason }, { person_type: task.type, person_id: task.row.id, assigned_to_staff_id: staff.get(task.staff)?.id ?? null, method: task.method, scheduled_date: task.date, priority: task.priority, reason: task.reason, status: task.status });
      if (task.status === "Completed") await ensureRow(connection, "follow_up_task_history", { task_id: row.id, status: "Completed" }, { task_id: row.id, occurred_at: "2026-11-01 15:30:00", worker_id: staff.get(task.staff)?.id ?? null, status: "Completed", reached: "Yes", outcome: "Member is settling in well and has joined the Outreach ministry.", notes: "No further follow-up required at this time.", another_follow_up: 0 });
    }

    const occurrences = [
      ["Central Campus", "Sunday Main Service", "2026-10-04"],
      ["Central Campus", "Sunday Main Service", "2026-10-11"],
      ["Central Campus", "Sunday Main Service", "2026-10-18"],
      ["Central Campus", "Sunday Main Service", "2026-10-25"],
      ["Central Campus", "Sunday Main Service", "2026-11-01"],
      ["Kawempe Branch", "Friday Prayer Meeting", "2026-10-30"],
      ["Kira Branch", "Youth Worship Night", "2026-10-31"],
      ["Mukono Branch", "Sunday Main Service", "2026-11-01"],
    ];
    for (let occurrenceIndex = 0; occurrenceIndex < occurrences.length; occurrenceIndex += 1) {
      const [branchName, serviceName, occurrenceDate] = occurrences[occurrenceIndex];
      const branch = branches.get(branchName);
      const service = services.get(serviceName);
      const occurrence = await ensureRow(connection, "attendance_occurrences", { branch_id: branch.id, service_id: service.id, occurrence_date: occurrenceDate });
      const expected = allMembers.filter((member) => member.branch_id === branch.id && member.status === "Active");
      for (let memberIndex = 0; memberIndex < expected.length; memberIndex += 1) {
        const member = expected[memberIndex];
        await ensureRow(connection, "attendance_expected_members", { occurrence_id: occurrence.id, member_id: member.id });
        const absent = (memberIndex + occurrenceIndex) % 7 === 0;
        await ensureRow(connection, "attendance_records", { occurrence_id: occurrence.id, person_type: "member", person_id: member.id }, { occurrence_id: occurrence.id, person_type: "member", person_id: member.id, status: absent ? "Absent" : "Present", category: "Member" });
      }
      for (const visitor of visitorRows.values()) {
        const [visits] = await connection.query("SELECT id FROM visitor_visits WHERE visitor_id = ? AND visit_date = ? AND service_id = ?", [visitor.id, occurrenceDate, service.id]);
        if (visits.length) await ensureRow(connection, "attendance_records", { occurrence_id: occurrence.id, person_type: "visitor", person_id: visitor.id }, { occurrence_id: occurrence.id, person_type: "visitor", person_id: visitor.id, status: "Present", category: "Visitor" });
      }
    }

    const eventRows = [];
    for (const item of EVENTS) {
      const { branch, ...data } = item;
      const row = await ensureRow(connection, "events", { name: data.name, event_date: data.event_date }, { ...data, branch_id: branches.get(branch)?.id ?? null });
      eventRows.push(row);
    }
    const activeMembers = allMembers.filter((member) => member.status === "Active");
    for (let index = 0; index < Math.min(activeMembers.length, 10); index += 1) {
      await ensureRow(connection, "event_attendees", { event_id: eventRows[index % eventRows.length].id, person_type: "member", person_id: activeMembers[index].id });
    }

    for (const template of TEMPLATES) await ensureRow(connection, "communication_templates", { name: template.name }, template);

    const campaign = await ensureRow(connection, "communication_campaigns", { title: "November service and events update" }, { title: "November service and events update", channel: "email", subject: "What is happening at Kampala Community Church this November", body: "Hello {{firstName}}, here are the services and events planned for November. We look forward to worshipping and serving with you.", timing: "now", association: "All active members", status: "sent", recipient_count: Math.min(activeMembers.length, 12), simulated_at: "2026-11-02 16:00:00", sent_at: "2026-11-02 16:02:00", created_by: staff.get("Sarah Kato")?.id ?? null });
    const [existingRecipients] = await connection.query("SELECT id FROM communication_campaign_recipients WHERE campaign_id = ? LIMIT 1", [campaign.id]);
    if (!existingRecipients.length) {
      for (const member of activeMembers.slice(0, 12)) {
        await insertRow(connection, "communication_campaign_recipients", { campaign_id: campaign.id, person_type: "member", person_id: member.id, name: `${member.first_name} ${member.last_name}`, destination: member.email || member.primary_phone, delivery_status: "sent", sent_at: "2026-11-02 16:02:00" });
      }
    }

    await connection.commit();

    const summaryTables = ["members", "visitors", "visitor_visits", "outreach_activities", "evangelism_contacts", "evangelism_encounters", "follow_up_tasks", "attendance_occurrences", "attendance_records", "events", "communication_templates", "communication_campaigns"];
    console.log("[seed:sample] Sample data is ready.");
    for (const table of summaryTables) {
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM ${sqlIdentifier(table)}`);
      console.log(`[seed:sample] ${table}: ${count}`);
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

seed()
  .then(async () => { await closeDatabase(); })
  .catch(async (error) => { console.error("[seed:sample] Failed:", error); await closeDatabase(); process.exitCode = 1; });

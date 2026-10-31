// One-off seed: creates the church, the four church branches, and the standard
// ministries already shown throughout the (still mostly mock) frontend, so the
// newly-wired Members module has real branches/ministries to attach records to.
// Idempotent — safe to run more than once; skips anything that already exists by name.
import { getPool, closeDatabase } from "../config/database.js";
import { listChurches, createChurch } from "../modules/churches/church.model.js";
import { listBranches, createBranch } from "../modules/branches/branch.model.js";
import { listMinistries, createMinistry } from "../modules/ministries/ministry.model.js";

const BRANCHES = [
  { name: "Central Campus", location: "Kampala Central", district: "Kampala", address: "Plot 12, Kampala Road, Kampala", phone: "+256 414 123 456", email: "central@ministryhub.org", date_established: "2008-01-10", description: "The founding campus and administrative headquarters of Ministry Hub.", status: "Active" },
  { name: "Kawempe Branch", location: "Kawempe", district: "Kampala", address: "Bombo Road, Kawempe Trading Centre", phone: "+256 414 223 456", email: "kawempe@ministryhub.org", date_established: "2014-05-18", description: "Serves the Kawempe and surrounding Bombo Road communities.", status: "Active" },
  { name: "Kira Branch", location: "Kira Municipality", district: "Wakiso", address: "Kira Road, near Kira Market", phone: "+256 414 323 456", email: "kira@ministryhub.org", date_established: "2017-09-02", description: "Serves Kira, Kireka, and Naalya communities.", status: "Active" },
  { name: "Mukono Branch", location: "Mukono Central", district: "Mukono", address: "Jinja Road, Mukono Central Market", phone: "+256 414 423 456", email: "", date_established: "2019-03-24", description: "Serves Mukono town and the Goma and Seeta divisions.", status: "Active" },
];

const MINISTRIES = [
  "Worship", "Choir", "Children's Ministry", "Hospitality", "Media", "Men's Ministry",
  "Outreach", "Prayer", "Women's Ministry", "Youth Ministry", "Ushers", "Evangelism",
];

async function run() {
  const existingChurches = await listChurches();
  const church = existingChurches[0] ?? await createChurch({ name: "Kampala Community Church" });
  console.log(`[seed] Church: ${church.name} (#${church.id})`);

  const existingBranches = await listBranches();
  for (const branch of BRANCHES) {
    if (existingBranches.some((row) => row.name === branch.name)) {
      console.log(`[seed] Branch already exists: ${branch.name}`);
      continue;
    }
    const created = await createBranch({ ...branch, church_id: church.id });
    console.log(`[seed] Created branch: ${created.name} (#${created.id})`);
  }

  const existingMinistries = await listMinistries();
  for (const name of MINISTRIES) {
    if (existingMinistries.some((row) => row.name === name)) {
      console.log(`[seed] Ministry already exists: ${name}`);
      continue;
    }
    const created = await createMinistry({ name, status: "Active" });
    console.log(`[seed] Created ministry: ${created.name} (#${created.id})`);
  }
}

run()
  .then(async () => { await closeDatabase(); })
  .catch(async (error) => { console.error("[seed] Failed:", error); await closeDatabase(); process.exitCode = 1; });

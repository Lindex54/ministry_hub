// One-off seed: creates the Administrator role (if missing) and the first
// admin login (username/password given by the owner). Idempotent — safe to
// run more than once; skips the user if it already exists.
import bcrypt from "bcryptjs";
import { closeDatabase } from "../config/database.js";
import { listRoles, createRole } from "../modules/users/role.model.js";
import { findUserByUsername, createUser } from "../modules/users/user.model.js";

const USERNAME = "Godwin26";
const PASSWORD = "Godwin_Ministry_Hub";
const EMAIL = "godwin26@ministryhub.local";

async function run() {
  const roles = await listRoles();
  let role = roles.find((row) => row.name === "Administrator");
  if (!role) {
    role = await createRole({ name: "Administrator", description: "Full access to Ministry Hub." });
    console.log(`[seed] Created role: ${role.name} (#${role.id})`);
  } else {
    console.log(`[seed] Role already exists: ${role.name}`);
  }

  const existing = await findUserByUsername(USERNAME);
  if (existing) {
    console.log(`[seed] User already exists: ${USERNAME}`);
    return;
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 12);
  const user = await createUser({
    name: "Godwin",
    username: USERNAME,
    email: EMAIL,
    password_hash: passwordHash,
    role_id: role.id,
    status: "Active",
  });
  console.log(`[seed] Created user: ${user.username} (#${user.id})`);
}

run()
  .then(async () => { await closeDatabase(); })
  .catch(async (error) => { console.error("[seed] Failed:", error); await closeDatabase(); process.exitCode = 1; });

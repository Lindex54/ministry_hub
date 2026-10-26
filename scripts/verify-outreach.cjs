// Run with an installed Playwright module path: node scripts/verify-outreach.cjs <module-path>
const assert = require("node:assert/strict");
const { chromium } = require(process.argv[2] || "playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const choose = async (label, option) => {
      await page.getByRole("combobox", { name: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\*?$`) }).click();
      await page.getByRole("option", { name: option, exact: true }).click();
    };
    const group = async (name, option) => {
      await page.getByRole("button", { name, exact: true }).click();
      await page.getByRole("menuitemcheckbox", { name: option, exact: true }).click();
      await page.keyboard.press("Escape");
    };
    await page.goto("http://localhost:3100/communications");
    await page.getByLabel("Campaign name").fill("Sunday welcome test");
    await page.getByRole("textbox", { name: /^Message\s*\*?$/ }).fill("Hello {{name}}, welcome to our service.");
    await group("Choose record groups", "Member");
    await page.getByRole("button", { name: "Preview campaign", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Simulate campaign", exact: true }).click();
    await page.getByRole("tab", { name: /Communication history/ }).click();
    await page.getByRole("cell", { name: "Sunday welcome test", exact: true }).waitFor();
    await page.getByRole("cell", { name: "Simulation recorded — not sent", exact: true }).waitFor();

    await page.getByRole("tab", { name: "Compose campaign", exact: true }).click();
    await page.getByLabel("Campaign name").fill("Scheduled invitation test");
    await choose("Channel", "Email");
    await page.getByLabel("Email subject").fill("Invitation");
    await page.getByRole("textbox", { name: /^Message\s*\*?$/ }).fill("Hello {{name}}, join our upcoming gathering.");
    await group("Choose record groups", "Visitor");
    await choose("When", "Schedule mock campaign");
    await page.getByLabel("Scheduled time (Africa/Kampala)").fill("2030-10-28T10:00");
    await page.getByRole("button", { name: "Preview campaign", exact: true }).click();
    await page.getByRole("button", { name: "Confirm mock schedule", exact: true }).click();
    await page.getByRole("tab", { name: /Communication history/ }).click();
    await page.getByRole("cell", { name: "Scheduled (mock)", exact: true }).waitFor();
    await page.getByRole("button", { name: "Simulate now", exact: true }).click();
    assert.equal(await page.getByRole("cell", { name: "Simulation recorded — not sent", exact: true }).count(), 2);

    await page.getByRole("link", { name: "Follow-ups", exact: true }).click();
    await page.getByRole("button", { name: "Assign follow-up", exact: true }).click();
    await choose("Person", "Lydia Nakato · Visitor");
    await choose("Assigned worker", "Sarah Kato · Pastor");
    await choose("Method", "Physical Visit");
    await page.getByLabel("Reason").fill("Pastoral visit test");
    await page.getByRole("button", { name: "Create assignment", exact: true }).click();
    await page.getByRole("textbox", { name: "Search table" }).fill("Pastoral visit test");
    await page.getByRole("button", { name: "Feedback", exact: true }).click();
    await choose("Was the person reached?", "Yes");
    await choose("Progress", "Completed");
    await page.getByLabel("Outcome").fill("Visited Lydia and agreed a further check-in.");
    await page.getByLabel("Another follow-up is necessary").check();
    await page.getByLabel("Next follow-up date").fill("2030-10-29");
    await page.getByRole("button", { name: "Save feedback", exact: true }).click();
    await page.getByRole("cell", { name: "Completed", exact: true }).waitFor();
    await page.getByRole("link", { name: "Lydia Nakato", exact: true }).click();
    await page.getByText("Visited Lydia and agreed a further check-in.", { exact: true }).waitFor();
    await page.getByRole("link", { name: "Communications", exact: true }).click();
    await page.getByRole("tab", { name: /Communication history/ }).click();
    assert.equal(await page.getByRole("cell", { name: "Simulation recorded — not sent", exact: true }).count(), 2, "Campaign history survives navigation");

    for (const route of ["/dashboard", "/members", "/members/member-001", "/visitors", "/visitors/visitor-001", "/follow-ups", "/communications"]) {
      await page.goto(`http://localhost:3100${route}`);
      await page.locator("h1").first().waitFor();
      assert.equal(await page.getByText("Application error", { exact: false }).count(), 0);
      await page.setViewportSize({ width: 390, height: 844 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((currentTheme) => document.documentElement.classList.toggle("dark", currentTheme === "dark"), theme);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} should fit a mobile viewport in ${theme} mode`);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log("PASS: campaign simulation and scheduling, individual assignments, feedback, linked visitor history, session continuity, desktop/mobile route checks, and no browser runtime errors.");
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });

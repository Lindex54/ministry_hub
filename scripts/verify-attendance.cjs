// Run against the production frontend on port 3100 with an installed Playwright module path.
const assert = require("node:assert/strict");
const { chromium } = require(process.argv[2] || "playwright");

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const choose = async (label, value) => { await page.getByRole("combobox", { name: label, exact: true }).click(); await page.getByRole("option", { name: value, exact: true }).click(); };
    const register = () => page.locator("#attendance-register");
    const row = (name) => register().getByRole("row").filter({ has: page.getByRole("link", { name, exact: true }) });
    const stats = async () => (await page.getByTestId("attendance-statistics").locator('[data-slot="card-title"]').allTextContents()).map(Number);
    const checkStats = async (expected) => { await page.waitForTimeout(100); assert.deepEqual(await stats(), expected); };
    const present = async (name) => { await row(name).getByRole("button", { name: "Present", exact: true }).click(); };
    const addPerson = async (type, firstName, lastName, phone) => {
      await page.getByRole("button", { name: "Add new person", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: `Register ${type}`, exact: true }).click();
      await page.getByLabel("First name").fill(firstName);
      await page.getByLabel("Last name").fill(lastName);
      await page.getByLabel(type === "member" ? "Primary phone number" : "Phone number", { exact: false }).first().fill(phone);
      if (type === "member") await page.getByLabel("None", { exact: true }).check();
      else {
        assert.equal(await page.getByLabel("Date of visit").inputValue(), "2026-10-25");
        assert.ok(await page.getByLabel("Date of visit").isDisabled());
      }
      await page.getByRole("button", { name: `Register ${type}`, exact: true }).click();
      await page.locator("h1").filter({ hasText: /^Attendance$/ }).waitFor();
    };

    await page.goto("http://localhost:3100/attendance");
    await page.locator("h1").filter({ hasText: /^Attendance$/ }).waitFor();
    await checkStats([2, 2, 0, 0]);
    await register().getByRole("textbox", { name: "Search table" }).fill("0781345927");
    assert.equal(await row("Ruth Nansubuga").count(), 1, "Phone search ignores spaces and handles Ugandan formatting");
    await register().getByRole("textbox", { name: "Search table" }).fill("MH-2026-0011");
    assert.equal(await row("Ruth Nansubuga").count(), 1, "Membership number search finds the same member");
    await register().getByRole("textbox", { name: "Search table" }).fill("");
    await present("Ruth Nansubuga");
    await checkStats([3, 3, 0, 0]);
    assert.ok(await row("Ruth Nansubuga").getByRole("button", { name: "Present", exact: true }).isDisabled());
    await choose("Church branch", "Kawempe Branch");
    await checkStats([4, 2, 2, 0]);
    await page.getByRole("combobox", { name: "Service", exact: true }).click();
    assert.equal(await page.getByRole("option", { name: "Youth Worship Night", exact: true }).count(), 0);
    await page.keyboard.press("Escape");
    await choose("Church branch", "Central Campus");
    await checkStats([3, 3, 0, 0]);
    await choose("Service", "Wednesday Fellowship");
    await checkStats([1, 1, 0, 0]);
    await choose("Service", "Sunday Main Service");
    await checkStats([3, 3, 0, 0]);
    await page.getByLabel("Service date", { exact: true }).fill("2026-10-18");
    await checkStats([3, 1, 2, 1]);
    await page.getByLabel("Service date", { exact: true }).fill("2026-10-25");
    await row("Ruth Nansubuga").getByRole("button", { name: "Clear attendance for Ruth Nansubuga" }).click();
    await checkStats([2, 2, 0, 0]);
    await row("Ruth Nansubuga").getByRole("button", { name: "Absent", exact: true }).click();
    await checkStats([2, 2, 0, 1]);
    await page.getByRole("checkbox", { name: "Expect Ruth Nansubuga", exact: true }).uncheck();
    await checkStats([2, 2, 0, 0]);
    await page.getByRole("checkbox", { name: "Expect Ruth Nansubuga", exact: true }).check();
    await present("Ruth Nansubuga");
    await page.getByRole("checkbox", { name: "Select Lydia Nakato", exact: true }).check();
    await page.getByRole("checkbox", { name: "Select Brenda Namusoke", exact: true }).check();
    await page.getByRole("button", { name: "Mark selected present", exact: true }).click();
    await checkStats([5, 3, 2, 0]);
    await row("Lydia Nakato").getByRole("link", { name: "Lydia Nakato", exact: true }).click();
    await page.getByText("3 recorded visits", { exact: false }).waitFor();
    assert.ok(await page.getByRole("row").filter({ hasText: /2026-10-25.*Central Campus.*Sunday Main Service.*Present/ }).count());
    await page.getByRole("link", { name: "Attendance", exact: true }).click();
    await checkStats([5, 3, 2, 0]);

    await addPerson("visitor", "Alice", "Attendance", "0777 900 123");
    assert.ok(await row("Alice Attendance").getByRole("cell", { name: "Not Recorded", exact: true }).count());
    await present("Alice Attendance"); await checkStats([6, 3, 3, 0]);
    await addPerson("member", "Noah", "Attendance", "0777 900 124");
    await register().getByRole("textbox", { name: "Search table" }).fill("Noah Attendance");
    await present("Noah Attendance"); await checkStats([7, 4, 3, 0]);
    await addPerson("visitor", "Alice", "Attendance", "+256 777 900 123");
    await checkStats([7, 4, 3, 0]);
    await addPerson("visitor", "Noah", "Attendance", "+256 777 900 124");
    await checkStats([7, 4, 3, 0]);
    await register().getByRole("textbox", { name: "Search table" }).fill("Noah Attendance");
    await row("Noah Attendance").getByRole("link", { name: "Noah Attendance", exact: true }).click();
    await page.locator("h1").filter({ hasText: "Member profile" }).waitFor();
    assert.ok(await page.getByRole("row").filter({ hasText: /2026-10-25.*Central Campus.*Sunday Main Service.*Present/ }).count());
    await page.getByRole("link", { name: "Attendance", exact: true }).click();

    await page.getByRole("button", { name: "New service register", exact: true }).click();
    await page.getByRole("dialog").getByRole("combobox", { name: /^Service/ }).click();
    await page.getByRole("option", { name: "Youth Worship Night", exact: true }).click();
    await page.getByRole("dialog").getByLabel("Service date").fill("2026-10-30");
    await page.getByRole("button", { name: "Create or open register", exact: true }).click();
    await checkStats([0, 0, 0, 0]);
    await register().getByRole("textbox", { name: "Search table" }).fill("Noah Attendance");
    assert.equal(await row("Noah Attendance").getByRole("button", { name: "Absent", exact: true }).count(), 0);
    await page.getByRole("checkbox", { name: "Expect Noah Attendance", exact: true }).check();
    await row("Noah Attendance").getByRole("button", { name: "Absent", exact: true }).click();
    await checkStats([0, 0, 0, 1]);
    await page.getByRole("button", { name: "New service register", exact: true }).click();
    await page.getByRole("button", { name: "Create or open register", exact: true }).click();
    await checkStats([0, 0, 0, 1]);
    await page.locator("#attendance-history").getByRole("row").filter({ hasText: /Sunday Main Service.*2026-10-25/ }).getByRole("button", { name: "Open register", exact: true }).click();
    await checkStats([7, 4, 3, 0]);
    assert.equal(await page.locator("canvas").count(), 2);
    for (const route of ["/attendance", "/dashboard", "/members", "/members/member-001", "/visitors", "/visitors/visitor-001", "/communications", "/follow-ups"]) {
      await page.goto(`http://localhost:3100${route}`);
      await page.locator("h1").first().waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((mode) => document.documentElement.classList.toggle("dark", mode === "dark"), theme);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} fits mobile in ${theme} mode`);
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log("PASS: independent branch/service/date registers; expected-only absence; bulk marking; member/visitor registration and duplicate prevention; linked profiles; repeat visits; history; charts; responsive light/dark pages; no runtime errors.");
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });

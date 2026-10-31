import test from "node:test";
import assert from "node:assert/strict";
import { sendEmailCampaignBody } from "../src/modules/communications/communication.validation.js";

test("accepts a valid immediate email campaign", () => {
  const result = sendEmailCampaignBody.safeParse({
    title: "Sunday reminder",
    subject: "Join us this Sunday",
    body: "Hello {{name}}",
    association: "service:Sunday Main Service",
    recipients: [{ personType: "member", personId: "12" }],
  });

  assert.equal(result.success, true);
  assert.equal(result.data.recipients[0].personId, 12);
});

test("rejects unsupported recipients and empty messages", () => {
  const result = sendEmailCampaignBody.safeParse({
    title: "",
    subject: "",
    body: "",
    recipients: [{ personType: "staff", personId: 1 }],
  });

  assert.equal(result.success, false);
});

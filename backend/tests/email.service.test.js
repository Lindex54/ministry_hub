import test from "node:test";
import assert from "node:assert/strict";
import { createEmailService } from "../src/services/email.service.js";

test("sends an email using configured sender defaults", async () => {
  const deliveries = [];
  const service = createEmailService({
    transport: {
      async sendMail(message) {
        deliveries.push(message);
        return { messageId: "test-message" };
      },
    },
    from: { name: "Ministry Hub", address: "church@example.com" },
    replyTo: "office@example.com",
  });

  const result = await service.send({
    to: "member@example.com",
    subject: "  Service reminder  ",
    text: "Sunday service starts at 9:00 AM.",
  });

  assert.equal(result.messageId, "test-message");
  assert.deepEqual(deliveries, [{
    from: { name: "Ministry Hub", address: "church@example.com" },
    to: "member@example.com",
    cc: undefined,
    bcc: undefined,
    replyTo: "office@example.com",
    subject: "Service reminder",
    text: "Sunday service starts at 9:00 AM.",
    html: undefined,
    attachments: undefined,
  }]);
});

test("requires a recipient, subject, and message body", async () => {
  const service = createEmailService({
    transport: { sendMail: async () => ({}) },
    from: "church@example.com",
  });

  await assert.rejects(() => service.send({ subject: "Hello", text: "Body" }), /recipient/);
  await assert.rejects(() => service.send({ to: "member@example.com", text: "Body" }), /subject/);
  await assert.rejects(() => service.send({ to: "member@example.com", subject: "Hello" }), /content/);
});

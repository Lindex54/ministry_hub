import test from "node:test";
import assert from "node:assert/strict";
import { kampalaDateTime, personalizeMessage, resolveRecipients } from "./outreach-utils.mjs";

const person = (key, changes = {}) => ({ key, name: key, type: "Member", branch: "Central", ministries: ["Choir"], services: ["Sunday"], phone: "0772 123 456", email: "person@example.org", consent: true, preferences: { sms: true, email: true }, ...changes });
const selection = (changes = {}) => ({ types: [], branches: [], ministries: [], services: [], events: [], individuals: [], ...changes });

test("overlapping groups and individual selections include a person once", () => {
  const result = resolveRecipients([person("a")], selection({ types: ["Member"], branches: ["Central"], ministries: ["Choir"], individuals: ["a"] }), "sms", []);
  assert.equal(result.eligible.length, 1);
});

test("local and international phone formats deduplicate to one destination", () => {
  const result = resolveRecipients([person("a"), person("b", { phone: "+256 772 123 456" })], selection({ types: ["Member"] }), "sms", []);
  assert.equal(result.eligible.length, 1);
  assert.equal(result.excluded[0].exclusionReason, "Duplicate contact destination");
});

test("consent, preference, and contact eligibility are independently enforced", () => {
  const people = [person("a", { consent: false }), person("b", { preferences: { sms: false, email: true } }), person("c", { phone: "invalid" }), person("d", { phone: "0701 222 333" })];
  const result = resolveRecipients(people, selection({ types: ["Member"] }), "sms", []);
  assert.deepEqual(result.eligible.map((item) => item.key), ["d"]);
  assert.equal(result.excluded.length, 3);
});

test("email destinations are case insensitive and missing emails excluded", () => {
  const result = resolveRecipients([person("a"), person("b", { email: "PERSON@EXAMPLE.ORG" }), person("c", { email: "" })], selection({ types: ["Member"] }), "email", []);
  assert.equal(result.eligible.length, 1);
  assert.equal(result.excluded.length, 2);
});

test("service and event audiences union their recorded participants", () => {
  const result = resolveRecipients([person("a"), person("b", { services: [], phone: "0701 222 333" })], selection({ services: ["Sunday"], events: ["youth"] }), "sms", [{ id: "youth", people: ["b"] }]);
  assert.deepEqual(result.eligible.map((item) => item.key), ["a", "b"]);
});

test("empty selection produces no recipients", () => {
  assert.equal(resolveRecipients([person("a")], selection(), "sms", []).eligible.length, 0);
});

test("schedule parsing uses Kampala time and personalized greetings", () => {
  assert.equal(kampalaDateTime("2026-10-28T10:00"), Date.parse("2026-10-28T07:00:00Z"));
  assert.equal(personalizeMessage("Hello {{name}}", { name: "Sarah" }), "Hello Sarah");
});

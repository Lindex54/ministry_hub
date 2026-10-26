export function normalizePhone(value = "") {
  return value.replace(/[\s()-]/g, "").replace(/^0/, "+256");
}

export function recipientEligibility(person, channel) {
  if (!person.consent) return "No communication consent";
  if (!person.preferences?.[channel]) return `${channel === "sms" ? "SMS" : "Email"} preference disabled`;
  if (channel === "sms" && !/^\+256[237]\d{8}$/.test(normalizePhone(person.phone))) return "Missing or invalid phone";
  if (channel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email ?? "")) return "Missing or invalid email";
  return null;
}

export function resolveRecipients(people, selection, channel, events) {
  const selected = people.filter((person) => (
    selection.individuals.includes(person.key)
    || selection.types.includes(person.type)
    || selection.branches.includes(person.branch)
    || person.ministries.some((ministry) => selection.ministries.includes(ministry))
    || person.services.some((service) => selection.services.includes(service))
    || events.some((event) => selection.events.includes(event.id) && event.people.includes(person.key))
  ));
  const seen = new Set();
  const eligible = [];
  const excluded = [];
  for (const person of selected) {
    const reason = recipientEligibility(person, channel);
    if (reason) { excluded.push({ ...person, exclusionReason: reason }); continue; }
    const destination = channel === "sms" ? normalizePhone(person.phone) : person.email.trim().toLowerCase();
    if (seen.has(destination)) { excluded.push({ ...person, exclusionReason: "Duplicate contact destination" }); continue; }
    seen.add(destination);
    eligible.push(person);
  }
  return { selected, eligible, excluded };
}

export function personalizeMessage(body, person) {
  return body.replaceAll("{{name}}", person?.name ?? "friend");
}

export function kampalaDateTime(value) {
  return Date.parse(`${value}:00+03:00`);
}

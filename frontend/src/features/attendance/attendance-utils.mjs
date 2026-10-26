export const occurrenceKey = (branch, service, date) => `${branch}|${service}|${date}`;

export function recordAttendance(occurrence, people, status) {
  const records = { ...occurrence.records };
  for (const person of people) {
    const category = records[person.key]?.category ?? person.category;
    if (status === "Absent" && (category !== "Member" || !occurrence.expected.includes(person.key))) continue;
    records[person.key] = { status, category };
  }
  return { ...occurrence, records };
}

export function attendanceTotals(occurrence) {
  const records = Object.entries(occurrence?.records ?? {});
  const members = records.filter(([, record]) => record.status === "Present" && record.category === "Member").length;
  const visitors = records.filter(([, record]) => record.status === "Present" && record.category === "Visitor").length;
  const absent = records.filter(([key, record]) => record.status === "Absent" && record.category === "Member" && occurrence.expected.includes(key)).length;
  return { members, visitors, absent, total: members + visitors };
}

export function setExpectedPerson(occurrence, key, expected) {
  return {
    ...occurrence,
    expected: expected ? [...new Set([...occurrence.expected, key])] : occurrence.expected.filter((item) => item !== key),
    records: !expected && occurrence.records[key]?.status === "Absent" ? { ...occurrence.records, [key]: { ...occurrence.records[key], status: "Not Recorded" } } : occurrence.records,
  };
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useMembers } from "@/features/members/MembersProvider";
import { useVisitors } from "@/features/visitors/VisitorsProvider";
import { attendanceTotals, occurrenceKey, recordAttendance, setExpectedPerson } from "./attendance-utils.mjs";
import { createMockOccurrences, getBranchServices, visitorBranches } from "./data/attendance.mock";

const AttendanceContext = createContext(null);

export function AttendanceProvider({ children }) {
  const { members } = useMembers(); const { visitors } = useVisitors();
  const [storedOccurrences, setOccurrences] = useState(createMockOccurrences);
  const [scope, setScope] = useState({ branch: "Central Campus", service: "Sunday Main Service", date: "2026-10-25" });
  const [registrationOccurrenceId, setRegistrationOccurrenceId] = useState(null);
  const pathname = usePathname();
  useEffect(() => {
    if (!["/attendance", "/members/new", "/visitors/new"].includes(pathname)) setRegistrationOccurrenceId(null);
  }, [pathname]);
  const people = [
    ...members.map((member) => ({ key: member.sourceVisitorId ? `visitor:${member.sourceVisitorId}` : `member:${member.id}`, id: member.id, name: `${member.firstName} ${member.lastName}`, category: "Member", phone: member.primaryPhone, membershipNumber: member.membershipNumber, branch: member.branch, href: `/members/${member.id}` })),
    ...visitors.filter((visitor) => !visitor.convertedMemberId).map((visitor) => ({ key: `visitor:${visitor.id}`, id: visitor.id, name: `${visitor.firstName} ${visitor.lastName}`, category: "Visitor", phone: visitor.phone, membershipNumber: "", branch: visitor.branch ?? visitorBranches[visitor.id] ?? "", href: `/visitors/${visitor.id}` })),
  ];
  const canonicalKey = (key) => {
    const member = members.find((item) => `member:${item.id}` === key);
    return member?.sourceVisitorId ? `visitor:${member.sourceVisitorId}` : key;
  };

  // Newly registered visitors and manually recorded visitor visits share the same registers.
  // Explicit register edits override the original visit evidence, including Not Recorded.
  const occurrences = storedOccurrences.map((item) => ({ ...item, records: { ...item.records } }));
  for (const visitor of visitors) {
    for (const visit of visitor.visitHistory) {
      const branch = visit.branch ?? visitor.branch ?? visitorBranches[visitor.id];
      if (!branch || !getBranchServices(branch).includes(visit.service)) continue;
      const id = occurrenceKey(branch, visit.service, visit.date);
      let occurrence = occurrences.find((item) => item.id === id);
      if (!occurrence) { occurrence = { id, branch, service: visit.service, date: visit.date, expected: [], records: {}, roster: [] }; occurrences.push(occurrence); }
      const key = `visitor:${visitor.id}`;
      if (!Object.hasOwn(occurrence.records, key)) occurrence.records[key] = { status: "Present", category: "Visitor" };
    }
  }
  const selectedOccurrence = occurrences.find((item) => item.id === occurrenceKey(scope.branch, scope.service, scope.date));

  function mutateOccurrence(id, mutation) {
    const original = occurrences.find((item) => item.id === id);
    if (!original) return;
    setOccurrences((current) => {
      const existing = current.find((item) => item.id === id);
      const updated = mutation(existing ?? original);
      return existing ? current.map((item) => item.id === id ? updated : item) : [...current, updated];
    });
  }
  function getPersonAttendance(key) {
    const canonical = canonicalKey(key);
    return occurrences.filter((item) => Object.hasOwn(item.records, canonical) || item.expected.includes(canonical)).map((item) => ({ ...item, status: item.records[canonical]?.status ?? "Not Recorded", category: item.records[canonical]?.category ?? "Member" })).sort((a, b) => b.date.localeCompare(a.date));
  }
  function getVisitorWithAttendance(visitor) {
    const rows = getPersonAttendance(`visitor:${visitor.id}`);
    const seenVisits = new Set();
    const visits = visitor.visitHistory.filter((visit) => {
      const branch = visit.branch ?? visitor.branch ?? visitorBranches[visitor.id];
      const visitKey = occurrenceKey(branch, visit.service, visit.date);
      if (seenVisits.has(visitKey)) return false;
      seenVisits.add(visitKey);
      const row = rows.find((item) => item.branch === branch && item.date === visit.date && item.service === visit.service);
      return !row || row.status === "Present";
    });
    for (const row of rows.filter((item) => item.status === "Present")) {
      if (!visits.some((visit) => visit.date === row.date && visit.service === row.service && (visit.branch ?? visitor.branch ?? visitorBranches[visitor.id]) === row.branch)) visits.push({ id: `attendance-${row.id}`, date: row.date, service: row.service, branch: row.branch, notes: "Recorded in the attendance register." });
    }
    return { ...visitor, branch: visitor.branch ?? visitorBranches[visitor.id] ?? "", visitHistory: visits };
  }

  const value = {
    people, occurrences, scope, setScope, selectedOccurrence, getBranchServices, getPersonAttendance, getVisitorWithAttendance,
    selectOccurrence: (occurrence) => setScope({ branch: occurrence.branch, service: occurrence.service, date: occurrence.date }),
    changeBranch: (branch) => {
      const services = getBranchServices(branch);
      const service = services.includes(scope.service) ? scope.service : services[0];
      const matchingDate = occurrences.some((item) => item.branch === branch && item.service === service && item.date === scope.date);
      const date = matchingDate ? scope.date : occurrences.filter((item) => item.branch === branch && item.service === service).sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? scope.date;
      setScope({ branch, service, date });
    },
    createOccurrence: (values) => {
      const id = occurrenceKey(values.branch, values.service, values.date);
      const existing = occurrences.find((item) => item.id === id);
      if (!existing) setOccurrences((current) => current.some((item) => item.id === id) ? current : [...current, { ...values, id, records: {}, roster: [] }]);
      setScope({ branch: values.branch, service: values.service, date: values.date });
      return { id, existing: Boolean(existing) };
    },
    markAttendance: (id, keys, status) => mutateOccurrence(id, (item) => recordAttendance(item, people.filter((person) => keys.map(canonicalKey).includes(person.key)), status)),
    setExpected: (id, key, expected) => mutateOccurrence(id, (item) => setExpectedPerson(item, canonicalKey(key), expected)),
    totals: attendanceTotals,
    registrationOccurrence: occurrences.find((item) => item.id === registrationOccurrenceId),
    startRegistration: setRegistrationOccurrenceId,
    cancelRegistration: () => setRegistrationOccurrenceId(null),
    completeRegistration: (key, category) => {
      const occurrenceId = registrationOccurrenceId;
      mutateOccurrence(occurrenceId, (item) => ({ ...item, roster: [...new Set([...item.roster, key])], records: { ...item.records, [key]: item.records[key]?.status === "Present" || item.records[key]?.status === "Absent" ? item.records[key] : { status: "Not Recorded", category: category ?? (key.startsWith("visitor:") ? "Visitor" : "Member") } } }));
      const occurrence = occurrences.find((item) => item.id === occurrenceId);
      if (occurrence) setScope({ branch: occurrence.branch, service: occurrence.service, date: occurrence.date });
      setRegistrationOccurrenceId(null);
    },
  };
  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) throw new Error("useAttendance requires AttendanceProvider");
  return context;
}

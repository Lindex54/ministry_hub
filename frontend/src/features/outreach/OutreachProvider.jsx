"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { useMembers } from "@/features/members/MembersProvider";
import { useVisitors } from "@/features/visitors/VisitorsProvider";
import { mockVisitors } from "@/features/visitors/data/visitors.mock";
import { evangelismContacts, memberPreferences, templates, workers } from "./data/outreach.mock";
import { useAttendance } from "@/features/attendance/AttendanceProvider";

const OutreachContext = createContext(null);

function initialTasks() {
  const visitorTasks = mockVisitors.flatMap((visitor) => visitor.followUps
    .filter((followUp) => followUp.contactMethod === "Phone call")
    .map((followUp) => ({
      id: followUp.id, personKey: `visitor:${visitor.id}`, workerId: workers.find((worker) => worker.name === followUp.assignedTo)?.id ?? workers[0].id,
      method: "Phone Call", scheduledDate: followUp.date, priority: "Normal", reason: "Visitor welcome", status: followUp.status,
      history: [{ id: `${followUp.id}-initial`, date: `${followUp.date}T10:00:00+03:00`, workerId: workers.find((worker) => worker.name === followUp.assignedTo)?.id ?? workers[0].id, status: followUp.status, reached: followUp.status === "Completed" ? "Yes" : "Not recorded", outcome: followUp.outcome || "Assignment created", notes: "", anotherFollowUp: false }],
    })));
  return [...visitorTasks,
    { id: "task-member-1", personKey: "member:member-004", workerId: workers[0].id, method: "Physical Visit", scheduledDate: "2026-10-28", priority: "High", reason: "Pastoral care visit", status: "Pending", history: [] },
    { id: "task-evangelism-1", personKey: "evangelism:contact-001", workerId: workers[1].id, method: "Phone Call", scheduledDate: "2026-10-29", priority: "Normal", reason: "Outreach introduction", status: "Pending", history: [] },
  ];
}

export function OutreachProvider({ children }) {
  const { members } = useMembers();
  const { visitors: sourceVisitors } = useVisitors();
  const { getVisitorWithAttendance, getPersonAttendance } = useAttendance();
  const visitors = sourceVisitors.map(getVisitorWithAttendance);
  const [tasks, setTasks] = useState(initialTasks);
  const [campaigns, setCampaigns] = useState([]);
  const [savedTemplates, setSavedTemplates] = useState(templates);
  const people = useMemo(() => [
    ...members.map((member) => {
      const sourceVisitor = visitors.find((visitor) => visitor.convertedMemberId === member.id);
      const prefs = sourceVisitor ? { consent: sourceVisitor.permissionToContact, sms: true, email: true } : memberPreferences[member.id];
      return { key: `member:${member.id}`, id: member.id, type: "Member", name: `${member.firstName} ${member.lastName}`, phone: member.primaryPhone, email: member.email, address: member.address, branch: member.branch, ministries: member.ministries, services: [...new Set(getPersonAttendance(`member:${member.id}`).filter((item) => item.status === "Present").map((item) => item.service))], consent: prefs?.consent ?? false, preferences: { sms: prefs?.sms ?? false, email: prefs?.email ?? false }, href: `/members/${member.id}` };
    }),
    ...visitors.filter((visitor) => !visitor.convertedMemberId).map((visitor) => ({ key: `visitor:${visitor.id}`, id: visitor.id, type: "Visitor", name: `${visitor.firstName} ${visitor.lastName}`, phone: visitor.phone, email: visitor.email, address: visitor.districtAddress, branch: visitor.branch ?? "", ministries: [], services: [...new Set(visitor.visitHistory.map((visit) => visit.service))], consent: visitor.permissionToContact, preferences: { sms: visitor.communicationPreferences?.sms ?? true, email: visitor.communicationPreferences?.email ?? true }, href: `/visitors/${visitor.id}` })),
    ...evangelismContacts.map((contact) => ({ ...contact, key: `evangelism:${contact.id}`, type: "Evangelism contact", name: `${contact.firstName} ${contact.lastName}`, ministries: [], services: [], preferences: { sms: false, email: false }, href: `/follow-ups/contacts/${contact.id}` })),
  ], [members, visitors]);

  function getPerson(key) {
    const direct = people.find((person) => person.key === key);
    if (direct) return direct;
    const converted = visitors.find((visitor) => `visitor:${visitor.id}` === key && visitor.convertedMemberId);
    return converted ? people.find((person) => person.key === `member:${converted.convertedMemberId}`) : undefined;
  }

  const value = {
    people, tasks, campaigns, getPerson, templates: savedTemplates,
    addTemplate: (template) => setSavedTemplates((current) => [...current, { ...template, id: crypto.randomUUID() }]),
    getPersonTasks: (key) => tasks.filter((task) => task.personKey === key || getPerson(task.personKey)?.key === getPerson(key)?.key),
    addTask: (values) => {
      const task = { ...values, id: crypto.randomUUID(), history: [{ id: crypto.randomUUID(), date: new Date().toISOString(), workerId: values.workerId, status: "Pending", reached: "Not recorded", outcome: "Assignment created", notes: "", anotherFollowUp: false }] };
      setTasks((current) => [task, ...current]);
      return task;
    },
    submitFeedback: (id, feedback) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status: feedback.status, history: [...task.history, { ...feedback, id: crypto.randomUUID(), workerId: task.workerId, date: new Date().toISOString() }] } : task)),
    addCampaign: (campaign) => setCampaigns((current) => [{ ...campaign, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...current]),
    updateCampaign: (id, changes) => setCampaigns((current) => current.map((campaign) => campaign.id === id ? { ...campaign, ...changes } : campaign)),
  };
  return <OutreachContext.Provider value={value}>{children}</OutreachContext.Provider>;
}

export function useOutreach() {
  const context = useContext(OutreachContext);
  if (!context) throw new Error("useOutreach requires OutreachProvider");
  return context;
}

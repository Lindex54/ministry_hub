"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { mockVisitors } from "./data/visitors.mock";

const VisitorsContext = createContext(null);

export function VisitorsProvider({ children }) {
  const [visitors, setVisitors] = useState(mockVisitors);
  const [memberConversionVisitorId, setMemberConversionVisitorId] = useState(null);

  const value = useMemo(() => ({
    visitors,
    getVisitor: (id) => visitors.find((visitor) => visitor.id === id),
    addVisitor: (visitor) => {
      const visitId = `visit-${crypto.randomUUID()}`;
      const normalizedPhone = visitor.phone.replace(/[\s()-]/g, "").replace(/^0/, "+256");
      const existing = visitors.find((item) => item.phone.replace(/[\s()-]/g, "").replace(/^0/, "+256") === normalizedPhone);
      if (existing) {
        const updated = {
          ...existing,
          firstName: visitor.firstName || existing.firstName,
          lastName: visitor.lastName || existing.lastName,
          email: visitor.email || existing.email,
          gender: visitor.gender || existing.gender,
          districtAddress: visitor.districtAddress || existing.districtAddress,
          invitedBy: visitor.invitedBy || existing.invitedBy,
          prayerRequest: visitor.prayerRequest || existing.prayerRequest,
          permissionToContact: existing.permissionToContact || visitor.permissionToContact,
          visitHistory: [...existing.visitHistory, { id: visitId, date: visitor.dateOfVisit, service: visitor.serviceAttended, notes: "Returning visit recorded during registration." }],
        };
        setVisitors((current) => current.map((item) => item.id === existing.id ? updated : item));
        return { visitor: updated, isReturning: true };
      }
      const id = `visitor-${crypto.randomUUID()}`;
      const next = {
        ...visitor,
        id,
        visitHistory: [{ id: visitId, date: visitor.dateOfVisit, service: visitor.serviceAttended, notes: "Initial visitor registration." }],
        followUps: [],
      };
      delete next.dateOfVisit;
      delete next.serviceAttended;
      setVisitors((current) => [next, ...current]);
      return { visitor: next, isReturning: false };
    },
    updateVisitor: (id, changes) => setVisitors((current) => current.map((visitor) => visitor.id === id ? { ...visitor, ...changes } : visitor)),
    addVisit: (id, visit) => setVisitors((current) => current.map((visitor) => visitor.id === id ? { ...visitor, visitHistory: [...visitor.visitHistory, { ...visit, id: `visit-${crypto.randomUUID()}` }] } : visitor)),
    addFollowUp: (id, followUp) => setVisitors((current) => current.map((visitor) => visitor.id === id ? { ...visitor, followUps: [...visitor.followUps, { ...followUp, id: `follow-${crypto.randomUUID()}` }] } : visitor)),
    updateFollowUp: (visitorId, followUpId, changes) => setVisitors((current) => current.map((visitor) => visitor.id === visitorId ? { ...visitor, followUps: visitor.followUps.map((item) => item.id === followUpId ? { ...item, ...changes } : item) } : visitor)),
    memberConversionVisitorId,
    startMemberConversion: setMemberConversionVisitorId,
    finishMemberConversion: (visitorId, memberId) => {
      setVisitors((current) => current.map((visitor) => visitor.id === visitorId ? { ...visitor, convertedMemberId: memberId } : visitor));
      setMemberConversionVisitorId(null);
    },
    cancelMemberConversion: () => setMemberConversionVisitorId(null),
  }), [memberConversionVisitorId, visitors]);

  return <VisitorsContext.Provider value={value}>{children}</VisitorsContext.Provider>;
}

export function useVisitors() {
  const context = useContext(VisitorsContext);
  if (!context) throw new Error("useVisitors must be used within VisitorsProvider.");
  return context;
}

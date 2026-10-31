"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const VisitorsContext = createContext(null);

export function VisitorsProvider({ children }) {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberConversionVisitorId, setMemberConversionVisitorId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api("/visitors")
      .then((data) => { if (!cancelled) setVisitors(data); })
      .catch((requestError) => { if (!cancelled) setError(requestError); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({
    visitors,
    loading,
    error,
    getVisitor: (id) => visitors.find((visitor) => visitor.id === String(id)),
    addVisitor: async (values) => {
      const result = await api.post("/visitors", values);
      setVisitors((current) => {
        const exists = current.some((visitor) => visitor.id === result.visitor.id);
        return exists
          ? current.map((visitor) => (visitor.id === result.visitor.id ? result.visitor : visitor))
          : [result.visitor, ...current];
      });
      return result;
    },
    updateVisitor: async (id, changes) => {
      const updated = await api.patch(`/visitors/${id}`, changes);
      setVisitors((current) => current.map((visitor) => (visitor.id === String(id) ? updated : visitor)));
      return updated;
    },
    addVisit: async (id, visit) => {
      const updated = await api.post(`/visitors/${id}/visits`, visit);
      setVisitors((current) => current.map((visitor) => (visitor.id === String(id) ? updated : visitor)));
      return updated;
    },
    memberConversionVisitorId,
    startMemberConversion: setMemberConversionVisitorId,
    finishMemberConversion: async (visitorId, memberId) => {
      const updated = await api.patch(`/visitors/${visitorId}`, { convertedMemberId: memberId });
      setVisitors((current) => current.map((visitor) => (visitor.id === String(visitorId) ? updated : visitor)));
      setMemberConversionVisitorId(null);
    },
    cancelMemberConversion: () => setMemberConversionVisitorId(null),
  }), [visitors, loading, error, memberConversionVisitorId]);

  return <VisitorsContext.Provider value={value}>{children}</VisitorsContext.Provider>;
}

export function useVisitors() {
  const context = useContext(VisitorsContext);
  if (!context) throw new Error("useVisitors must be used within VisitorsProvider.");
  return context;
}

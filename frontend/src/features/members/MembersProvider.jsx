"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api("/members")
      .then((data) => { if (!cancelled) setMembers(data); })
      .catch((requestError) => { if (!cancelled) setError(requestError); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => ({
    members,
    loading,
    error,
    getMember: (id) => members.find((member) => member.id === String(id)),
    addMember: async (values) => {
      const created = await api.post("/members", values);
      setMembers((current) => [created, ...current]);
      return created;
    },
    updateMember: async (id, changes) => {
      const updated = await api.patch(`/members/${id}`, changes);
      setMembers((current) => current.map((member) => (member.id === String(id) ? updated : member)));
      return updated;
    },
  }), [members, loading, error]);

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (!context) throw new Error("useMembers must be used within MembersProvider.");
  return context;
}

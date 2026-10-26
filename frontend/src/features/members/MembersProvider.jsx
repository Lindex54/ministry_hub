"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { mockMembers } from "./data/members.mock";

const MembersContext = createContext(null);

export function MembersProvider({ children }) {
  const [members, setMembers] = useState(mockMembers);

  const value = useMemo(() => ({
    members,
    getMember: (id) => members.find((member) => member.id === id),
    getNextMembershipNumber: () => {
      const nextNumber = members.reduce((highest, member) => {
        const number = Number(member.membershipNumber.split("-").at(-1));
        return Number.isFinite(number) ? Math.max(highest, number) : highest;
      }, 0) + 1;
      return `MH-2026-${String(nextNumber).padStart(4, "0")}`;
    },
    addMember: (member) => {
      const id = `member-${crypto.randomUUID()}`;
      const next = { ...member, id };
      setMembers((current) => [next, ...current]);
      return next;
    },
    updateMember: (id, changes) => {
      setMembers((current) => current.map((member) => (
        member.id === id ? { ...member, ...changes } : member
      )));
    },
  }), [members]);

  return <MembersContext.Provider value={value}>{children}</MembersContext.Provider>;
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (!context) throw new Error("useMembers must be used within MembersProvider.");
  return context;
}

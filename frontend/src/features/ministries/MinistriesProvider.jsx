"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { mockBranches } from "@/features/branches/data/branches.mock";
import { mockMinistries } from "./data/ministries.mock";

const MinistriesContext = createContext(null);

export function MinistriesProvider({ children }) {
  const [ministries, setMinistries] = useState(mockMinistries);
  const [branches, setBranches] = useState(mockBranches);

  const value = useMemo(() => ({
    ministries,
    branches,
    activeMinistries: ministries.filter((ministry) => ministry.status === "Active"),
    activeBranches: branches.filter((branch) => branch.status === "Active"),
    ministryNames: ["None", ...ministries.filter((ministry) => ministry.status === "Active").map((ministry) => ministry.name)],
    allMinistryNames: ministries.map((ministry) => ministry.name),
    branchNames: branches.filter((branch) => branch.status === "Active").map((branch) => branch.name),
    allBranchNames: branches.map((branch) => branch.name),
    getMinistry: (id) => ministries.find((ministry) => ministry.id === id),
    getMinistryByName: (name) => ministries.find((ministry) => ministry.name === name),
    getBranch: (id) => branches.find((branch) => branch.id === id),
    getBranchByName: (name) => branches.find((branch) => branch.name === name),
    ministriesForBranch: (branchId) => ministries.filter((ministry) => ministry.branchIds.includes(branchId)),
    branchesForMinistry: (ministryId) => branches.filter((branch) => ministries.find((item) => item.id === ministryId)?.branchIds.includes(branch.id)),
    addMinistry: (ministry) => {
      const next = { ...ministry, id: `ministry-${crypto.randomUUID()}` };
      setMinistries((current) => [next, ...current]);
      return next;
    },
    updateMinistry: (id, changes) => setMinistries((current) => current.map((ministry) => ministry.id === id ? { ...ministry, ...changes } : ministry)),
    addBranch: (branch) => {
      const next = { ...branch, id: `branch-${crypto.randomUUID()}` };
      setBranches((current) => [next, ...current]);
      return next;
    },
    updateBranch: (id, changes) => setBranches((current) => current.map((branch) => branch.id === id ? { ...branch, ...changes } : branch)),
    setBranchMinistries: (branchId, ministryIds) => setMinistries((current) => current.map((ministry) => {
      const shouldInclude = ministryIds.includes(ministry.id);
      const alreadyIncluded = ministry.branchIds.includes(branchId);
      if (shouldInclude === alreadyIncluded) return ministry;
      return { ...ministry, branchIds: shouldInclude ? [...ministry.branchIds, branchId] : ministry.branchIds.filter((id) => id !== branchId) };
    })),
  }), [ministries, branches]);

  return <MinistriesContext.Provider value={value}>{children}</MinistriesContext.Provider>;
}

export function useMinistries() {
  const context = useContext(MinistriesContext);
  if (!context) throw new Error("useMinistries must be used within MinistriesProvider.");
  return context;
}

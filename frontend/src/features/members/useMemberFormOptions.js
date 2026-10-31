"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Members are wired to the real backend, but Ministries/Branches aren't yet —
// so this fetches real branch/ministry names directly rather than going through
// MinistriesProvider (which still serves mock data to the still-mock
// Ministries/Branches pages). Once that module is wired, this can be removed
// in favor of useMinistries().
export function useMemberFormOptions() {
  const [branchNames, setBranchNames] = useState([]);
  const [ministryNames, setMinistryNames] = useState(["None"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api("/branches"), api("/ministries")])
      .then(([branches, ministries]) => {
        if (cancelled) return;
        setBranchNames(branches.filter((branch) => branch.status === "Active").map((branch) => branch.name));
        setMinistryNames(["None", ...ministries.filter((ministry) => ministry.status === "Active").map((ministry) => ministry.name)]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { branchNames, ministryNames, loading };
}

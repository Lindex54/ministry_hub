"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// Follow-ups is wired to the real backend, but there's no Staff/Users module
// yet — so this fetches real staff directly from /api/staff instead of the
// static `workers` mock export, which other still-mock modules
// (evangelism.mock.js, ministries/leader-utils.js, CampaignComposer.jsx,
// CommunicationsPage.jsx) still depend on and must keep using.
export function useFollowUpStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api("/staff")
      .then((rows) => { if (!cancelled) setStaff(rows.filter((row) => row.status === "Active")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { staff, loading };
}

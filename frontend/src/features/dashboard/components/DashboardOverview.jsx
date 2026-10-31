"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { AttendanceTrends } from "./AttendanceTrends";
import { DashboardStats } from "./DashboardStats";
import { FollowUpOverview } from "./FollowUpOverview";
import { MembershipGrowth } from "./MembershipGrowth";
import { QuickActions } from "./QuickActions";
import { RecentAttendance } from "./RecentAttendance";
import { UpcomingEvents } from "./UpcomingEvents";
import { ServiceAttendance } from "./ServiceAttendance";

function getDefaultDashboardRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 86400000);
  return { from, to };
}

function toDateParam(date) {
  return date.toISOString().slice(0, 10);
}

export function DashboardOverview() {
  const [dateRange, setDateRange] = useState(getDefaultDashboardRange);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return undefined;
    let cancelled = false;
    setError(null);
    const params = new URLSearchParams({ from: toDateParam(dateRange.from), to: toDateParam(dateRange.to) });

    api(`/dashboard?${params.toString()}`)
      .then((data) => { if (!cancelled) setDashboard(data); })
      .catch((requestError) => { if (!cancelled) setError(requestError); });

    return () => { cancelled = true; };
  }, [dateRange]);

  return (
    <div className="material-dashboard mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Your church, at a glance"
        description="Welcome back. Here’s what’s happening in your community."
        actions={<DateRangePicker value={dateRange} onChange={(range) => range?.from && range?.to && setDateRange(range)} />}
      />

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Could not load live dashboard data from the API. Check that the backend server is running.</span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Live data</Badge>
          <span>Figures are calculated from the Ministry Hub database for the selected period.</span>
        </div>
      )}

      {!dashboard ? (
        <DashboardSkeleton />
      ) : (
        <>
          <FadeIn className="mt-3">
            <DashboardStats stats={dashboard.stats} />
          </FadeIn>

          <div className="mt-5 grid gap-x-5 gap-y-10 lg:grid-cols-3">
            <AttendanceTrends data={dashboard.attendance} />
            <MembershipGrowth data={dashboard.membership} />
            <ServiceAttendance data={[...dashboard.recentAttendance].reverse()} />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-5">
            <RecentAttendance data={dashboard.recentAttendance} />
            <FollowUpOverview data={dashboard.followUps} />
          </div>

          <div className="grid items-start gap-4 xl:grid-cols-5">
            <UpcomingEvents data={dashboard.upcomingEvents} />
            <QuickActions />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[120px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-x-5 gap-y-10 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-[280px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

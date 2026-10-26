"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader } from "@/components/shared/PageHeader";
import { AttendanceTrends } from "./AttendanceTrends";
import { DashboardStats } from "./DashboardStats";
import { FollowUpOverview } from "./FollowUpOverview";
import { MembershipGrowth } from "./MembershipGrowth";
import { QuickActions } from "./QuickActions";
import { RecentAttendance } from "./RecentAttendance";
import { UpcomingEvents } from "./UpcomingEvents";
import { ServiceAttendance } from "./ServiceAttendance";
import { defaultDashboardRange, getDashboardData } from "../data/dashboard.mock";

export function DashboardOverview() {
  const [dateRange, setDateRange] = useState(defaultDashboardRange);
  const dashboard = useMemo(() => getDashboardData(dateRange), [dateRange]);

  return (
    <div className="material-dashboard mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Your church, at a glance"
        description="Welcome back. Here’s what’s happening in your community."
        actions={<DateRangePicker value={dateRange} onChange={(range) => range && setDateRange(range)} />}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Demonstration data</Badge>
        <span>Dashboard values are mock data and are not connected to a live API.</span>
      </div>

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
    </div>
  );
}


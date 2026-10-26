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
import { defaultDashboardRange, getDashboardData } from "../data/dashboard.mock";

export function DashboardOverview() {
  const [dateRange, setDateRange] = useState(defaultDashboardRange);
  const dashboard = useMemo(() => getDashboardData(dateRange), [dateRange]);

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 lg:gap-8">
      <PageHeader
        title="Dashboard Overview"
        description="Monitor your congregation, attendance, outreach, and church activities."
        actions={<DateRangePicker value={dateRange} onChange={(range) => range && setDateRange(range)} />}
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline">Demonstration data</Badge>
        <span>Dashboard values are mock data and are not connected to a live API.</span>
      </div>

      <FadeIn>
        <DashboardStats stats={dashboard.stats} />
      </FadeIn>

      <div className="grid gap-4 xl:grid-cols-3">
        <AttendanceTrends data={dashboard.attendance} />
        <MembershipGrowth data={dashboard.membership} />
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


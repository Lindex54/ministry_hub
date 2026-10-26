import { ClipboardCheck, HandHeart, UserRoundPlus, Users } from "lucide-react";
import { ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";

export function DashboardStats({ stats }) {
  return (
    <ResponsiveGrid>
      <StatCard title="Total Members" value={stats.members.value} detail="Registered active members" change={stats.members.change} icon={Users} />
      <StatCard title="Latest Service Attendance" value={stats.attendance.value} detail="Sunday Main Service · Oct 25" change={stats.attendance.change} icon={ClipboardCheck} />
      <StatCard title="New Visitors" value={stats.visitors.value} detail="First-time visitors in selected period" change={stats.visitors.change} icon={UserRoundPlus} />
      <StatCard title="Pending Follow-ups" value={stats.followUps.value} detail="Tasks awaiting completion" change={stats.followUps.change} trend="down" icon={HandHeart} />
    </ResponsiveGrid>
  );
}


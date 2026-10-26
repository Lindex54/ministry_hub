import { ArrowUpRight, Clock3, ClipboardCheck, HandHeart, UserRoundPlus, Users } from "lucide-react";
import { ResponsiveGrid } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";

function StatCard({ title, value, detail, change, trend, icon: Icon }) {
  const colors = { "Total Members": "bg-[#17243B]", "Latest Service Attendance": "bg-[#147DDB]", "New Visitors": "bg-[#087F9C]", "Pending Follow-ups": "bg-[#7C3AED]" };
  return (
    <Card className="relative gap-4 px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`-mt-10 flex size-14 shrink-0 items-center justify-center rounded-xl text-white shadow-lg shadow-slate-900/15 ${colors[title]}`}><Icon className="size-6" strokeWidth={1.6} /></div>
        <div className="min-w-0 text-right"><p className="text-xs text-muted-foreground">{title}</p><p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">{value}</p></div>
      </div>
      <div className="border-t pt-3">
        <p className={`flex items-center gap-1 text-xs font-semibold ${trend === "down" ? "text-warning" : "text-success"}`}>
          {trend === "down" ? <Clock3 className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}{change}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
      </div>
    </Card>
  );
}

export function DashboardStats({ stats }) {
  return (
    <ResponsiveGrid className="gap-x-5 gap-y-10">
      <StatCard title="Total Members" value={stats.members.value} detail="Registered active members" change={stats.members.change} icon={Users} />
      <StatCard title="Latest Service Attendance" value={stats.attendance.value} detail="Sunday Main Service · Oct 25" change={stats.attendance.change} icon={ClipboardCheck} />
      <StatCard title="New Visitors" value={stats.visitors.value} detail="First-time visitors in selected period" change={stats.visitors.change} icon={UserRoundPlus} />
      <StatCard title="Pending Follow-ups" value={stats.followUps.value} detail="Tasks awaiting completion" change={stats.followUps.change} trend="down" icon={HandHeart} />
    </ResponsiveGrid>
  );
}


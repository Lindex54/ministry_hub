"use client";

import Link from "next/link";
import { Upload, RotateCcw, UserPlus, Users, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useVisitors } from "../VisitorsProvider";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { getFirstVisit, getFollowUpStatus, getLatestVisit, getVisitType, getVisitorName } from "../data/visitors.mock";
import { VisitorsTable } from "./VisitorsTable";

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function VisitorsOverview() {
  const { visitors: sourceVisitors } = useVisitors();
  const { getPersonTasks } = useOutreach();
  const visitors = sourceVisitors.map((visitor) => ({ ...visitor, followUps: getPersonTasks(`visitor:${visitor.id}`).map((task) => ({ ...task, date: task.scheduledDate })) }));
  const stats = {
    total: visitors.length,
    newVisitors: visitors.filter((visitor) => getVisitType(visitor) === "New").length,
    returning: visitors.filter((visitor) => getVisitType(visitor) === "Returning").length,
    pending: visitors.filter((visitor) => ["Pending", "In Progress"].includes(getFollowUpStatus(visitor))).length,
  };

  function exportVisitors() {
    const headings = ["Name", "Phone", "Email", "Visit type", "First visit", "Last visit", "Latest service", "Follow-up status"];
    const rows = visitors.map((visitor) => [getVisitorName(visitor), visitor.phone, visitor.email, getVisitType(visitor), getFirstVisit(visitor).date, getLatestVisit(visitor).date, getLatestVisit(visitor).service, getFollowUpStatus(visitor)]);
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "ministry-hub-visitors-mock.csv"; link.click();
    URL.revokeObjectURL(url);
    toast.success("Mock visitor records exported.");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader title="Visitors" description="Welcome visitors, record their attendance, and coordinate thoughtful follow-up." actions={<><Button variant="outline" className="border-primary/30 text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-foreground dark:hover:bg-primary/15" onClick={exportVisitors}><Upload />Export visitors</Button><Button asChild><Link href="/visitors/new"><UserPlus />Register visitor</Link></Button></>} />
      <Alert className="border-primary/20 bg-primary/5"><Users /><AlertTitle>Demonstration data</AlertTitle><AlertDescription>Visitor changes work across these pages, but are kept only in memory and reset when the browser is refreshed. No messages are sent.</AlertDescription></Alert>
      <FadeIn><ResponsiveGrid>
        <StatCard title="Total visitors" value={stats.total.toLocaleString()} detail="Unique visitor records" icon={Users} />
        <StatCard title="New visitors" value={stats.newVisitors.toLocaleString()} detail="One recorded visit" icon={UserPlus} />
        <StatCard title="Returning visitors" value={stats.returning.toLocaleString()} detail="Two or more recorded visits" icon={RotateCcw} />
        <StatCard title="Pending follow-ups" value={stats.pending.toLocaleString()} detail="Pending or currently in progress" icon={UserRoundCheck} />
      </ResponsiveGrid></FadeIn>
      <Card><CardHeader className="border-b"><CardTitle>Visitors directory</CardTitle><CardDescription>Search, filter, sort, export, and manage visitor records and follow-ups.</CardDescription></CardHeader><CardContent><VisitorsTable /></CardContent></Card>
    </div>
  );
}

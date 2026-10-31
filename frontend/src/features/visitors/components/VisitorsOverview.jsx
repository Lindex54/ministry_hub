"use client";

import Link from "next/link";
import { AlertTriangle, FileSpreadsheet, RotateCcw, UserPlus, Users, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useVisitors } from "../VisitorsProvider";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { useAttendance } from "@/features/attendance/AttendanceProvider";
import { getFirstVisit, getFollowUpStatus, getLatestVisit, getVisitType, getVisitorName } from "../data/visitors.mock";
import { VisitorsTable } from "./VisitorsTable";

export function VisitorsOverview() {
  const { visitors: sourceVisitors, loading, error } = useVisitors();
  const { getPersonTasks } = useOutreach();
  const { getVisitorWithAttendance } = useAttendance();
  const visitors = sourceVisitors.map((visitor) => ({ ...getVisitorWithAttendance(visitor), followUps: getPersonTasks(`visitor:${visitor.id}`).map((task) => ({ ...task, date: task.scheduledDate })) }));
  const stats = {
    total: visitors.length,
    newVisitors: visitors.filter((visitor) => getVisitType(visitor) === "New").length,
    returning: visitors.filter((visitor) => getVisitType(visitor) === "Returning").length,
    pending: visitors.filter((visitor) => ["Pending", "In Progress"].includes(getFollowUpStatus(visitor))).length,
  };

  async function exportVisitors() {
    if (!visitors.length) { toast.info("There are no visitor records to export yet."); return; }
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Ministry Hub";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Visitors");
    sheet.columns = [
      { header: "Name", key: "name", width: 24 },
      { header: "Phone", key: "phone", width: 18 },
      { header: "Email", key: "email", width: 28 },
      { header: "Visit type", key: "visitType", width: 14 },
      { header: "First visit", key: "firstVisit", width: 14 },
      { header: "Last visit", key: "lastVisit", width: 14 },
      { header: "Latest service", key: "latestService", width: 22 },
      { header: "Follow-up status", key: "followUpStatus", width: 18 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const visitor of visitors) {
      sheet.addRow({
        name: getVisitorName(visitor),
        phone: visitor.phone,
        email: visitor.email,
        visitType: getVisitType(visitor),
        firstVisit: getFirstVisit(visitor)?.date ?? "",
        lastVisit: getLatestVisit(visitor)?.date ?? "",
        latestService: getLatestVisit(visitor)?.service ?? "",
        followUpStatus: getFollowUpStatus(visitor),
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ministry-hub-visitors-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Visitor records exported to Excel.");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Visitors"
        description="Welcome visitors, record their attendance, and coordinate thoughtful follow-up."
        actions={<>
          <Button variant="outline" className="border-primary/30 text-foreground hover:border-primary/60 hover:bg-primary/10 hover:text-foreground dark:hover:bg-primary/15" onClick={exportVisitors}><FileSpreadsheet />Export to Excel</Button>
          <Button asChild><Link href="/visitors/new"><UserPlus />Register visitor</Link></Button>
        </>}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Could not load visitors</AlertTitle>
          <AlertDescription>Check that the backend server is running, then refresh this page.</AlertDescription>
        </Alert>
      ) : null}

      <FadeIn><ResponsiveGrid>
        <StatCard title="Total visitors" value={stats.total.toLocaleString()} detail="Unique visitor records" icon={Users} />
        <StatCard title="New visitors" value={stats.newVisitors.toLocaleString()} detail="One recorded visit" icon={UserPlus} />
        <StatCard title="Returning visitors" value={stats.returning.toLocaleString()} detail="Two or more recorded visits" icon={RotateCcw} />
        <StatCard title="Pending follow-ups" value={stats.pending.toLocaleString()} detail="Pending or currently in progress" icon={UserRoundCheck} />
      </ResponsiveGrid></FadeIn>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Visitors directory</CardTitle>
          <CardDescription>Search, filter, sort, export, and manage visitor records and follow-ups.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-6 text-sm text-muted-foreground">Loading visitors…</p> : <VisitorsTable />}
        </CardContent>
      </Card>
    </div>
  );
}

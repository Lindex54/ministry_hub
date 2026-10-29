"use client";

import { ClipboardCheck, UserCheck, UserRoundPlus, UserX } from "lucide-react";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/tables/DataTable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAttendance } from "../AttendanceProvider";
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { AttendanceRegister } from "./AttendanceRegister";
import { AddAttendeeDialog, CreateOccurrenceDialog } from "./AttendanceDialogs";
import { AttendanceAnalytics } from "./AttendanceAnalytics";

export function AttendancePage() {
  const { scope, setScope, getBranchServices, selectedOccurrence, changeBranch, occurrences, selectOccurrence, totals } = useAttendance();
  const { allBranchNames } = useMinistries();
  const counts = totals(selectedOccurrence);
  const history = occurrences.filter((item) => item.branch === scope.branch && item.date <= scope.date).sort((a, b) => b.date.localeCompare(a.date)).map((item) => ({ ...item, ...totals(item) }));
  function changeService(service) {
    const latest = occurrences.filter((item) => item.branch === scope.branch && item.service === service).sort((a, b) => b.date.localeCompare(a.date))[0];
    setScope({ ...scope, service, date: latest?.date ?? scope.date });
  }
  const columns = [
    { accessorKey: "service", header: "Service" }, { accessorKey: "date", header: "Date" }, { accessorKey: "branch", header: "Branch" },
    { accessorKey: "members", header: "Members present" }, { accessorKey: "visitors", header: "Visitors present" }, { accessorKey: "total", header: "Total attendance" },
    { id: "actions", enableSorting: false, cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => { selectOccurrence(row.original); document.getElementById("attendance-register")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }}>Open register</Button> },
  ];
  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
    <PageHeader title="Attendance" description="Record attendance for each branch, service, and date in its own independent register." actions={<><CreateOccurrenceDialog /><AddAttendeeDialog /></>} />
    <Alert className="border-primary/20 bg-primary/5"><ClipboardCheck /><AlertTitle>Demonstration attendance data</AlertTitle><AlertDescription>Registers share existing member and visitor records. Updates are temporary and reset when the browser is refreshed. Administrator and usher permissions will be implemented later.</AlertDescription></Alert>
    <Card><CardContent className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="attendance-branch">Church branch</Label><Select value={scope.branch} onValueChange={changeBranch}><SelectTrigger id="attendance-branch" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{allBranchNames.map((branch) => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="attendance-service">Service</Label><Select value={scope.service} onValueChange={changeService}><SelectTrigger id="attendance-service" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{getBranchServices(scope.branch).map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="attendance-date">Service date</Label><Input id="attendance-date" type="date" value={scope.date} onChange={(event) => { if (event.target.value) setScope({ ...scope, date: event.target.value }); }} /></div>
    </CardContent></Card>
    <div data-testid="attendance-statistics"><ResponsiveGrid><StatCard title="Latest Service Attendance" value={selectedOccurrence ? counts.total : "—"} detail={`Selected register · ${scope.date}`} icon={ClipboardCheck} /><StatCard title="Members Present" value={selectedOccurrence ? counts.members : "—"} detail="Confirmed present members" icon={UserCheck} /><StatCard title="Visitors Present" value={selectedOccurrence ? counts.visitors : "—"} detail="Confirmed present visitors" icon={UserRoundPlus} /><StatCard title="Members Absent" value={selectedOccurrence ? counts.absent : "—"} detail="Explicitly absent, expected members only" icon={UserX} /></ResponsiveGrid></div>
    <Card id="attendance-register" className="scroll-mt-28"><CardHeader className="border-b"><CardTitle>Attendance register</CardTitle><CardDescription>{scope.branch} · {scope.service} · {scope.date}</CardDescription></CardHeader><CardContent>{selectedOccurrence ? <AttendanceRegister key={selectedOccurrence.id} occurrence={selectedOccurrence} /> : <div className="space-y-4 rounded-lg border border-dashed p-8 text-center"><p className="font-medium">No register for this occurrence</p><p className="text-sm text-muted-foreground">Create one to start recording attendance for the selected branch, service, and date.</p><CreateOccurrenceDialog /></div>}</CardContent></Card>
    <AttendanceAnalytics />
    <Card id="attendance-history"><CardHeader className="border-b"><CardTitle>Attendance History</CardTitle><CardDescription>{scope.branch} · Recorded services on or before {scope.date}. Open any occurrence to view or update its individual register.</CardDescription></CardHeader><CardContent><DataTable data={history} columns={columns} enableSelection={false} searchPlaceholder="Search past services, dates..." /></CardContent></Card>
  </div>;
}

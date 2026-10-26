"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, Ellipsis, Eye, Pencil } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { MemberAvatar } from "@/features/members/components/MemberAvatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVisitors } from "../VisitorsProvider";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { useAttendance } from "@/features/attendance/AttendanceProvider";
import { followUpStatuses, getFirstVisit, getFollowUpStatus, getLatestVisit, getVisitType, getVisitorName, serviceOptions } from "../data/visitors.mock";
import { FollowUpStatusBadge, VisitTypeBadge } from "./VisitorBadges";

function formatDate(value) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
}

export function VisitorsTable() {
  const { visitors: sourceVisitors } = useVisitors();
  const { getPersonTasks } = useOutreach();
  const { getVisitorWithAttendance } = useAttendance();
  const visitors = sourceVisitors.map((visitor) => ({ ...getVisitorWithAttendance(visitor), followUps: getPersonTasks(`visitor:${visitor.id}`).map((task) => ({ ...task, date: task.scheduledDate })) }));
  const [visitType, setVisitType] = useState("all");
  const [followUpStatus, setFollowUpStatus] = useState("all");
  const [service, setService] = useState("all");

  const filteredVisitors = useMemo(() => visitors.filter((visitor) => (
    (visitType === "all" || getVisitType(visitor) === visitType)
    && (followUpStatus === "all" || getFollowUpStatus(visitor) === followUpStatus)
    && (service === "all" || visitor.visitHistory.some((visit) => visit.service === service))
  )), [followUpStatus, service, visitType, visitors]);

  const columns = useMemo(() => [
    {
      accessorFn: getVisitorName,
      id: "name",
      header: "Visitor",
      cell: ({ row }) => (
        <div className="flex min-w-48 items-center gap-3">
          <MemberAvatar member={row.original} />
          <div className="min-w-0"><Link href={`/visitors/${row.original.id}`} className="block truncate font-semibold hover:text-primary hover:underline">{getVisitorName(row.original)}</Link><span className="text-xs text-muted-foreground">{getVisitType(row.original)} visitor</span></div>
        </div>
      ),
    },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email || <span className="text-muted-foreground">Not provided</span> },
    { id: "visitType", accessorFn: getVisitType, header: "Visit type", cell: ({ row }) => <VisitTypeBadge type={getVisitType(row.original)} /> },
    { id: "firstVisit", accessorFn: (visitor) => getFirstVisit(visitor)?.date, header: "First visit", cell: ({ row }) => formatDate(getFirstVisit(row.original)?.date) },
    { id: "lastVisit", accessorFn: (visitor) => getLatestVisit(visitor)?.date, header: "Last visit", cell: ({ row }) => formatDate(getLatestVisit(row.original)?.date) },
    { id: "service", accessorFn: (visitor) => getLatestVisit(visitor)?.service, header: "Latest service", cell: ({ row }) => getLatestVisit(row.original)?.service ?? "Not recorded" },
    { id: "followUp", accessorFn: getFollowUpStatus, header: "Follow-up", cell: ({ row }) => <FollowUpStatusBadge status={getFollowUpStatus(row.original)} /> },
    {
      id: "actions", enableSorting: false, cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${getVisitorName(row.original)}`}><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Manage visitor</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href={`/visitors/${row.original.id}`}><Eye />View profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/visitors/${row.original.id}/edit`}><Pencil />Edit details</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/visitors/${row.original.id}#follow-ups`}><ClipboardList />Manage follow-ups</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Select value={visitType} onValueChange={setVisitType}><SelectTrigger className="w-full lg:w-44" aria-label="Filter by visit type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All visit types</SelectItem><SelectItem value="New">New visitors</SelectItem><SelectItem value="Returning">Returning visitors</SelectItem></SelectContent></Select>
        <Select value={followUpStatus} onValueChange={setFollowUpStatus}><SelectTrigger className="w-full lg:w-52" aria-label="Filter by follow-up status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All follow-ups</SelectItem>{[...followUpStatuses, "Not Scheduled"].map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
        <Select value={service} onValueChange={setService}><SelectTrigger className="w-full lg:w-56" aria-label="Filter by service"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All services</SelectItem>{serviceOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        {(visitType !== "all" || followUpStatus !== "all" || service !== "all") ? <Button variant="ghost" onClick={() => { setVisitType("all"); setFollowUpStatus("all"); setService("all"); }}>Clear filters</Button> : null}
      </div>
      <DataTable columns={columns} data={filteredVisitors} searchPlaceholder="Search visitors, phone, email, service..." enableSelection={false} initialPageSize={5} />
    </div>
  );
}

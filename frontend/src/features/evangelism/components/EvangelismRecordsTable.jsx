"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, Ellipsis, Eye, Pencil } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { MemberAvatar } from "@/features/members/components/MemberAvatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { useEvangelism } from "../EvangelismProvider";
import { evangelismTeam, getLatestEncounter, getRecordName, responseOptions } from "../data/evangelism.mock";
import { FollowUpStatusBadge } from "@/features/visitors/components/VisitorBadges";
import { ResponseBadge } from "./EvangelismBadges";

function workerName(id) {
  return evangelismTeam.find((worker) => worker.id === id)?.name ?? "Not recorded";
}

function followUpStatus(record, getPersonTasks) {
  const tasks = getPersonTasks(`evangelism:${record.id}`);
  if (tasks.some((task) => task.status === "In Progress")) return "In Progress";
  if (tasks.some((task) => task.status === "Pending")) return "Pending";
  if (tasks.length) return [...tasks].sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate))[0].status;
  return record.followUpNeeded ? "Pending" : "Not Scheduled";
}

export function EvangelismRecordsTable({ records }) {
  const { getActivity } = useEvangelism();
  const { getPersonTasks } = useOutreach();
  const [response, setResponse] = useState("all");
  const [worker, setWorker] = useState("all");

  const filtered = useMemo(() => records.filter((record) => {
    const latest = getLatestEncounter(record);
    return (response === "all" || latest?.response === response) && (worker === "all" || latest?.evangelizedBy === worker);
  }), [records, response, worker]);

  const columns = useMemo(() => [
    {
      accessorFn: getRecordName, id: "name", header: "Person",
      cell: ({ row }) => <div className="flex min-w-48 items-center gap-3"><MemberAvatar member={row.original} /><div className="min-w-0"><Link href={`/evangelism/${row.original.id}`} className="block truncate font-semibold hover:text-primary hover:underline">{getRecordName(row.original)}</Link><span className="text-xs text-muted-foreground">{row.original.history.length} recorded encounter{row.original.history.length === 1 ? "" : "s"}</span></div></div>,
    },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone || <span className="text-muted-foreground">Not recorded</span> },
    { id: "location", header: "Location", accessorFn: (record) => getLatestEncounter(record)?.location, cell: ({ row }) => getLatestEncounter(row.original)?.location || "Not recorded" },
    { id: "date", header: "Date", accessorFn: (record) => getLatestEncounter(record)?.date, cell: ({ row }) => getLatestEncounter(row.original)?.date || "Not recorded" },
    { id: "evangelizedBy", header: "Evangelized by", accessorFn: (record) => workerName(getLatestEncounter(record)?.evangelizedBy), cell: ({ row }) => workerName(getLatestEncounter(row.original)?.evangelizedBy) },
    { id: "activity", header: "Activity", accessorFn: (record) => getActivity(getLatestEncounter(record)?.activityId)?.name ?? "", cell: ({ row }) => getActivity(getLatestEncounter(row.original)?.activityId)?.name ?? <span className="text-muted-foreground">Unlinked</span> },
    { id: "response", header: "Response", accessorFn: (record) => getLatestEncounter(record)?.response, cell: ({ row }) => <ResponseBadge response={getLatestEncounter(row.original)?.response} /> },
    { id: "followUp", header: "Follow-up", accessorFn: (record) => followUpStatus(record, getPersonTasks), cell: ({ row }) => <FollowUpStatusBadge status={followUpStatus(row.original, getPersonTasks)} /> },
    {
      id: "actions", enableSorting: false, cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${getRecordName(row.original)}`}><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Manage record</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href={`/evangelism/${row.original.id}`}><Eye />View profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/evangelism/${row.original.id}/edit`}><Pencil />Edit details</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link href={`/evangelism/${row.original.id}#follow-ups`}><ClipboardList />Manage follow-ups</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [getActivity, getPersonTasks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <Select value={response} onValueChange={setResponse}><SelectTrigger className="w-full lg:w-56" aria-label="Filter by response"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All responses</SelectItem>{responseOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
        <Select value={worker} onValueChange={setWorker}><SelectTrigger className="w-full lg:w-56" aria-label="Filter by evangelism worker"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All workers</SelectItem>{evangelismTeam.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select>
        {(response !== "all" || worker !== "all") ? <Button variant="ghost" onClick={() => { setResponse("all"); setWorker("all"); }}>Clear filters</Button> : null}
      </div>
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search people, phone, location..." enableSelection={false} initialPageSize={5} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, Clock, CheckCircle2, Phone } from "lucide-react";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DataTable } from "@/components/tables/DataTable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useOutreach } from "../OutreachProvider";
import { followUpMethods, taskStatuses, workers } from "../data/outreach.mock";
import { TaskAssignmentDialog, TaskFeedbackDialog, TaskHistoryDialog } from "./TaskDialogs";
import { FollowUpStatusBadge } from "@/features/visitors/components/VisitorBadges";

export function FollowUpsPage() {
  const { tasks, getPerson } = useOutreach();
  const [worker, setWorker] = useState("all"); const [status, setStatus] = useState("all"); const [method, setMethod] = useState("all");
  const filtered = tasks.filter((task) => (worker === "all" || task.workerId === worker) && (status === "all" || task.status === status) && (method === "all" || task.method === method));
  const columns = useMemo(() => [
    { id: "person", header: "Person", accessorFn: (task) => getPerson(task.personKey)?.name ?? "Record unavailable", cell: ({ row }) => { const person = getPerson(row.original.personKey); return person ? <div><Link href={person.href} className="font-semibold text-primary hover:underline">{person.name}</Link><p className="text-xs text-muted-foreground">{person.type} · {person.phone || "No phone"}</p><p className="max-w-56 truncate text-xs text-muted-foreground">{person.address || "No address"}</p></div> : "Record unavailable"; } },
    { id: "worker", header: "Assigned worker", accessorFn: (task) => workers.find((item) => item.id === task.workerId)?.name },
    { accessorKey: "method", header: "Method" }, { accessorKey: "scheduledDate", header: "Scheduled" },
    { accessorKey: "priority", header: "Priority", cell: ({ row }) => <Badge variant="outline" className={row.original.priority === "Urgent" ? "text-destructive" : row.original.priority === "High" ? "text-warning" : ""}>{row.original.priority}</Badge> },
    { accessorKey: "reason", header: "Reason", cell: ({ row }) => <span className="block max-w-56 whitespace-normal">{row.original.reason}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <FollowUpStatusBadge status={row.original.status} /> },
    { id: "actions", enableSorting: false, cell: ({ row }) => <div className="flex gap-1"><TaskFeedbackDialog task={row.original} /><TaskHistoryDialog task={row.original} /></div> },
  ], [getPerson]);
  return <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8"><PageHeader title="Follow-ups" description="Coordinate individual phone calls, physical visits, and pastoral care." actions={<TaskAssignmentDialog workerId={worker === "all" ? undefined : worker} />} />
    <Alert className="border-primary/20 bg-primary/5"><ClipboardList /><AlertTitle>Mock assignments & worker views</AlertTitle><AlertDescription>Choose a worker below to preview their tasks and submit feedback. Role permissions and permanent storage will be added later. Bulk SMS and email campaigns are managed in <Link href="/communications" className="underline">Communications</Link>.</AlertDescription></Alert>
    <ResponsiveGrid><StatCard title="Total assignments" value={tasks.length} detail="Across all workers" icon={ClipboardList} /><StatCard title="Pending" value={tasks.filter((task) => task.status === "Pending").length} icon={Clock} /><StatCard title="In progress" value={tasks.filter((task) => task.status === "In Progress").length} icon={Phone} /><StatCard title="Completed" value={tasks.filter((task) => task.status === "Completed").length} icon={CheckCircle2} /></ResponsiveGrid>
    <Card><CardHeader className="border-b"><CardTitle>{worker === "all" ? "Follow-up assignments" : `${workers.find((item) => item.id === worker)?.name}'s tasks`}</CardTitle><CardDescription>Assignments stay connected to the original member, visitor, or evangelism contact.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row">
      <Select value={worker} onValueChange={setWorker}><SelectTrigger className="w-full sm:w-60" aria-label="Worker task view"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All workers · Administrator</SelectItem>{workers.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · {item.role}</SelectItem>)}</SelectContent></Select>
      <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-48" aria-label="Filter status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{taskStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      <Select value={method} onValueChange={setMethod}><SelectTrigger className="w-full sm:w-48" aria-label="Filter method"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All methods</SelectItem>{followUpMethods.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
    </div><DataTable data={filtered} columns={columns} enableSelection={false} searchPlaceholder="Search people, workers, reason..." /></CardContent></Card>
  </div>;
}

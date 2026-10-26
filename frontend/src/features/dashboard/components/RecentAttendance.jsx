"use client";

import { Eye, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const columns = [
  { accessorKey: "service", header: "Service", cell: ({ row }) => <span className="flex items-center gap-3 font-medium"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><ClipboardCheck className="size-4" /></span>{row.original.service}</span> },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "attendance", header: "Attendance", cell: ({ row }) => <span className="font-bold tabular-nums">{row.original.attendance.toLocaleString("en-US")}</span> },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="secondary" className={row.original.status === "Completed" ? "gap-1.5 border-0 bg-success/10 text-success" : "gap-1.5 border-0 bg-primary/10 text-primary"}><span className="size-1.5 rounded-full bg-current" />{row.original.status}</Badge> },
  { id: "action", enableSorting: false, header: "Action", cell: ({ row }) => <Button variant="ghost" size="sm" onClick={() => toast.info(`${row.original.service}: ${row.original.attendance} attendees. Demonstration record.`)}><Eye />View</Button> },
];

export function RecentAttendance({ data }) {
  return (
    <Card className="mt-3 min-w-0 pt-0 xl:col-span-3">
      <CardHeader className="mx-4 -mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary px-5 py-5 text-primary-foreground shadow-lg shadow-primary/15">
        <div><CardTitle>Recent attendance</CardTitle><p className="mt-2 text-xs opacity-90">A closer look at your latest gatherings</p></div>
        <Badge className="border-0 bg-primary-foreground/15 text-primary-foreground">{data.length} services</Badge>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} searchable={false} showPageSize={false} enableSelection={false} initialPageSize={5} />
      </CardContent>
    </Card>
  );
}


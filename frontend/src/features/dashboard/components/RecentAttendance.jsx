"use client";

import { Eye } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const columns = [
  { accessorKey: "service", header: "Service" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "attendance", header: "Attendance" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "Completed" ? "default" : "secondary"}>{row.original.status}</Badge> },
  { id: "action", enableSorting: false, header: "Action", cell: () => <Button variant="ghost" size="sm"><Eye />View</Button> },
];

export function RecentAttendance({ data }) {
  return (
    <Card className="xl:col-span-3">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Attendance</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} searchable={false} showPageSize={false} enableSelection={false} initialPageSize={5} />
      </CardContent>
    </Card>
  );
}


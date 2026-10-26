"use client";

import Link from "next/link";
import { DataTable } from "@/components/tables/DataTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttendance } from "../AttendanceProvider";
import { AttendanceBadge } from "./AttendanceRegister";

export function PersonAttendanceHistory({ personKey }) {
  const { getPersonAttendance, selectOccurrence } = useAttendance();
  const records = getPersonAttendance(personKey);
  const columns = [
    { accessorKey: "date", header: "Date" }, { accessorKey: "branch", header: "Branch" }, { accessorKey: "service", header: "Service" },
    { accessorKey: "status", header: "Attendance", cell: ({ row }) => <AttendanceBadge status={row.original.status} /> },
    { id: "open", enableSorting: false, cell: ({ row }) => <Button asChild size="sm" variant="outline"><Link href="/attendance" onClick={() => selectOccurrence(row.original)}>Open register</Link></Button> },
  ];
  return <Card className="min-w-0"><CardHeader><CardTitle>Attendance history</CardTitle><CardDescription>Recorded service attendance across branches. Demonstration data updates with the attendance registers.</CardDescription></CardHeader><CardContent><DataTable columns={columns} data={records} enableSelection={false} searchPlaceholder="Search service, branch, date..." /></CardContent></Card>;
}

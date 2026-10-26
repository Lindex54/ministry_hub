"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAttendance } from "../AttendanceProvider";
import { normalizePhone } from "@/features/outreach/outreach-utils.mjs";

export function AttendanceBadge({ status }) {
  return <Badge variant="outline" className={status === "Present" ? "border-success/20 bg-success/10 text-success" : status === "Absent" ? "border-warning/20 bg-warning/10 text-warning" : "text-muted-foreground"}>{status}</Badge>;
}

export function AttendanceRegister({ occurrence }) {
  const { people, markAttendance, setExpected } = useAttendance();
  const [selection, setSelection] = useState({});
  const [includeOtherBranches, setIncludeOtherBranches] = useState(false);
  const [category, setCategory] = useState("all"); const [status, setStatus] = useState("all");
  const roster = people.filter((person) => includeOtherBranches || person.branch === occurrence.branch || occurrence.expected.includes(person.key) || occurrence.roster.includes(person.key) || Object.hasOwn(occurrence.records, person.key));
  const rows = roster.map((person) => ({ ...person, category: occurrence.records[person.key]?.category ?? person.category, attendanceStatus: occurrence.records[person.key]?.status ?? "Not Recorded", expected: occurrence.expected.includes(person.key) })).filter((person) => (category === "all" || person.category === category) && (status === "all" || person.attendanceStatus === status));
  const selectedKeys = Object.keys(selection).filter((key) => selection[key] && roster.some((person) => person.key === key));
  function mark(keys, nextStatus) { markAttendance(occurrence.id, keys, nextStatus); setSelection({}); toast.success(`${nextStatus} recorded for ${keys.length} attendee${keys.length === 1 ? "" : "s"}.`); }
  const columns = useMemo(() => [
    { id: "select", enableSorting: false, header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))} aria-label="Select all visible attendees" />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))} aria-label={`Select ${row.original.name}`} /> },
    { accessorKey: "name", header: "Person", cell: ({ row }) => <div><Link className="font-semibold text-primary hover:underline" href={row.original.href}>{row.original.name}</Link><p className="text-xs text-muted-foreground">{row.original.membershipNumber || (row.original.branch || "No branch recorded")}</p></div> },
    { accessorKey: "category", header: "Category" }, { accessorKey: "phone", header: "Phone" },
    { accessorKey: "membershipNumber", header: "Membership number" },
    { id: "expected", header: "Expected", enableSorting: false, cell: ({ row }) => row.original.category === "Member" ? <Checkbox checked={row.original.expected} onCheckedChange={(checked) => setExpected(occurrence.id, row.original.key, Boolean(checked))} aria-label={`Expect ${row.original.name}`} /> : <span className="text-xs text-muted-foreground">Not expected</span> },
    { accessorKey: "attendanceStatus", header: "Attendance", cell: ({ row }) => <AttendanceBadge status={row.original.attendanceStatus} /> },
    { id: "actions", enableSorting: false, cell: ({ row }) => <div className="flex items-center gap-1"><Button variant="outline" size="sm" disabled={row.original.attendanceStatus === "Present"} onClick={() => mark([row.original.key], "Present")}><Check />Present</Button>{row.original.category === "Member" && row.original.expected ? <Button variant="ghost" size="sm" disabled={row.original.attendanceStatus === "Absent"} onClick={() => mark([row.original.key], "Absent")}>Absent</Button> : null}{row.original.attendanceStatus !== "Not Recorded" ? <Button variant="ghost" size="icon-sm" aria-label={`Clear attendance for ${row.original.name}`} onClick={() => mark([row.original.key], "Not Recorded")}><RotateCcw /></Button> : null}</div> },
  ], [occurrence, setExpected]);
  return <div className="space-y-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"><Select value={category} onValueChange={(value) => { setCategory(value); setSelection({}); }}><SelectTrigger className="w-full sm:w-44" aria-label="Filter attendee category"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem><SelectItem value="Member">Members</SelectItem><SelectItem value="Visitor">Visitors</SelectItem></SelectContent></Select><Select value={status} onValueChange={(value) => { setStatus(value); setSelection({}); }}><SelectTrigger className="w-full sm:w-44" aria-label="Filter attendance status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{["Present", "Absent", "Not Recorded"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Label className="flex items-center gap-2 text-sm"><Checkbox checked={includeOtherBranches} onCheckedChange={(checked) => { setIncludeOtherBranches(Boolean(checked)); setSelection({}); }} />Find people from other branches</Label></div>
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/20 p-3"><span className="text-sm text-muted-foreground">{selectedKeys.length} selected across pages</span><Button size="sm" disabled={!selectedKeys.length} onClick={() => mark(selectedKeys, "Present")}>Mark selected present</Button><Button size="sm" variant="outline" disabled={!selectedKeys.length || selectedKeys.some((key) => !occurrence.expected.includes(key))} onClick={() => mark(selectedKeys, "Absent")}>Mark selected absent</Button><Button size="sm" variant="ghost" disabled={!selectedKeys.length} onClick={() => setSelection({})}>Clear selection</Button></div>
    <p className="text-xs text-muted-foreground">Absent is available only for expected members. Other attendees remain Not Recorded until attendance is entered. Repeated marking never creates another record.</p>
    <DataTable columns={columns} data={rows} initialPageSize={10} rowSelection={selection} onRowSelectionChange={setSelection} getRowId={(row) => row.key} globalFilterFn={(row, columnId, query) => columnId === "phone" ? normalizePhone(row.original.phone).includes(normalizePhone(query)) : String(row.getValue(columnId) ?? "").toLowerCase().includes(query.toLowerCase())} searchPlaceholder="Search name, phone, or membership number..." />
  </div>;
}

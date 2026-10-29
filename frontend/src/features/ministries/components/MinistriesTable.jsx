"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ellipsis, Eye, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/tables/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMembers } from "@/features/members/MembersProvider";
import { useMinistries } from "../MinistriesProvider";
import { getMinistryMemberCount, ministryStatuses } from "../data/ministries.mock";
import { resolveMemberName } from "../leader-utils";

export function MinistriesTable() {
  const { ministries, branches, updateMinistry } = useMinistries();
  const { members } = useMembers();
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => ministries.filter((ministry) => status === "all" || ministry.status === status), [ministries, status]);

  const columns = useMemo(() => [
    { accessorKey: "name", header: "Ministry", cell: ({ row }) => <div><Link href={`/ministries/${row.original.id}`} className="font-semibold hover:text-primary hover:underline">{row.original.name}</Link><p className="max-w-64 truncate text-xs text-muted-foreground">{row.original.description || "No description"}</p></div> },
    { id: "leader", header: "Leader", accessorFn: (ministry) => resolveMemberName(ministry.leaderId, members), cell: ({ row }) => resolveMemberName(row.original.leaderId, members) || "Not assigned" },
    { id: "members", header: "Members", accessorFn: (ministry) => getMinistryMemberCount(ministry, members), cell: ({ row }) => getMinistryMemberCount(row.original, members) },
    { id: "branches", header: "Branches", accessorFn: (ministry) => ministry.branchIds.length, cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.branchIds.map((id) => branches.find((branch) => branch.id === id)?.name).filter(Boolean).map((name) => <Badge key={name} variant="secondary">{name}</Badge>)}</div> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>{row.original.status}</Badge> },
    {
      id: "actions", enableSorting: false, cell: ({ row }) => {
        const ministry = row.original;
        const nextStatus = ministry.status === "Active" ? "Inactive" : "Active";
        return <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${ministry.name}`}><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Manage ministry</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href={`/ministries/${ministry.id}`}><Eye />View profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { updateMinistry(ministry.id, { status: nextStatus }); toast.success(`${ministry.name} marked ${nextStatus.toLowerCase()}.`); }}><PowerOff />Mark {nextStatus.toLowerCase()}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>;
      },
    },
  ], [branches, members, updateMinistry]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{ministryStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      </div>
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search ministries, leaders..." enableSelection={false} initialPageSize={8} />
    </div>
  );
}

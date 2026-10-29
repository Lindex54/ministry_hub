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
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { resolveLeaderName } from "@/features/ministries/leader-utils";
import { branchStatuses, getBranchMemberCount } from "../data/branches.mock";

export function BranchesTable() {
  const { branches, updateBranch } = useMinistries();
  const { members } = useMembers();
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => branches.filter((branch) => status === "all" || branch.status === status), [branches, status]);

  const columns = useMemo(() => [
    { accessorKey: "name", header: "Branch", cell: ({ row }) => <div><Link href={`/ministries/branches/${row.original.id}`} className="font-semibold hover:text-primary hover:underline">{row.original.name}</Link><p className="text-xs text-muted-foreground">{row.original.district}</p></div> },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "phone", header: "Phone" },
    { id: "leader", header: "Leader", accessorFn: (branch) => resolveLeaderName(branch.leaderKey, members), cell: ({ row }) => resolveLeaderName(row.original.leaderKey, members) || "Not assigned" },
    { id: "members", header: "Members", accessorFn: (branch) => getBranchMemberCount(branch, members), cell: ({ row }) => getBranchMemberCount(row.original, members) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>{row.original.status}</Badge> },
    {
      id: "actions", enableSorting: false, cell: ({ row }) => {
        const branch = row.original;
        const nextStatus = branch.status === "Active" ? "Inactive" : "Active";
        return <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label={`Actions for ${branch.name}`}><Ellipsis /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Manage branch</DropdownMenuLabel><DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href={`/ministries/branches/${branch.id}`}><Eye />View details</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { updateBranch(branch.id, { status: nextStatus }); toast.success(`${branch.name} marked ${nextStatus.toLowerCase()}. Existing member and visitor branch records are unaffected.`); }}><PowerOff />Mark {nextStatus.toLowerCase()}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>;
      },
    },
  ], [members, updateBranch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{branchStatuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
      </div>
      <DataTable columns={columns} data={filtered} searchPlaceholder="Search branches, location, leader..." enableSelection={false} initialPageSize={8} />
    </div>
  );
}

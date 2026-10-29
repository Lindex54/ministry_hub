"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ellipsis, Eye, Pencil, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/tables/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMemberDisplayName } from "../data/members.mock";
import { useMembers } from "../MembersProvider";
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { MemberAvatar } from "./MemberAvatar";
import { MemberStatusBadge } from "./MemberStatusBadge";

export function MembersTable() {
  const { members, updateMember } = useMembers();
  const { allBranchNames } = useMinistries();
  const [status, setStatus] = useState("all");
  const [branch, setBranch] = useState("all");

  const filteredMembers = useMemo(() => members.filter((member) => (
    (status === "all" || member.status === status)
    && (branch === "all" || member.branch === branch)
  )), [branch, members, status]);

  const columns = useMemo(() => [
    {
      accessorFn: (member) => getMemberDisplayName(member),
      id: "name",
      header: "Member",
      cell: ({ row }) => (
        <div className="flex min-w-52 items-center gap-3">
          <MemberAvatar member={row.original} />
          <div className="min-w-0">
            <Link href={`/members/${row.original.id}`} className="block truncate font-semibold hover:text-primary hover:underline">
              {getMemberDisplayName(row.original)}
            </Link>
            <span className="text-xs text-muted-foreground">{row.original.membershipNumber}</span>
          </div>
        </div>
      ),
    },
    { accessorKey: "primaryPhone", header: "Phone" },
    { accessorKey: "branch", header: "Branch" },
    {
      accessorKey: "dateJoined",
      header: "Date joined",
      cell: ({ row }) => new Intl.DateTimeFormat("en-UG", { dateStyle: "medium" }).format(new Date(`${row.original.dateJoined}T00:00:00`)),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <MemberStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      enableSorting: false,
      cell: ({ row }) => {
        const member = row.original;
        const nextStatus = member.status === "Active" ? "Inactive" : "Active";
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${getMemberDisplayName(member)}`}>
                <Ellipsis />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Manage member</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href={`/members/${member.id}`}><Eye />View profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href={`/members/${member.id}/edit`}><Pencil />Edit information</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => {
                updateMember(member.id, { status: nextStatus });
                toast.success(`${getMemberDisplayName(member)} marked ${nextStatus.toLowerCase()}.`);
              }}>
                {nextStatus === "Active" ? <UserCheck /> : <UserX />}
                Mark {nextStatus.toLowerCase()}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [updateMember]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-44" aria-label="Filter by membership status">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Transferred">Transferred</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branch} onValueChange={setBranch}>
          <SelectTrigger className="w-full md:w-52" aria-label="Filter by church branch">
            <SelectValue placeholder="All branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All branches</SelectItem>
            {allBranchNames.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
          </SelectContent>
        </Select>
        {(status !== "all" || branch !== "all") ? (
          <Button variant="ghost" onClick={() => { setStatus("all"); setBranch("all"); }}>Clear filters</Button>
        ) : null}
      </div>
      <DataTable
        columns={columns}
        data={filteredMembers}
        searchPlaceholder="Search by name, number, phone, branch..."
        enableSelection={false}
        initialPageSize={5}
      />
    </div>
  );
}

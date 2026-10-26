"use client";

import Link from "next/link";
import { UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useMembers } from "../MembersProvider";
import { MembersTable } from "./MembersTable";

export function MembersOverview() {
  const { members } = useMembers();
  const newMemberCutoff = "2026-08-26";
  const stats = {
    total: members.length,
    active: members.filter((member) => member.status === "Active").length,
    newMembers: members.filter((member) => member.dateJoined >= newMemberCutoff).length,
    inactive: members.filter((member) => member.status === "Inactive").length,
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader
        title="Members"
        description="Manage church member records, contact details, affiliations, and membership status."
        actions={<Button asChild><Link href="/members/new"><UserPlus />Add member</Link></Button>}
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Users />
        <AlertTitle>Demonstration data</AlertTitle>
        <AlertDescription>Member changes work across these pages, but are stored only in memory and reset when the browser is refreshed.</AlertDescription>
      </Alert>

      <FadeIn>
        <ResponsiveGrid>
          <StatCard title="Total members" value={stats.total.toLocaleString()} detail="Across all church branches" icon={Users} />
          <StatCard title="Active members" value={stats.active.toLocaleString()} detail="Currently active membership" icon={UserCheck} />
          <StatCard title="New members" value={stats.newMembers.toLocaleString()} detail="Joined in the last 60 days" icon={UserPlus} />
          <StatCard title="Inactive members" value={stats.inactive.toLocaleString()} detail="Require review or follow-up" icon={UserX} />
        </ResponsiveGrid>
      </FadeIn>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Members directory</CardTitle>
          <CardDescription>Search, filter, sort, and manage the current mock membership records.</CardDescription>
        </CardHeader>
        <CardContent>
          <MembersTable />
        </CardContent>
      </Card>
    </div>
  );
}

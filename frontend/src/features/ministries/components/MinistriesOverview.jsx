"use client";

import { ClipboardList, Network, ShieldCheck, Users } from "lucide-react";
import { Building2, MapPinned, UserCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/Motion";
import { PageHeader, ResponsiveGrid } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { useMembers } from "@/features/members/MembersProvider";
import { events } from "@/features/outreach/data/outreach.mock";
import { useMinistries } from "../MinistriesProvider";
import { NewBranchDialog } from "@/features/branches/components/BranchDialogs";
import { BranchesTable } from "@/features/branches/components/BranchesTable";
import { getBranchMemberCount } from "@/features/branches/data/branches.mock";
import { NewMinistryDialog } from "./MinistryDialogs";
import { MinistriesTable } from "./MinistriesTable";

export function MinistriesOverview() {
  const { ministries, branches } = useMinistries();
  const { members } = useMembers();
  const today = new Date().toISOString().slice(0, 10);

  const ministryStats = {
    total: ministries.length,
    active: ministries.filter((ministry) => ministry.status === "Active").length,
    ministryMembers: new Set(members.filter((member) => member.ministries.some((name) => name !== "None")).map((member) => member.id)).size,
    upcoming: events.filter((event) => event.date >= today).length,
  };
  const branchStats = {
    total: branches.length,
    active: branches.filter((branch) => branch.status === "Active").length,
    registeredMembers: branches.reduce((total, branch) => total + getBranchMemberCount(branch, members), 0),
    assignedLeaders: branches.filter((branch) => branch.leaderKey).length,
  };

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8">
      <PageHeader title="Ministries" description="Manage church ministries and church branches, and how they work together." />
      <Alert className="border-primary/20 bg-primary/5"><Network /><AlertTitle>Demonstration data</AlertTitle><AlertDescription>Ministries and branches created or edited here are kept only in memory for this session and reset on refresh. Nothing is saved to a database.</AlertDescription></Alert>
      <Tabs defaultValue="ministries">
        <TabsList className="w-full justify-start sm:w-auto"><TabsTrigger value="ministries">Ministries</TabsTrigger><TabsTrigger value="branches">Church Branches</TabsTrigger></TabsList>
        <TabsContent value="ministries" className="space-y-8 pt-6">
          <FadeIn><ResponsiveGrid>
            <StatCard title="Total ministries" value={ministryStats.total.toLocaleString()} detail="Registered across all branches" icon={Network} />
            <StatCard title="Active ministries" value={ministryStats.active.toLocaleString()} detail="Currently operating" icon={ShieldCheck} />
            <StatCard title="Ministry members" value={ministryStats.ministryMembers.toLocaleString()} detail="Members in at least one ministry" icon={Users} />
            <StatCard title="Upcoming activities" value={ministryStats.upcoming.toLocaleString()} detail="Scheduled from today" icon={ClipboardList} />
          </ResponsiveGrid></FadeIn>
          <Card><CardHeader className="flex-col items-start justify-between gap-3 border-b sm:flex-row sm:items-center"><div className="space-y-1"><CardTitle>Ministries directory</CardTitle><CardDescription>Search, filter, and manage ministries, their leadership, and branch assignments.</CardDescription></div><NewMinistryDialog /></CardHeader><CardContent><MinistriesTable /></CardContent></Card>
        </TabsContent>
        <TabsContent value="branches" className="space-y-8 pt-6">
          <FadeIn><ResponsiveGrid>
            <StatCard title="Total branches" value={branchStats.total.toLocaleString()} detail="Registered church branches" icon={Building2} />
            <StatCard title="Active branches" value={branchStats.active.toLocaleString()} detail="Currently operating" icon={MapPinned} />
            <StatCard title="Registered members" value={branchStats.registeredMembers.toLocaleString()} detail="Across all branches" icon={Users} />
            <StatCard title="Assigned leaders" value={branchStats.assignedLeaders.toLocaleString()} detail="Branches with a leader on record" icon={UserCheck} />
          </ResponsiveGrid></FadeIn>
          <Card><CardHeader className="flex-col items-start justify-between gap-3 border-b sm:flex-row sm:items-center"><div className="space-y-1"><CardTitle>Church branches directory</CardTitle><CardDescription>Register branches and assign which ministries operate at each one.</CardDescription></div><NewBranchDialog /></CardHeader><CardContent><BranchesTable /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

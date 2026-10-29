"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Network, ShieldCheck, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { MemberAvatar } from "@/features/members/components/MemberAvatar";
import { useMembers } from "@/features/members/MembersProvider";
import { useMinistries } from "../MinistriesProvider";
import { getMinistryMemberCount } from "../data/ministries.mock";
import { resolveMemberName } from "../leader-utils";
import { AssignMinistryMembersDialog, EditMinistryDialog } from "./MinistryDialogs";

function Detail({ label, value, icon: Icon }) {
  return <div className="flex gap-3 py-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="break-words text-sm font-medium">{value || "Not provided"}</p></div></div>;
}

export function MinistryProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMinistry, branches } = useMinistries();
  const { members } = useMembers();
  const ministry = getMinistry(id);
  if (!ministry) return <div className="mx-auto w-full max-w-3xl space-y-6"><Alert variant="destructive"><Network /><AlertTitle>Ministry not found</AlertTitle><AlertDescription>This mock ministry does not exist or was reset when the page refreshed.</AlertDescription></Alert><Button variant="outline" onClick={() => router.push("/ministries")}><ArrowLeft />Return to ministries</Button></div>;

  const ministryMembers = members.filter((member) => member.ministries.includes(ministry.name));
  const ministryBranches = branches.filter((branch) => ministry.branchIds.includes(branch.id));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader title="Ministry profile" description="Review ministry leadership, branch assignments, and membership." actions={<><Button variant="outline" onClick={() => router.push("/ministries")}><ArrowLeft />Ministries</Button><EditMinistryDialog ministry={ministry} /><AssignMinistryMembersDialog ministry={ministry} /></>} />
      <Card className="overflow-hidden pt-0"><div className="h-1 bg-primary" /><CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{ministry.name}</h2><Badge variant={ministry.status === "Active" ? "default" : "secondary"}>{ministry.status}</Badge></div><p className="text-sm text-muted-foreground">{ministry.description || "No description provided."}</p></div></CardContent></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Leadership</CardTitle><CardDescription>Overall ministry leadership across all branches.</CardDescription></CardHeader><CardContent className="grid gap-x-5 sm:grid-cols-2">
          <Detail label="Ministry leader" value={resolveMemberName(ministry.leaderId, members)} icon={ShieldCheck} />
          <Detail label="Assistant leader" value={resolveMemberName(ministry.assistantLeaderId, members)} icon={Users} />
          <Detail label="Date established" value={ministry.dateEstablished} icon={CalendarDays} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Operating branches</CardTitle><CardDescription>Branches where this ministry currently operates.</CardDescription></CardHeader><CardContent>
          {ministryBranches.length ? <div className="flex flex-wrap gap-2">{ministryBranches.map((branch) => <Badge key={branch.id} variant="secondary" asChild><Link href={`/ministries/branches/${branch.id}`}><MapPin />{branch.name}</Link></Badge>)}</div> : <p className="text-sm text-muted-foreground">Not yet assigned to a branch. Assign it from the branch's edit form.</p>}
        </CardContent></Card>
      </div>
      <Card><CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><div className="space-y-1"><CardTitle>Ministry members</CardTitle><CardDescription>{getMinistryMemberCount(ministry, members)} member{getMinistryMemberCount(ministry, members) === 1 ? "" : "s"} currently assigned. Members can belong to more than one ministry.</CardDescription></div></CardHeader><CardContent>
        {ministryMembers.length ? <div className="grid gap-3 sm:grid-cols-2">{ministryMembers.map((member) => <Link key={member.id} href={`/members/${member.id}`} className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/40 hover:bg-primary/5"><MemberAvatar member={member} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.firstName} {member.lastName}</p><p className="text-xs text-muted-foreground">{member.branch}</p></div></Link>)}</div> : <p className="text-sm text-muted-foreground">No members assigned yet.</p>}
      </CardContent></Card>
    </div>
  );
}

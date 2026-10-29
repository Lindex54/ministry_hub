"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Church, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { MemberAvatar } from "@/features/members/components/MemberAvatar";
import { useMembers } from "@/features/members/MembersProvider";
import { getBranchServices } from "@/features/attendance/data/attendance.mock";
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { resolveLeaderName } from "@/features/ministries/leader-utils";
import { getBranchMemberCount } from "../data/branches.mock";
import { EditBranchDialog } from "./BranchDialogs";

function Detail({ label, value, icon: Icon, href }) {
  const content = value || "Not provided";
  return <div className="flex gap-3 py-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p>{href && value ? <a className="break-words text-sm font-medium hover:text-primary hover:underline" href={href}>{content}</a> : <p className="break-words text-sm font-medium">{content}</p>}</div></div>;
}

export function BranchProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getBranch, ministriesForBranch } = useMinistries();
  const { members } = useMembers();
  const branch = getBranch(id);
  if (!branch) return <div className="mx-auto w-full max-w-3xl space-y-6"><Alert variant="destructive"><Building2 /><AlertTitle>Branch not found</AlertTitle><AlertDescription>This mock branch does not exist or was reset when the page refreshed.</AlertDescription></Alert><Button variant="outline" onClick={() => router.push("/ministries")}><ArrowLeft />Return to ministries</Button></div>;

  const branchMembers = members.filter((member) => member.branch === branch.name);
  const branchMinistries = ministriesForBranch(branch.id);
  const services = getBranchServices(branch.name);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader title="Branch details" description="Review branch information, leadership, ministries, and membership." actions={<><Button variant="outline" onClick={() => router.push("/ministries")}><ArrowLeft />Ministries</Button><EditBranchDialog branch={branch} /></>} />
      <Card className="overflow-hidden pt-0"><div className="h-1 bg-primary" /><CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{branch.name}</h2><Badge variant={branch.status === "Active" ? "default" : "secondary"}>{branch.status}</Badge></div><p className="text-sm text-muted-foreground">{branch.description || "No description provided."}</p></div></CardContent></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Location & contact</CardTitle><CardDescription>Where this branch is and how to reach it.</CardDescription></CardHeader><CardContent className="grid gap-x-5 sm:grid-cols-2">
          <Detail label="District" value={branch.district} icon={MapPin} />
          <Detail label="Location" value={branch.location} icon={MapPin} />
          <div className="sm:col-span-2"><Detail label="Physical address" value={branch.address} icon={MapPin} /></div>
          <Detail label="Phone" value={branch.phone} icon={Phone} href={branch.phone ? `tel:${branch.phone}` : undefined} />
          <Detail label="Email" value={branch.email} icon={Mail} href={branch.email ? `mailto:${branch.email}` : undefined} />
          <Detail label="Date established" value={branch.dateEstablished} icon={CalendarDays} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Leadership</CardTitle><CardDescription>Local branch leadership.</CardDescription></CardHeader><CardContent className="grid gap-x-5 sm:grid-cols-2">
          <Detail label="Branch leader / pastor" value={resolveLeaderName(branch.leaderKey, members)} icon={ShieldCheck} />
          <Detail label="Assistant leader" value={resolveLeaderName(branch.assistantLeaderKey, members)} icon={Users} />
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Ministries at this branch</CardTitle><CardDescription>Ministries operating here. Each ministry's overall leadership is managed from its own profile.</CardDescription></CardHeader><CardContent>
        {branchMinistries.length ? <div className="flex flex-wrap gap-2">{branchMinistries.map((ministry) => <Badge key={ministry.id} variant="secondary" asChild><Link href={`/ministries/${ministry.id}`}><Church />{ministry.name}</Link></Badge>)}</div> : <p className="text-sm text-muted-foreground">No ministries assigned to this branch yet.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Services</CardTitle><CardDescription>Services held at this branch, used by Attendance.</CardDescription></CardHeader><CardContent><div className="flex flex-wrap gap-2">{services.map((service) => <Badge key={service} variant="outline">{service}</Badge>)}</div></CardContent></Card>
      <Card><CardHeader className="flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"><div className="space-y-1"><CardTitle>Branch members</CardTitle><CardDescription>{getBranchMemberCount(branch, members)} registered member{getBranchMemberCount(branch, members) === 1 ? "" : "s"}.</CardDescription></div></CardHeader><CardContent>
        {branchMembers.length ? <div className="grid gap-3 sm:grid-cols-2">{branchMembers.map((member) => <Link key={member.id} href={`/members/${member.id}`} className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/40 hover:bg-primary/5"><MemberAvatar member={member} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.firstName} {member.lastName}</p><p className="text-xs text-muted-foreground">{member.membershipNumber}</p></div></Link>)}</div> : <p className="text-sm text-muted-foreground">No members registered at this branch yet.</p>}
      </CardContent></Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Church, Mail, MapPin, Pencil, Phone, ShieldCheck, UserCheck, UserX, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMembers } from "../MembersProvider";
import { getMemberDisplayName } from "../data/members.mock";
import { MemberAvatar } from "./MemberAvatar";
import { MemberStatusBadge } from "./MemberStatusBadge";
import { PersonAttendanceHistory } from "@/features/attendance/components/PersonAttendanceHistory";

function formatDate(value) {
  if (!value) return "Not provided";
  return new Intl.DateTimeFormat("en-UG", { dateStyle: "long" }).format(new Date(`${value}T00:00:00`));
}

function Detail({ label, value, icon: Icon, href }) {
  const content = value || "Not provided";
  return (
    <div className="flex gap-3 py-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span>
      <div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p>{href && value ? <a className="break-words text-sm font-medium hover:text-primary hover:underline" href={href}>{content}</a> : <p className="break-words text-sm font-medium">{content}</p>}</div>
    </div>
  );
}

export function MemberProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMember, updateMember } = useMembers();
  const member = getMember(id);

  if (!member) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Alert variant="destructive"><UsersRound /><AlertTitle>Member not found</AlertTitle><AlertDescription>This mock member record does not exist or was reset when the page refreshed.</AlertDescription></Alert>
        <Button asChild variant="outline"><Link href="/members"><ArrowLeft />Return to members</Link></Button>
      </div>
    );
  }

  const name = getMemberDisplayName(member);
  const nextStatus = member.status === "Active" ? "Inactive" : "Active";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Member profile"
        description="Review contact, church, and emergency information for this member."
        actions={<><Button variant="outline" onClick={() => router.push("/members")}><ArrowLeft />Members</Button><Button asChild><Link href={`/members/${member.id}/edit`}><Pencil />Edit member</Link></Button></>}
      />

      <Alert className="border-primary/20 bg-primary/5"><UsersRound /><AlertTitle>Mock member record</AlertTitle><AlertDescription>Changes to this profile are temporary and will reset when the browser is refreshed.</AlertDescription></Alert>

      <Card className="overflow-hidden">
        <div className="h-24 bg-[linear-gradient(110deg,var(--primary),var(--accent))] opacity-90" />
        <CardContent className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <MemberAvatar member={member} className="size-24 border-4 border-card text-2xl ring-0" />
            <div className="space-y-1 pb-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{name}</h2><MemberStatusBadge status={member.status} /></div><p className="text-sm text-muted-foreground">{member.membershipNumber} · {member.branch}</p></div>
          </div>
          <Button variant="outline" onClick={() => { updateMember(member.id, { status: nextStatus }); toast.success(`${name} marked ${nextStatus.toLowerCase()}.`); }}>
            {nextStatus === "Active" ? <UserCheck /> : <UserX />}Mark {nextStatus.toLowerCase()}
          </Button>
        </CardContent>
      </Card>

      <PersonAttendanceHistory personKey={`member:${member.id}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personal & contact</CardTitle><CardDescription>Identity and contact details.</CardDescription></CardHeader>
          <CardContent className="grid gap-x-5 sm:grid-cols-2">
            <Detail label="Full legal name" value={`${member.firstName} ${member.lastName}`} icon={UsersRound} />
            <Detail label="Preferred name" value={member.preferredName} icon={UsersRound} />
            <Detail label="Gender" value={member.gender} icon={UsersRound} />
            <Detail label="Date of birth" value={formatDate(member.dateOfBirth)} icon={CalendarDays} />
            <Detail label="Primary phone" value={member.primaryPhone} icon={Phone} href={`tel:${member.primaryPhone}`} />
            <Detail label="Alternative phone" value={member.alternativePhone} icon={Phone} href={member.alternativePhone ? `tel:${member.alternativePhone}` : undefined} />
            <Detail label="Email" value={member.email} icon={Mail} href={member.email ? `mailto:${member.email}` : undefined} />
            <Detail label="District" value={member.district} icon={MapPin} />
            <div className="sm:col-span-2"><Detail label="Address" value={member.address} icon={MapPin} /></div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Church information</CardTitle><CardDescription>Membership and ministry involvement.</CardDescription></CardHeader>
            <CardContent className="grid gap-x-5 sm:grid-cols-2">
              <Detail label="Membership number" value={member.membershipNumber} icon={ShieldCheck} />
              <Detail label="Church branch" value={member.branch} icon={Church} />
              <Detail label="Date joined" value={formatDate(member.dateJoined)} icon={CalendarDays} />
              <Detail label="Membership status" value={member.status} icon={UserCheck} />
              <div className="sm:col-span-2 space-y-2 py-2"><p className="text-xs font-medium text-muted-foreground">Ministry affiliations</p><div className="flex flex-wrap gap-2">{member.ministries.length ? member.ministries.map((ministry) => <Badge key={ministry} variant="secondary">{ministry}</Badge>) : <span className="text-sm font-medium">None recorded</span>}</div></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Emergency contact</CardTitle><CardDescription>Person to contact when necessary.</CardDescription></CardHeader>
            <CardContent className="grid gap-x-5 sm:grid-cols-2">
              <Detail label="Contact name" value={member.emergencyName} icon={UsersRound} />
              <Detail label="Relationship" value={member.emergencyRelationship} icon={UsersRound} />
              <Detail label="Phone number" value={member.emergencyPhone} icon={Phone} href={member.emergencyPhone ? `tel:${member.emergencyPhone}` : undefined} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

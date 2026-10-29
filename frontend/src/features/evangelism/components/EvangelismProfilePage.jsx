"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, HeartHandshake, MapPin, Pencil, Phone, ShieldAlert, UserPlus, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/MemberAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { TaskFeedbackDialog, TaskHistory } from "@/features/outreach/components/TaskDialogs";
import { useEvangelism } from "../EvangelismProvider";
import { evangelismTeam, getRecordName, getSortedEncounters } from "../data/evangelism.mock";
import { ResponseBadge } from "./EvangelismBadges";
import { AddEncounterDialog, AddEvangelismFollowUpDialog } from "./EvangelismProfileDialogs";

function Detail({ label, value, icon: Icon, href }) {
  const content = value || "Not provided";
  return <div className="flex gap-3 py-2"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0"><p className="text-xs font-medium text-muted-foreground">{label}</p>{href && value ? <a className="break-words text-sm font-medium hover:text-primary hover:underline" href={href}>{content}</a> : <p className="break-words text-sm font-medium">{content}</p>}</div></div>;
}

function workerName(id) {
  return evangelismTeam.find((worker) => worker.id === id)?.name ?? "Not recorded";
}

export function EvangelismProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getPersonTasks } = useOutreach();
  const { getRecord, getActivity, startVisitorConversion, startMemberConversion } = useEvangelism();
  const record = getRecord(id);
  if (!record) return <div className="mx-auto w-full max-w-3xl space-y-6"><Alert variant="destructive"><HeartHandshake /><AlertTitle>Record not found</AlertTitle><AlertDescription>This mock evangelism record does not exist or was reset when the page refreshed.</AlertDescription></Alert><Button variant="outline" onClick={() => router.push("/evangelism")}><ArrowLeft />Return to evangelism</Button></div>;

  const name = getRecordName(record);
  const encounters = getSortedEncounters(record);
  const latest = encounters[0];
  const personKey = `evangelism:${record.id}`;

  function registerAsVisitor() { startVisitorConversion(record.id); router.push("/visitors/new"); }
  function registerAsMember() { startMemberConversion(record.id); router.push("/members/new"); }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader title="Evangelism profile" description="Review this person's outreach history, responses, and follow-up activity." actions={<>
        <Button variant="outline" onClick={() => router.push("/evangelism")}><ArrowLeft />Evangelism</Button>
        <Button asChild variant="outline"><Link href={`/evangelism/${record.id}/edit`}><Pencil />Edit details</Link></Button>
        {record.convertedVisitorId ? <Button asChild variant="outline"><Link href={`/visitors/${record.convertedVisitorId}`}><CheckCircle2 />View visitor</Link></Button> : <Button variant="outline" onClick={registerAsVisitor}><UserPlus />Register as visitor</Button>}
        {record.convertedMemberId ? <Button asChild><Link href={`/members/${record.convertedMemberId}`}><CheckCircle2 />View member</Link></Button> : <Button onClick={registerAsMember}><UserPlus />Register as member</Button>}
      </>} />
      <Alert className="border-primary/20 bg-primary/5"><HeartHandshake /><AlertTitle>Mock evangelism record</AlertTitle><AlertDescription>Updates are temporary and reset on refresh. Registering as visitor or member reuses this person's existing information.</AlertDescription></Alert>
      <Card className="overflow-hidden pt-0"><div className="h-1 bg-primary" /><CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-col gap-4 sm:flex-row sm:items-end"><MemberAvatar member={record} className="size-24 border-4 border-card text-2xl ring-0" /><div className="space-y-1 pb-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-bold">{name}</h2><ResponseBadge response={latest?.response} /></div><p className="text-sm text-muted-foreground">{record.history.length} recorded encounter{record.history.length === 1 ? "" : "s"} · Last reached {latest?.date ?? "Not recorded"}</p></div></div><div className="flex flex-wrap gap-2"><AddEncounterDialog record={record} /><AddEvangelismFollowUpDialog record={record} /></div></CardContent></Card>
      {!record.permissionToContact ? <Alert><ShieldAlert /><AlertTitle>No communication consent recorded</AlertTitle><AlertDescription>This person is excluded from bulk campaigns. Review their consent before arranging individual contact.</AlertDescription></Alert> : null}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Personal information</CardTitle><CardDescription>Details collected during evangelism.</CardDescription></CardHeader><CardContent className="grid gap-x-5 sm:grid-cols-2">
          <Detail label="Full name" value={name} icon={Users} />
          <Detail label="Gender" value={record.gender} icon={Users} />
          <Detail label="Phone number" value={record.phone} icon={Phone} href={record.phone ? `tel:${record.phone}` : undefined} />
          <Detail label="Church branch" value={record.branch} icon={MapPin} />
          <div className="sm:col-span-2"><Detail label="District / village" value={record.districtVillage} icon={MapPin} /></div>
          <Detail label="Permission to contact" value={record.permissionToContact ? "Granted" : "Not granted"} icon={record.permissionToContact ? CheckCircle2 : ShieldAlert} />
        </CardContent></Card>
        <Card><CardHeader><CardTitle>Outreach summary</CardTitle><CardDescription>Locations and activities where this person was reached.</CardDescription></CardHeader><CardContent className="grid gap-x-5 sm:grid-cols-2">
          <Detail label="First encounter" value={encounters.at(-1)?.date} icon={CalendarDays} />
          <Detail label="Latest encounter" value={latest?.date} icon={CalendarDays} />
          <div className="sm:col-span-2 space-y-2 py-2"><p className="text-xs font-medium text-muted-foreground">Outreach locations</p><div className="flex flex-wrap gap-2">{[...new Set(encounters.map((entry) => entry.location))].map((location) => <Badge key={location} variant="secondary"><MapPin />{location}</Badge>)}</div></div>
        </CardContent></Card>
      </div>
      {record.history.some((entry) => entry.notes) ? <Card><CardHeader><CardTitle className="flex items-center gap-2"><ShieldAlert className="size-5 text-warning" />Sensitive notes</CardTitle><CardDescription>Visible in this administrator mockup. Production access must be restricted through backend permissions.</CardDescription></CardHeader><CardContent className="space-y-3">{encounters.filter((entry) => entry.notes).map((entry) => <p key={entry.id} className="rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed">{entry.date} — {entry.notes}</p>)}</CardContent></Card> : null}
      <Card><CardHeader><CardTitle>Encounter history</CardTitle><CardDescription>Every recorded encounter and its response, most recent first.</CardDescription></CardHeader><CardContent className="space-y-0">
        {encounters.map((entry) => <div key={entry.id} className="relative border-l-2 border-primary/20 pb-6 pl-5 last:pb-0"><span className="absolute -left-[7px] top-1 size-3 rounded-full bg-primary ring-4 ring-card" /><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{entry.location}{getActivity(entry.activityId) ? ` · ${getActivity(entry.activityId).name}` : ""}</p><p className="text-sm text-muted-foreground">Evangelized by {workerName(entry.evangelizedBy)}</p><ResponseBadge className="mt-1" response={entry.response} /></div><Badge variant="outline">{entry.date}</Badge></div></div>)}
      </CardContent></Card>
      <Card id="follow-ups"><CardHeader className="flex-col items-start justify-between sm:flex-row"><div className="space-y-1"><CardTitle>Follow-up assignments</CardTitle><CardDescription>Phone calls, physical visits, and worker feedback, linked to the Follow-ups module.</CardDescription></div><AddEvangelismFollowUpDialog record={record} /></CardHeader><CardContent className="space-y-5">
        {getPersonTasks(personKey).map((task) => <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-semibold">{task.method} · {task.scheduledDate}</p><p className="text-xs text-muted-foreground">{task.reason}</p></div><TaskFeedbackDialog task={task} /></div>)}
        <TaskHistory tasks={getPersonTasks(personKey)} />
      </CardContent></Card>
    </div>
  );
}

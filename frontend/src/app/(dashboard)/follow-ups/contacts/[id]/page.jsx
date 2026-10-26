"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useOutreach } from "@/features/outreach/OutreachProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskAssignmentDialog, TaskHistory } from "@/features/outreach/components/TaskDialogs";

export default function ContactPage() {
  const { id } = useParams(); const { getPerson, getPersonTasks } = useOutreach(); const person = getPerson(`evangelism:${id}`);
  if (!person) return <p>Contact not found. <Link href="/follow-ups" className="underline">Return to follow-ups</Link></p>;
  return <div className="mx-auto w-full max-w-4xl space-y-6"><PageHeader title={person.name} description="Mock evangelism contact · temporary demonstration record" actions={<TaskAssignmentDialog personKey={person.key} />} /><Card><CardHeader><CardTitle>Contact details</CardTitle></CardHeader><CardContent className="space-y-2"><p>{person.phone}</p><p>{person.email || "No email recorded"}</p><p>{person.address}</p><p>{person.branch}</p></CardContent></Card><Card><CardHeader><CardTitle>Contact attempts & feedback</CardTitle></CardHeader><CardContent><TaskHistory tasks={getPersonTasks(person.key)} /></CardContent></Card><Button asChild variant="outline"><Link href="/follow-ups">Back to follow-ups</Link></Button></div>;
}

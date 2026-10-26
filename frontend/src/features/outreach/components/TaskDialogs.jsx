"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardPlus, MessageSquareText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useOutreach } from "../OutreachProvider";
import { followUpMethods, taskStatuses, workers } from "../data/outreach.mock";
import { FormControl } from "./FormControls";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Kampala", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const taskSchema = z.object({ personKey: z.string().min(1, "Choose a person."), workerId: z.string().min(1, "Assign a worker."), method: z.enum(followUpMethods), scheduledDate: z.string().min(1, "Choose a date."), priority: z.enum(["Normal", "High", "Urgent"]), reason: z.string().trim().min(1, "Enter a reason.") });
const feedbackSchema = z.object({ reached: z.enum(["Yes", "No"]), status: z.enum(taskStatuses), outcome: z.string().trim().min(1, "Describe the outcome."), notes: z.string().trim(), anotherFollowUp: z.boolean(), nextDate: z.string() }).superRefine((values, context) => {
  if (values.anotherFollowUp && !values.nextDate) context.addIssue({ code: "custom", path: ["nextDate"], message: "Choose the next follow-up date." });
  if (values.status === "Completed" && values.reached !== "Yes") context.addIssue({ code: "custom", path: ["status"], message: "Choose Unable to Reach or In Progress when the person was not reached." });
});

export function TaskAssignmentDialog({ personKey, workerId, onCreated }) {
  const [open, setOpen] = useState(false);
  const { people, getPerson, addTask } = useOutreach();
  const defaults = () => ({ personKey: personKey ?? "", workerId: workerId ?? "", method: "Phone Call", scheduledDate: today(), priority: "Normal", reason: "" });
  const form = useForm({ resolver: zodResolver(taskSchema), defaultValues: defaults() });
  const person = getPerson(form.watch("personKey"));
  function submit(values) {
    if (!getPerson(values.personKey)) { form.setError("personKey", { message: "Choose an existing record." }); return; }
    addTask({ ...values, status: "Pending" });
    toast.success("Mock follow-up assignment created."); setOpen(false); form.reset(defaults()); onCreated?.();
  }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}><DialogTrigger asChild><Button><ClipboardPlus />Assign follow-up</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Assign individual follow-up</DialogTitle><DialogDescription>Arrange a phone call or physical visit. Assignments are temporary mock records.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
        <FormControl control={form.control} name="personKey" label="Person" required options={people.map((item) => ({ value: item.key, label: `${item.name} · ${item.type}` }))} />
        {person ? <div className="rounded-lg border bg-muted/30 p-3 text-sm"><Link href={person.href} className="font-semibold text-primary hover:underline">{person.name}</Link><p>{person.phone || "Phone not recorded"}</p><p className="text-muted-foreground">{person.address || "Address not recorded"}</p></div> : null}
        <FormControl control={form.control} name="workerId" label="Assigned worker" required options={workers.map((worker) => ({ value: worker.id, label: `${worker.name} · ${worker.role}` }))} />
        <div className="grid gap-4 sm:grid-cols-2"><FormControl control={form.control} name="method" label="Method" required options={followUpMethods} /><FormControl control={form.control} name="scheduledDate" label="Scheduled date" required type="date" /></div>
        <FormControl control={form.control} name="priority" label="Priority" options={["Normal", "High", "Urgent"]} />
        <FormControl control={form.control} name="reason" label="Reason" multiline required />
        <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create assignment</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>;
}

export function TaskFeedbackDialog({ task }) {
  const [open, setOpen] = useState(false);
  const { submitFeedback, addTask, getPerson } = useOutreach();
  const defaults = { reached: "", status: "In Progress", outcome: "", notes: "", anotherFollowUp: false, nextDate: "" };
  const form = useForm({ resolver: zodResolver(feedbackSchema), defaultValues: defaults });
  function submit(values) {
    submitFeedback(task.id, values);
    if (values.anotherFollowUp) addTask({ personKey: task.personKey, workerId: task.workerId, method: task.method, scheduledDate: values.nextDate, priority: task.priority, reason: `Continuation: ${values.outcome}`, status: "Pending", parentTaskId: task.id });
    setOpen(false); form.reset(defaults); toast.success("Mock feedback recorded.");
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline" size="sm"><MessageSquareText />Feedback</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Record follow-up feedback</DialogTitle><DialogDescription>{getPerson(task.personKey)?.name} · {task.method} · {workers.find((worker) => worker.id === task.workerId)?.name}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
    <FormControl control={form.control} name="reached" label="Was the person reached?" required options={["Yes", "No"]} />
    <FormControl control={form.control} name="status" label="Progress" required options={taskStatuses} />
    <FormControl control={form.control} name="outcome" label="Outcome" required multiline />
    <FormControl control={form.control} name="notes" label="Relevant notes" multiline />
    <Controller name="anotherFollowUp" control={form.control} render={({ field }) => <div className="flex items-center gap-2"><Checkbox id="another-follow-up" checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /><Label htmlFor="another-follow-up">Another follow-up is necessary</Label></div>} />
    {form.watch("anotherFollowUp") ? <FormControl control={form.control} name="nextDate" label="Next follow-up date" required type="date" /> : null}
    <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save feedback</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

export function TaskHistory({ tasks }) {
  const entries = tasks.flatMap((task) => task.history.map((entry) => ({ ...entry, method: task.method, reason: task.reason, taskId: task.id }))).sort((a, b) => new Date(b.date) - new Date(a.date));
  return entries.length ? <ol className="space-y-5">{entries.map((entry) => <li key={entry.id} className="border-l-2 border-primary/20 pl-4"><p className="text-sm font-semibold">{entry.method} · {workers.find((worker) => worker.id === entry.workerId)?.name}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-UG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Kampala" }).format(new Date(entry.date))} · {entry.status}</p><p className="mt-2 text-sm">{entry.outcome}</p><p className="text-xs text-muted-foreground">Reached: {entry.reached}{entry.anotherFollowUp ? ` · Next follow-up: ${entry.nextDate}` : ""}</p>{entry.notes ? <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{entry.notes}</p> : null}</li>)}</ol> : <p className="text-sm text-muted-foreground">No contact attempts or feedback recorded yet.</p>;
}

export function TaskHistoryDialog({ task }) {
  return <Dialog><DialogTrigger asChild><Button variant="ghost" size="sm">History</Button></DialogTrigger><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Assignment history</DialogTitle><DialogDescription>{task.reason} · Scheduled {task.scheduledDate}</DialogDescription></DialogHeader><TaskHistory tasks={[task]} /></DialogContent></Dialog>;
}

"use client";

import { format } from "date-fns";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TaskAssignmentDialog } from "@/features/outreach/components/TaskDialogs";
import { useEvangelism } from "../EvangelismProvider";
import { evangelismTeam, responseOptions } from "../data/evangelism.mock";

const encounterSchema = z.object({ date: z.string().min(1, "Evangelism date is required."), location: z.string().trim().min(1, "Outreach location is required."), activityId: z.string(), evangelizedBy: z.string().min(1, "Select who evangelized this person."), response: z.string().min(1, "Select the person's response."), notes: z.string().trim() });

function defaults() {
  return { date: format(new Date(), "yyyy-MM-dd"), location: "", activityId: "", evangelizedBy: "", response: "", notes: "" };
}

export function AddEncounterDialog({ record }) {
  const [open, setOpen] = useState(false);
  const { activities, addEncounter } = useEvangelism();
  const form = useForm({ resolver: zodResolver(encounterSchema), defaultValues: defaults() });

  function submit(values) {
    addEncounter(record.id, values);
    toast.success("Additional encounter recorded.");
    setOpen(false);
    form.reset(defaults());
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}>
      <DialogTrigger asChild><Button variant="outline"><CalendarPlus />Add encounter</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Record additional encounter</DialogTitle><DialogDescription>Record another time this person was reached. Their response is not assumed from any previous encounter.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="encounter-date">Evangelism date <span className="text-destructive">*</span></FieldLabel><Input {...field} id="encounter-date" type="date" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
            <Controller name="location" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="encounter-location">Outreach location <span className="text-destructive">*</span></FieldLabel><Input {...field} id="encounter-location" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          </div>
          <Controller name="evangelizedBy" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Evangelized by <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a worker" /></SelectTrigger><SelectContent>{evangelismTeam.map((worker) => <SelectItem key={worker.id} value={worker.id}>{worker.name} · {worker.role}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          <Controller name="activityId" control={form.control} render={({ field }) => <Field><FieldLabel>Outreach activity</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue placeholder="No linked activity" /></SelectTrigger><SelectContent>{activities.map((activity) => <SelectItem key={activity.id} value={activity.id}>{activity.name} · {activity.date}</SelectItem>)}</SelectContent></Select></Field>} />
          <Controller name="response" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Response <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a response" /></SelectTrigger><SelectContent>{responseOptions.map((response) => <SelectItem key={response} value={response}>{response}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          <Controller name="notes" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="encounter-notes">Notes</FieldLabel><Textarea {...field} id="encounter-notes" placeholder="Optional encounter notes" /></Field>} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save encounter</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddEvangelismFollowUpDialog({ record }) {
  return <TaskAssignmentDialog personKey={`evangelism:${record.id}`} />;
}

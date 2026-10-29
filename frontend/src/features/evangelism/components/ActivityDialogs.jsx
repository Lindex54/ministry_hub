"use client";

import { format } from "date-fns";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEvangelism } from "../EvangelismProvider";
import { branches, evangelismTeam, outreachActivityTypes } from "../data/evangelism.mock";

const activitySchema = z.object({
  name: z.string().trim().min(1, "Activity name is required."),
  type: z.string().min(1, "Select an outreach type."),
  date: z.string().min(1, "Choose a date."),
  location: z.string().trim().min(1, "Outreach location is required."),
  branch: z.string().min(1, "Select the organizing branch."),
  team: z.array(z.string()).min(1, "Select at least one team member."),
  headcount: z.coerce.number().min(0, "Headcount cannot be negative."),
  notes: z.string().trim(),
});

function defaults(branch) {
  return { name: "", type: "", date: format(new Date(), "yyyy-MM-dd"), location: "", branch: branch !== "all" ? branch : "", team: [], headcount: 0, notes: "" };
}

export function NewActivityDialog({ branch = "all" }) {
  const [open, setOpen] = useState(false);
  const { addActivity } = useEvangelism();
  const form = useForm({ resolver: zodResolver(activitySchema), defaultValues: defaults(branch) });

  function submit(values) {
    addActivity(values);
    toast.success(`${values.name} was added to outreach activities.`);
    setOpen(false);
    form.reset(defaults(branch));
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults(branch)); }}>
      <DialogTrigger asChild><Button variant="outline"><CalendarPlus />New activity</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Register outreach activity</DialogTitle><DialogDescription>Door-to-door, street, campus, community outreach, or a crusade. Headcount should exclude anyone registered individually below.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
          <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="activity-name">Activity name <span className="text-destructive">*</span></FieldLabel><Input {...field} id="activity-name" placeholder="e.g. Kawempe Door-to-Door Outreach" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller name="type" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Outreach type <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{outreachActivityTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
            <Controller name="date" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="activity-date">Date <span className="text-destructive">*</span></FieldLabel><Input {...field} id="activity-date" type="date" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          </div>
          <Controller name="location" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="activity-location">Location <span className="text-destructive">*</span></FieldLabel><Input {...field} id="activity-location" placeholder="e.g. Kawempe Trading Centre" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller name="branch" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Organizing branch <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select branch" /></SelectTrigger><SelectContent>{branches.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
            <Controller name="headcount" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="activity-headcount">People reached (headcount)</FieldLabel><Input {...field} id="activity-headcount" type="number" min="0" aria-invalid={fieldState.invalid} /><FieldDescription>Only people whose personal information was not collected.</FieldDescription>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          </div>
          <Controller name="team" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Evangelism team <span className="text-destructive">*</span></FieldLabel><div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">{evangelismTeam.map((worker) => <label key={worker.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={field.value.includes(worker.id)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, worker.id] : field.value.filter((item) => item !== worker.id))} />{worker.name} · {worker.role}</label>)}</div>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
          <Controller name="notes" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="activity-notes">Notes</FieldLabel><Textarea {...field} id="activity-notes" placeholder="Optional notes about this activity" /></Field>} />
          <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save activity</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

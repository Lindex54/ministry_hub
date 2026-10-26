"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarPlus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormControl } from "@/features/outreach/components/FormControls";
import { useAttendance } from "../AttendanceProvider";
import { branches, branchServices } from "../data/attendance.mock";
import { useVisitors } from "@/features/visitors/VisitorsProvider";

const schema = z.object({ branch: z.enum(branches), service: z.string().min(1, "Select a service."), date: z.string().min(1, "Choose a date."), expected: z.array(z.string()) }).refine((values) => branchServices[values.branch].includes(values.service), { path: ["service"], message: "Select a service available at this branch." });

export function CreateOccurrenceDialog() {
  const [open, setOpen] = useState(false);
  const { scope, people, createOccurrence } = useAttendance();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { ...scope, expected: [] } });
  const branch = form.watch("branch");
  function submit(values) { const result = createOccurrence(values); toast.success(result.existing ? "Opened the existing register for this occurrence." : "Independent attendance register created."); setOpen(false); }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset({ ...scope, expected: [] }); }}><DialogTrigger asChild><Button variant="outline"><CalendarPlus />New service register</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Create service occurrence</DialogTitle><DialogDescription>A branch, service, and date identify one independent register.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
    <Controller name="branch" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="new-register-branch">Church branch</FieldLabel><Select value={field.value} onValueChange={(value) => { field.onChange(value); form.setValue("service", branchServices[value][0]); form.setValue("expected", []); }}><SelectTrigger id="new-register-branch" className="w-full"><SelectValue /></SelectTrigger><SelectContent>{branches.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>} />
    <FormControl control={form.control} name="service" label="Service" required options={branchServices[branch]} />
    <FormControl control={form.control} name="date" label="Service date" required type="date" />
    <Controller name="expected" control={form.control} render={({ field }) => <Field><FieldLabel>Expected members (optional)</FieldLabel><p className="text-xs text-muted-foreground">Select only members expected at this occurrence. Unselected people are never automatically absent.</p><div className="max-h-44 space-y-3 overflow-y-auto rounded-lg border p-3">{people.filter((person) => person.category === "Member" && person.branch === branch).map((person) => <Label key={person.key} className="flex items-center gap-2"><Checkbox checked={field.value.includes(person.key)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, person.key] : field.value.filter((key) => key !== person.key))} />{person.name}</Label>)}</div></Field>} />
    <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Create or open register</Button></DialogFooter>
  </form></DialogContent></Dialog>;
}

export function AddAttendeeDialog() {
  const [open, setOpen] = useState(false); const router = useRouter();
  const { selectedOccurrence, startRegistration } = useAttendance();
  const { cancelMemberConversion } = useVisitors();
  function register(type) { startRegistration(selectedOccurrence.id); cancelMemberConversion(); setOpen(false); router.push(type === "Member" ? "/members/new" : "/visitors/new"); }
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button disabled={!selectedOccurrence}><UserPlus />Add new person</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add new attendee</DialogTitle><DialogDescription>Search the register first to avoid duplicates. Use the existing registration form; after saving, you will return here to mark attendance.</DialogDescription></DialogHeader><div className="grid gap-3 sm:grid-cols-2"><Button variant="outline" onClick={() => register("Member")}>Register member</Button><Button onClick={() => register("Visitor")}>Register visitor</Button></div></DialogContent></Dialog>;
}

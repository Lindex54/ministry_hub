"use client";

import { format } from "date-fns";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMembers } from "@/features/members/MembersProvider";
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { leaderOptions } from "@/features/ministries/leader-utils";
import { branchStatuses } from "../data/branches.mock";

function isUgandanPhone(value) {
  if (!value) return true;
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(?:\+256|0)(?:2|3|7)\d{8}$/.test(normalized);
}

const branchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required."),
  location: z.string().trim(),
  district: z.string().trim(),
  address: z.string().trim(),
  phone: z.string().trim().refine(isUgandanPhone, "Enter a valid Ugandan phone number."),
  email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email address."),
  dateEstablished: z.string(),
  leaderKey: z.string().min(1, "Select a branch leader."),
  assistantLeaderKey: z.string(),
  description: z.string().trim(),
  status: z.string().min(1),
  ministryIds: z.array(z.string()),
});

function defaults(branch, ministriesForBranch) {
  return branch ? { name: branch.name, location: branch.location, district: branch.district, address: branch.address, phone: branch.phone, email: branch.email, dateEstablished: branch.dateEstablished, leaderKey: branch.leaderKey, assistantLeaderKey: branch.assistantLeaderKey, description: branch.description, status: branch.status, ministryIds: ministriesForBranch } : { name: "", location: "", district: "", address: "", phone: "", email: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), leaderKey: "", assistantLeaderKey: "", description: "", status: "Active", ministryIds: [] };
}

function BranchFormFields({ form }) {
  const { members } = useMembers();
  const { ministries, addMinistry } = useMinistries();
  const options = leaderOptions(members);
  const [newMinistryName, setNewMinistryName] = useState("");

  function addNewMinistry(field) {
    const name = newMinistryName.trim();
    if (!name) return;
    const existing = ministries.find((ministry) => ministry.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!field.value.includes(existing.id)) field.onChange([...field.value, existing.id]);
      setNewMinistryName("");
      return;
    }
    const ministry = addMinistry({ name, description: "", leaderId: "", assistantLeaderId: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), status: "Active", branchIds: [] });
    field.onChange([...field.value, ministry.id]);
    setNewMinistryName("");
    toast.success(`${name} was added as a ministry. Assign its leader from the Ministries tab.`);
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="branch-name">Branch name <span className="text-destructive">*</span></FieldLabel><Input {...field} id="branch-name" placeholder="e.g. Entebbe Branch" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="district" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-district">District</FieldLabel><Input {...field} id="branch-district" placeholder="e.g. Wakiso" /></Field>} />
      </div>
      <Controller name="location" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-location">Location</FieldLabel><Input {...field} id="branch-location" placeholder="Town or area" /></Field>} />
      <Controller name="address" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-address">Physical address</FieldLabel><Textarea {...field} id="branch-address" placeholder="Street, landmark, or detailed address" /></Field>} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="phone" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="branch-phone">Contact phone</FieldLabel><Input {...field} id="branch-phone" type="tel" placeholder="0772 123 456" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="email" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="branch-email">Email</FieldLabel><Input {...field} id="branch-email" type="email" placeholder="Optional" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="leaderKey" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Branch leader / pastor <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a member or worker" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="assistantLeaderKey" control={form.control} render={({ field }) => <Field><FieldLabel>Assistant leader</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue placeholder="None selected" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></Field>} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="dateEstablished" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-date">Date established</FieldLabel><Input {...field} id="branch-date" type="date" /></Field>} />
        <Controller name="status" control={form.control} render={({ field }) => <Field><FieldLabel>Status</FieldLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{branchStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>} />
      </div>
      <Controller name="description" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-description">Description</FieldLabel><Textarea {...field} id="branch-description" placeholder="Optional notes about this branch" /></Field>} />
      <Controller name="ministryIds" control={form.control} render={({ field }) => <Field><FieldLabel>Ministries operating at this branch</FieldLabel>
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">{ministries.map((ministry) => <label key={ministry.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={field.value.includes(ministry.id)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, ministry.id] : field.value.filter((id) => id !== ministry.id))} />{ministry.name}</label>)}</div>
          <div className="flex gap-2 border-t pt-3">
            <Input value={newMinistryName} onChange={(event) => setNewMinistryName(event.target.value)} placeholder="Add a new ministry by name" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addNewMinistry(field); } }} />
            <Button type="button" variant="outline" onClick={() => addNewMinistry(field)}><Plus />Add</Button>
          </div>
          <p className="text-xs text-muted-foreground">Not finding a ministry? Add it here and assign its leader later from the Ministries tab.</p>
        </div>
      </Field>} />
    </>
  );
}

export function NewBranchDialog() {
  const [open, setOpen] = useState(false);
  const { addBranch, setBranchMinistries } = useMinistries();
  const form = useForm({ resolver: zodResolver(branchSchema), defaultValues: defaults() });
  function submit({ ministryIds, ...values }) {
    const branch = addBranch(values);
    setBranchMinistries(branch.id, ministryIds);
    toast.success(`${values.name} was added to the mock church branches directory.`);
    setOpen(false); form.reset(defaults());
  }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}>
    <DialogTrigger asChild><Button><Plus />New branch</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Register church branch</DialogTitle><DialogDescription>Select existing ministries that operate here instead of recreating them.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate><BranchFormFields form={form} /><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save branch</Button></DialogFooter></form>
    </DialogContent>
  </Dialog>;
}

export function EditBranchDialog({ branch }) {
  const [open, setOpen] = useState(false);
  const { updateBranch, setBranchMinistries, ministriesForBranch } = useMinistries();
  const form = useForm({ resolver: zodResolver(branchSchema), defaultValues: defaults(branch, ministriesForBranch(branch.id).map((item) => item.id)) });
  function submit({ ministryIds, ...values }) {
    updateBranch(branch.id, values);
    setBranchMinistries(branch.id, ministryIds);
    toast.success(`${values.name} was updated.`);
    setOpen(false);
  }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults(branch, ministriesForBranch(branch.id).map((item) => item.id))); }}>
    <DialogTrigger asChild><Button variant="outline"><Pencil />Edit branch</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Edit {branch.name}</DialogTitle><DialogDescription>Changes apply immediately for this demonstration session only.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate><BranchFormFields form={form} /><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save changes</Button></DialogFooter></form>
    </DialogContent>
  </Dialog>;
}

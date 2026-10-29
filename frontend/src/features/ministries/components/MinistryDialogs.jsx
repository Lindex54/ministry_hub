"use client";

import { format } from "date-fns";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Pencil, Plus, UsersRound } from "lucide-react";
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
import { useMinistries } from "../MinistriesProvider";
import { ministryStatuses } from "../data/ministries.mock";

const ministrySchema = z.object({
  name: z.string().trim().min(1, "Ministry name is required."),
  description: z.string().trim(),
  leaderId: z.string().min(1, "Select a ministry leader."),
  assistantLeaderId: z.string(),
  dateEstablished: z.string(),
  status: z.string().min(1),
  branchIds: z.array(z.string()),
});

function defaults(ministry) {
  return ministry ? { name: ministry.name, description: ministry.description, leaderId: ministry.leaderId, assistantLeaderId: ministry.assistantLeaderId, dateEstablished: ministry.dateEstablished, status: ministry.status, branchIds: ministry.branchIds } : { name: "", description: "", leaderId: "", assistantLeaderId: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), status: "Active", branchIds: [] };
}

function MinistryFormFields({ form }) {
  const { members } = useMembers();
  const { branches, addBranch } = useMinistries();
  const [newBranchName, setNewBranchName] = useState("");

  function addNewBranch(field) {
    const name = newBranchName.trim();
    if (!name) return;
    const existing = branches.find((branch) => branch.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      if (!field.value.includes(existing.id)) field.onChange([...field.value, existing.id]);
      setNewBranchName("");
      return;
    }
    const branch = addBranch({ name, location: "", district: "", address: "", phone: "", email: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), leaderKey: "", assistantLeaderKey: "", description: "", status: "Active" });
    field.onChange([...field.value, branch.id]);
    setNewBranchName("");
    toast.success(`${name} was added as a church branch. Complete its full details from the Church Branches tab.`);
  }

  return (
    <>
      <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="ministry-name">Ministry name <span className="text-destructive">*</span></FieldLabel><Input {...field} id="ministry-name" placeholder="e.g. Worship" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
      <Controller name="description" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="ministry-description">Description</FieldLabel><Textarea {...field} id="ministry-description" placeholder="What this ministry does" /></Field>} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="leaderId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Ministry leader <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a member" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="assistantLeaderId" control={form.control} render={({ field }) => <Field><FieldLabel>Assistant leader</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue placeholder="None selected" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>)}</SelectContent></Select></Field>} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller name="dateEstablished" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="ministry-date">Date established</FieldLabel><Input {...field} id="ministry-date" type="date" /></Field>} />
        <Controller name="status" control={form.control} render={({ field }) => <Field><FieldLabel>Status</FieldLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{ministryStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></Field>} />
      </div>
      <Controller name="branchIds" control={form.control} render={({ field }) => <Field><FieldLabel>Operating church branches</FieldLabel>
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="grid gap-3 sm:grid-cols-2">{branches.map((branch) => <label key={branch.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={field.value.includes(branch.id)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, branch.id] : field.value.filter((id) => id !== branch.id))} />{branch.name}</label>)}</div>
          <div className="flex gap-2 border-t pt-3">
            <Input value={newBranchName} onChange={(event) => setNewBranchName(event.target.value)} placeholder="Add a new branch by name" onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addNewBranch(field); } }} />
            <Button type="button" variant="outline" onClick={() => addNewBranch(field)}><Plus />Add</Button>
          </div>
          <p className="text-xs text-muted-foreground">Not finding a branch? Add it here and fill in its full details later from the Church Branches tab.</p>
        </div>
      </Field>} />
    </>
  );
}

export function NewMinistryDialog() {
  const [open, setOpen] = useState(false);
  const { addMinistry } = useMinistries();
  const form = useForm({ resolver: zodResolver(ministrySchema), defaultValues: defaults() });
  function submit(values) { addMinistry(values); toast.success(`${values.name} was added to the mock ministries directory.`); setOpen(false); form.reset(defaults()); }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}>
    <DialogTrigger asChild><Button><Plus />New ministry</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Register ministry</DialogTitle><DialogDescription>Create the ministry once, then assign it to the branches where it operates.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate><MinistryFormFields form={form} /><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save ministry</Button></DialogFooter></form>
    </DialogContent>
  </Dialog>;
}

export function EditMinistryDialog({ ministry }) {
  const [open, setOpen] = useState(false);
  const { updateMinistry } = useMinistries();
  const form = useForm({ resolver: zodResolver(ministrySchema), defaultValues: defaults(ministry) });
  function submit(values) { updateMinistry(ministry.id, values); toast.success(`${values.name} was updated.`); setOpen(false); }
  return <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults(ministry)); }}>
    <DialogTrigger asChild><Button variant="outline"><Pencil />Edit ministry</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Edit {ministry.name}</DialogTitle><DialogDescription>Changes apply immediately for this demonstration session only.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate><MinistryFormFields form={form} /><DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save changes</Button></DialogFooter></form>
    </DialogContent>
  </Dialog>;
}

export function AssignMinistryMembersDialog({ ministry }) {
  const [open, setOpen] = useState(false);
  const { members, updateMember } = useMembers();
  const [selected, setSelected] = useState([]);
  function openDialog(value) {
    setOpen(value);
    if (value) setSelected(members.filter((member) => member.ministries.includes(ministry.name)).map((member) => member.id));
  }
  function save() {
    for (const member of members) {
      const shouldInclude = selected.includes(member.id);
      const alreadyIncluded = member.ministries.includes(ministry.name);
      if (shouldInclude === alreadyIncluded) continue;
      const ministries = shouldInclude ? [...member.ministries.filter((name) => name !== "None"), ministry.name] : member.ministries.filter((name) => name !== ministry.name);
      updateMember(member.id, { ministries: ministries.length ? ministries : ["None"] });
    }
    toast.success(`Membership for ${ministry.name} was updated.`);
    setOpen(false);
  }
  return <Dialog open={open} onOpenChange={openDialog}>
    <DialogTrigger asChild><Button variant="outline"><UsersRound />Manage members</Button></DialogTrigger>
    <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Manage {ministry.name} members</DialogTitle><DialogDescription>Select every member who belongs to this ministry. Members can belong to more than one ministry.</DialogDescription></DialogHeader>
      <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border p-3">
        {members.map((member) => <label key={member.id} className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 text-sm hover:bg-muted/50"><Checkbox checked={selected.includes(member.id)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, member.id] : current.filter((id) => id !== member.id))} />{member.firstName} {member.lastName} <span className="text-xs text-muted-foreground">· {member.branch}</span></label>)}
      </div>
      <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="button" onClick={save}>Save members</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}

"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, ChevronDown, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DataTable } from "@/components/tables/DataTable";
import { serviceOptions } from "@/features/visitors/data/visitors.mock";
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { useOutreach } from "../OutreachProvider";
import { events } from "../data/outreach.mock";
import { personalizeMessage, resolveRecipients } from "../outreach-utils.mjs";
import { FormControl } from "./FormControls";

const selectionSchema = z.object({ types: z.array(z.string()), branches: z.array(z.string()), ministries: z.array(z.string()), services: z.array(z.string()), events: z.array(z.string()), individuals: z.array(z.string()) });
const campaignSchema = z.object({ title: z.string().trim().min(1, "Enter a campaign name."), channel: z.literal("email"), subject: z.string().trim(), body: z.string().trim().min(1, "Enter a message."), timing: z.literal("now"), scheduledAt: z.string(), association: z.string(), selection: selectionSchema }).superRefine((values, context) => {
  if (values.channel === "email" && !values.subject) context.addIssue({ code: "custom", path: ["subject"], message: "Enter an email subject." });
});

function GroupSelector({ label, options, values, onChange }) {
  return <Field><FieldLabel>{label}</FieldLabel><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="outline" className="w-full justify-between font-normal"><span>{values.length ? `${values.length} selected` : `Choose ${label.toLowerCase()}`}</span><ChevronDown className="size-4 opacity-50" /></Button></DropdownMenuTrigger><DropdownMenuContent className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto">{options.map((option) => { const value = option.value ?? option; return <DropdownMenuCheckboxItem key={value} checked={values.includes(value)} onSelect={(event) => event.preventDefault()} onCheckedChange={(checked) => onChange(checked ? [...values, value] : values.filter((item) => item !== value))}>{option.label ?? option}</DropdownMenuCheckboxItem>; })}</DropdownMenuContent></DropdownMenu></Field>;
}

export function CampaignComposer() {
  const { people, addCampaign, templates: allTemplates, addTemplate } = useOutreach();
  const { branchNames, ministryNames } = useMinistries();
  const [preview, setPreview] = useState(null);
  const [template, setTemplate] = useState("blank");
  const [sending, setSending] = useState(false);
  const form = useForm({ resolver: zodResolver(campaignSchema), defaultValues: { title: "", channel: "email", subject: "", body: "", timing: "now", scheduledAt: "", association: "none", selection: { types: [], branches: [], ministries: [], services: [], events: [], individuals: [] } } });
  const values = form.watch();
  const recipients = resolveRecipients(people, values.selection, values.channel, events);
  const [showExcluded, setShowExcluded] = useState(false);

  function applyTemplate(id) {
    setTemplate(id);
    const item = allTemplates.find((candidate) => candidate.id === id);
    if (item) { form.setValue("subject", item.subject, { shouldValidate: true }); form.setValue("body", item.body, { shouldValidate: true }); }
  }
  function openPreview(data) {
    if (!recipients.eligible.length) { toast.error("Choose at least one eligible recipient before previewing."); return; }
    setPreview(data);
  }
  async function confirm() {
    const result = resolveRecipients(people, preview.selection, preview.channel, events);
    if (!result.eligible.length) { toast.error("No eligible recipients remain."); return; }
    setSending(true);
    try {
      const campaign = await addCampaign({
        title: preview.title,
        subject: preview.subject,
        body: preview.body,
        association: preview.association,
        recipients: result.eligible.map((person) => ({
          personType: person.type === "Member" ? "member" : "visitor",
          personId: person.id,
        })),
      });
      if (campaign.status === "Sent") toast.success(`Email sent to ${campaign.recipientCount} recipient${campaign.recipientCount === 1 ? "" : "s"}.`);
      else if (campaign.status === "Partially sent") toast.warning("Some emails could not be delivered. Review campaign history for details.");
      else toast.error("The SMTP server did not deliver any emails. Review campaign history for details.");
      setPreview(null);
      form.reset();
      setTemplate("blank");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  }
  const individualColumns = [
    { id: "select", enableSorting: false, header: "Select", cell: ({ row }) => <Checkbox checked={values.selection.individuals.includes(row.original.key)} aria-label={`Select ${row.original.name}`} onCheckedChange={(checked) => form.setValue("selection.individuals", checked ? [...values.selection.individuals, row.original.key] : values.selection.individuals.filter((key) => key !== row.original.key))} /> },
    { accessorKey: "name", header: "Person" }, { accessorKey: "type", header: "Source" },
    { accessorKey: "phone", header: "Phone" }, { accessorKey: "email", header: "Email" },
  ];
  const eligibleColumns = [{ accessorKey: "name", header: "Recipient" }, { id: "destination", header: "Destination", accessorFn: (person) => values.channel === "sms" ? person.phone : person.email }];
  return <form className="space-y-6" onSubmit={form.handleSubmit(openPreview)} noValidate>
    <Card><CardHeader className="border-b"><CardTitle>Compose campaign</CardTitle><CardDescription>Select a template or write a message for your chosen audience.</CardDescription></CardHeader><CardContent className="grid gap-5 md:grid-cols-2">
      <FormControl control={form.control} name="title" label="Campaign name" required />
      <FormControl control={form.control} name="channel" label="Channel" required options={[{ value: "email", label: "Email (SMTP)" }]} />
      <Field><FieldLabel>Message template</FieldLabel><Select value={template} onValueChange={applyTemplate}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="blank">Write your own message</SelectItem>{allTemplates.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></Field>
      <FormControl control={form.control} name="association" label="Associated service or event (optional)" options={[{ value: "none", label: "No association" }, ...serviceOptions.map((service) => ({ value: `service:${service}`, label: service })), ...events.map((event) => ({ value: `event:${event.id}`, label: `${event.name} · ${event.date}` }))]} />
      {values.channel === "email" ? <div className="md:col-span-2"><FormControl control={form.control} name="subject" label="Email subject" required /></div> : null}
      <div className="md:col-span-2 space-y-3"><FormControl control={form.control} name="body" label="Message" required multiline rows={5} /><p className="text-xs text-muted-foreground">Use {"{{name}}"} to personalize the greeting. {values.body.length} characters. Email previews use plain text.</p><Button type="button" variant="outline" size="sm" disabled={!values.title.trim() || !values.body.trim()} onClick={() => { addTemplate({ name: values.title.trim(), subject: values.subject, body: values.body }); toast.success("Template saved for this session."); }}><Save />Save as template</Button></div>
    </CardContent></Card>
    <Card><CardHeader className="border-b"><CardTitle>Select recipients</CardTitle><CardDescription>Selections are combined. Overlapping groups and duplicate contact destinations are counted once. Service groups use recorded mock attendance; event groups use mock invitation lists.</CardDescription></CardHeader><CardContent className="space-y-5">
      <Controller name="selection" control={form.control} render={({ field }) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[{ key: "types", label: "Record groups", options: ["Member", "Visitor"] }, { key: "branches", label: "Church branches", options: branchNames }, { key: "ministries", label: "Ministries", options: ministryNames.filter((ministry) => ministry !== "None") }, { key: "services", label: "Services", options: serviceOptions }, { key: "events", label: "Upcoming events", options: events.map((event) => ({ value: event.id, label: `${event.name} · ${event.date}` })) }].map((group) => <GroupSelector key={group.key} label={group.label} options={group.options} values={field.value[group.key]} onChange={(next) => field.onChange({ ...field.value, [group.key]: next })} />)}
      </div>} />
      <div className="rounded-lg border bg-muted/20 p-4 text-sm"><p className="font-medium">Eligibility respects recorded consent, email opt-in, and valid contact details.</p><p className="mt-1 text-muted-foreground">The server checks every recipient against the database again before sending. Duplicate email addresses are sent only once.</p></div>
      <details><summary className="cursor-pointer text-sm font-semibold text-primary">Choose specific individuals ({values.selection.individuals.length} selected)</summary><div className="mt-4"><DataTable columns={individualColumns} data={people.filter((person) => person.type !== "Evangelism contact")} enableSelection={false} searchPlaceholder="Find a member or visitor..." /></div></details>
      <div className="flex flex-wrap items-center gap-3"><Badge variant="secondary">{recipients.selected.length} selected records</Badge><Badge variant="outline">{recipients.eligible.length} eligible recipients</Badge><Button type="button" variant="ghost" size="sm" onClick={() => setShowExcluded((value) => !value)}>{recipients.excluded.length} excluded · {showExcluded ? "Hide" : "Review"}</Button></div>
      {showExcluded ? <DataTable columns={[{ accessorKey: "name", header: "Person" }, { accessorKey: "exclusionReason", header: "Excluded because" }]} data={recipients.excluded} enableSelection={false} /> : null}
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Review and send</CardTitle><CardDescription>Email is sent immediately through the configured SMTP mailbox after confirmation.</CardDescription></CardHeader><CardContent><Button type="submit"><Eye />Preview email</Button></CardContent></Card>
    <Dialog open={Boolean(preview)} onOpenChange={(open) => { if (!open) setPreview(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Preview campaign</DialogTitle><DialogDescription>{preview?.title} · {preview?.channel.toUpperCase()} · {recipients.eligible.length} eligible recipients</DialogDescription></DialogHeader>
      {preview ? <><div className="space-y-3 rounded-xl border bg-muted/30 p-4">{preview.channel === "email" ? <p className="font-semibold">{preview.subject}</p> : null}<p className="whitespace-pre-wrap text-sm">{personalizeMessage(preview.body, recipients.eligible[0])}</p><p className="text-xs text-muted-foreground">Sample preview for {recipients.eligible[0]?.name}. Each recipient receives a separate personalized email.</p></div><DataTable columns={eligibleColumns} data={recipients.eligible} enableSelection={false} /><p className="text-sm text-muted-foreground">Confirming will send real email immediately through SMTP.</p><DialogFooter><Button type="button" variant="outline" disabled={sending} onClick={() => setPreview(null)}>Back to editing</Button><Button type="button" disabled={sending} onClick={confirm}>{sending ? "Sending..." : `Send ${recipients.eligible.length} email${recipients.eligible.length === 1 ? "" : "s"}`}</Button></DialogFooter></> : null}
    </DialogContent></Dialog>
  </form>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Building2, CalendarDays, Info, LoaderCircle, Network, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMembers } from "@/features/members/MembersProvider";
import { useMinistries } from "../MinistriesProvider";
import { ministryStatuses } from "../data/ministries.mock";

const schema = z.object({
  name: z.string().trim().min(1, "Ministry name is required."),
  description: z.string().trim(),
  leaderId: z.string().min(1, "Select a ministry leader."),
  assistantLeaderId: z.string(),
  dateEstablished: z.string(),
  status: z.string().min(1),
  branchIds: z.array(z.string()),
});

function Section({ icon: Icon, title, description, children }) {
  return <Card><CardHeader className="border-b"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="space-y-1"><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">{children}</CardContent></Card>;
}

export function CreateMinistryPage() {
  const router = useRouter();
  const { members } = useMembers();
  const { branches, addMinistry } = useMinistries();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", description: "", leaderId: "", assistantLeaderId: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), status: "Active", branchIds: [] } });

  async function submit(values) {
    const duplicate = form.getValues("name").trim().toLowerCase();
    try {
      const ministry = addMinistry(values);
      toast.success(`${values.name} was added to the ministries directory.`);
      router.push(`/ministries/${ministry.id}`);
    } catch (error) {
      form.setError("name", { message: error.message || `A ministry named ${duplicate} could not be added.` });
    }
  }

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
    <PageHeader title="Add ministry" description="Create the ministry once, assign its leadership, then choose every church branch where it operates." actions={<Button variant="outline" asChild><Link href="/ministries"><ArrowLeft />Ministries</Link></Button>} />
    <Alert className="border-primary/20 bg-primary/5"><Info /><AlertTitle>One ministry, many branches</AlertTitle><AlertDescription>Do not create a separate copy for each location. Select all applicable branches below; you can change the assignments later.</AlertDescription></Alert>
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)} noValidate>
      <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Required field</p>
      <Section icon={Network} title="Ministry details" description="Give the ministry a clear name and explain its purpose.">
        <Controller name="name" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="ministry-name">Ministry name <span className="text-destructive">*</span></FieldLabel><Input {...field} id="ministry-name" autoFocus placeholder="e.g. Worship Ministry" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="status" control={form.control} render={({ field }) => <Field><FieldLabel>Status</FieldLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{ministryStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><FieldDescription>New ministries are active by default.</FieldDescription></Field>} />
        <Controller name="description" control={form.control} render={({ field }) => <Field className="md:col-span-2"><FieldLabel htmlFor="ministry-description">Purpose and responsibilities</FieldLabel><Textarea {...field} id="ministry-description" rows={4} placeholder="Describe what the ministry does and who it serves" /></Field>} />
      </Section>
      <Section icon={UsersRound} title="Leadership" description="Assign the people responsible for this ministry across the church.">
        <Controller name="leaderId" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Ministry leader <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a member" /></SelectTrigger><SelectContent>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="assistantLeaderId" control={form.control} render={({ field }) => <Field><FieldLabel>Assistant leader</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{members.filter((member) => member.id !== form.watch("leaderId")).map((member) => <SelectItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</SelectItem>)}</SelectContent></Select></Field>} />
        <Controller name="dateEstablished" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="ministry-date">Date established</FieldLabel><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input {...field} id="ministry-date" type="date" className="pl-9" /></div></Field>} />
      </Section>
      <Section icon={Building2} title="Church branch coverage" description="Choose the locations where this ministry currently operates.">
        <Controller name="branchIds" control={form.control} render={({ field }) => <Field className="md:col-span-2"><FieldLabel>Operating branches</FieldLabel>{branches.length ? <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">{branches.map((branch) => <label key={branch.id} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background p-3 text-sm transition-colors hover:border-primary/40"><Checkbox checked={field.value.includes(branch.id)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, branch.id] : field.value.filter((id) => id !== branch.id))} /><span><span className="block font-medium">{branch.name}</span><span className="text-xs text-muted-foreground">{branch.district || branch.location || "Location not provided"}</span></span></label>)}</div> : <div className="rounded-xl border border-dashed p-6 text-center"><p className="text-sm font-medium">No church branches have been added.</p><Button variant="link" asChild><Link href="/ministries/branches/new">Add a church branch first</Link></Button></div>}<FieldDescription>A ministry may serve at one, several, or all church branches.</FieldDescription></Field>} />
      </Section>
      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => router.push("/ministries")}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}Create ministry</Button></div>
    </form>
  </div>;
}

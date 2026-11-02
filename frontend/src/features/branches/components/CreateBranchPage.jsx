"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Building2, CalendarDays, Info, LoaderCircle, MapPinned, Network, UsersRound } from "lucide-react";
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
import { useMinistries } from "@/features/ministries/MinistriesProvider";
import { leaderOptions } from "@/features/ministries/leader-utils";
import { branchStatuses } from "../data/branches.mock";

function isUgandanPhone(value) {
  if (!value) return true;
  return /^(?:\+256|0)(?:2|3|7)\d{8}$/.test(value.replace(/[\s()-]/g, ""));
}

const schema = z.object({
  name: z.string().trim().min(1, "Branch name is required."),
  location: z.string().trim().min(1, "Town or area is required."),
  district: z.string().trim().min(1, "District is required."),
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

function Section({ icon: Icon, title, description, children }) {
  return <Card><CardHeader className="border-b"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="space-y-1"><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">{children}</CardContent></Card>;
}

function TextField({ control, name, label, required, type = "text", placeholder }) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`branch-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel><Input {...field} id={`branch-${name}`} type={type} placeholder={placeholder} aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />;
}

export function CreateBranchPage() {
  const router = useRouter();
  const { members } = useMembers();
  const { ministries, addBranch, setBranchMinistries } = useMinistries();
  const options = leaderOptions(members);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", location: "", district: "", address: "", phone: "", email: "", dateEstablished: format(new Date(), "yyyy-MM-dd"), leaderKey: "", assistantLeaderKey: "", description: "", status: "Active", ministryIds: [] } });

  async function submit({ ministryIds, ...values }) {
    try {
      const branch = addBranch(values);
      setBranchMinistries(branch.id, ministryIds);
      toast.success(`${values.name} was added to the church branches directory.`);
      router.push(`/ministries/branches/${branch.id}`);
    } catch (error) {
      form.setError("name", { message: error.message || "This church branch could not be added." });
    }
  }

  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
    <PageHeader title="Add church branch" description="Register a church location, its local leadership, contact information, and the ministries serving there." actions={<Button variant="outline" asChild><Link href="/ministries"><ArrowLeft />Ministries & branches</Link></Button>} />
    <Alert className="border-primary/20 bg-primary/5"><Info /><AlertTitle>Branch registration</AlertTitle><AlertDescription>A branch is a physical church location. Ministries remain shared church-wide records and can be assigned to this branch below.</AlertDescription></Alert>
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)} noValidate>
      <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Required field</p>
      <Section icon={Building2} title="Branch identity" description="Name the church location and record when it was established.">
        <TextField control={form.control} name="name" label="Branch name" required placeholder="e.g. Entebbe Branch" />
        <Controller name="status" control={form.control} render={({ field }) => <Field><FieldLabel>Status</FieldLabel><Select value={field.value} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{branchStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select><FieldDescription>New branches are active by default.</FieldDescription></Field>} />
        <Controller name="description" control={form.control} render={({ field }) => <Field className="md:col-span-2"><FieldLabel htmlFor="branch-description">About this branch</FieldLabel><Textarea {...field} id="branch-description" rows={4} placeholder="Add a short description or helpful notes" /></Field>} />
        <Controller name="dateEstablished" control={form.control} render={({ field }) => <Field><FieldLabel htmlFor="branch-date">Date established</FieldLabel><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input {...field} id="branch-date" type="date" className="pl-9" /></div></Field>} />
      </Section>
      <Section icon={MapPinned} title="Location & contact" description="Help members and visitors find and contact this branch.">
        <TextField control={form.control} name="district" label="District" required placeholder="e.g. Wakiso" />
        <TextField control={form.control} name="location" label="Town or area" required placeholder="e.g. Entebbe" />
        <Controller name="address" control={form.control} render={({ field }) => <Field className="md:col-span-2"><FieldLabel htmlFor="branch-address">Physical address</FieldLabel><Textarea {...field} id="branch-address" placeholder="Street, village, landmark, or directions" /></Field>} />
        <TextField control={form.control} name="phone" label="Contact phone" type="tel" placeholder="0772 123 456" />
        <TextField control={form.control} name="email" label="Email address" type="email" placeholder="Optional email address" />
      </Section>
      <Section icon={UsersRound} title="Local leadership" description="Choose the pastor or leader responsible for this location.">
        <Controller name="leaderKey" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel>Branch leader / pastor <span className="text-destructive">*</span></FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a member or worker" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="assistantLeaderKey" control={form.control} render={({ field }) => <Field><FieldLabel>Assistant leader</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent>{options.filter((option) => option.value !== form.watch("leaderKey")).map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></Field>} />
      </Section>
      <Section icon={Network} title="Ministries at this branch" description="Select the established ministries that currently operate here.">
        <Controller name="ministryIds" control={form.control} render={({ field }) => <Field className="md:col-span-2"><FieldLabel>Operating ministries</FieldLabel>{ministries.length ? <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2">{ministries.map((ministry) => <label key={ministry.id} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 text-sm transition-colors hover:border-primary/40"><Checkbox className="mt-0.5" checked={field.value.includes(ministry.id)} onCheckedChange={(checked) => field.onChange(checked ? [...field.value, ministry.id] : field.value.filter((id) => id !== ministry.id))} /><span><span className="block font-medium">{ministry.name}</span><span className="line-clamp-2 text-xs text-muted-foreground">{ministry.description || "No description provided"}</span></span></label>)}</div> : <div className="rounded-xl border border-dashed p-6 text-center"><p className="text-sm font-medium">No ministries have been added.</p><Button variant="link" asChild><Link href="/ministries/new">Add a ministry first</Link></Button></div>}<FieldDescription>You can add or remove ministry assignments later from the branch profile.</FieldDescription></Field>} />
      </Section>
      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={() => router.push("/ministries")}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}Create church branch</Button></div>
    </form>
  </div>;
}

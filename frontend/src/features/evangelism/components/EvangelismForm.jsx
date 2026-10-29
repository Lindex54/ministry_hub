"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CalendarHeart, LoaderCircle, MessageSquareText, UserRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { branches, evangelismTeam, responseOptions } from "../data/evangelism.mock";

function isUgandanPhone(value) {
  if (!value) return true;
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(?:\+256|0)(?:2|3|7)\d{8}$/.test(normalized);
}

const personFields = {
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim(),
  phone: z.string().trim().refine(isUgandanPhone, "Enter a valid Ugandan phone number, such as 0772 123 456 or +256 772 123 456."),
  gender: z.string(),
  districtVillage: z.string().trim(),
  branch: z.string(),
  notes: z.string().trim(),
  permissionToContact: z.boolean(),
  followUpNeeded: z.boolean(),
};

const registrationSchema = z.object({
  ...personFields,
  evangelismDate: z.string().min(1, "Evangelism date is required."),
  outreachLocation: z.string().trim().min(1, "Outreach location is required."),
  evangelizedBy: z.string().min(1, "Select who evangelized this person."),
  outreachActivity: z.string(),
  response: z.string().min(1, "Select the person's response."),
});

const editSchema = z.object({ ...personFields, evangelismDate: z.string(), outreachLocation: z.string(), evangelizedBy: z.string(), outreachActivity: z.string(), response: z.string() });

export const emptyEvangelismValues = {
  firstName: "", lastName: "", phone: "", gender: "", districtVillage: "", evangelismDate: "", outreachLocation: "", evangelizedBy: "", outreachActivity: "", response: "", branch: "", notes: "", permissionToContact: false, followUpNeeded: false,
};

function TextField({ control, name, label, required, type = "text", placeholder, description }) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`evangelism-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel><Input {...field} id={`evangelism-${name}`} type={type} placeholder={placeholder} aria-invalid={fieldState.invalid} />{description ? <FieldDescription>{description}</FieldDescription> : null}{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />;
}

function SelectField({ control, name, label, required, placeholder, options }) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`evangelism-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger id={`evangelism-${name}`} className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />;
}

function FormSection({ icon: Icon, title, description, children }) {
  return <Card><CardHeader className="border-b"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="space-y-1"><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">{children}</CardContent></Card>;
}

function ConsentToggle({ control, name, label, description }) {
  return <Controller name={name} control={control} render={({ field }) => (
    <label htmlFor={`evangelism-${name}`} className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-border bg-muted/20 p-4 transition-colors hover:border-primary/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
      <Checkbox id={`evangelism-${name}`} className="mt-0.5 size-5" checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
      <div className="space-y-1">
        <span className="text-sm font-semibold leading-none">{label}</span>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </label>
  )} />;
}

export function EvangelismForm({ defaultValues, activities, onSubmit, onCancel, submitLabel = "Save record", editMode = false }) {
  const form = useForm({ resolver: zodResolver(editMode ? editSchema : registrationSchema), defaultValues: { ...emptyEvangelismValues, ...defaultValues } });

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Required field. Last name, phone, and most other fields are optional.</p>
      <FormSection icon={UserRound} title="Person Information" description="Basic identity details for the person evangelized.">
        <TextField control={form.control} name="firstName" label="First name" required placeholder="e.g. Rose" />
        <TextField control={form.control} name="lastName" label="Last name" placeholder="e.g. Nankya" />
        <TextField control={form.control} name="phone" label="Phone number" type="tel" placeholder="0772 123 456" description="Used to recognize this person on a future encounter." />
        <SelectField control={form.control} name="gender" label="Gender" placeholder="Select gender" options={["Female", "Male", "Prefer not to say"]} />
        <Controller name="districtVillage" control={form.control} render={({ field, fieldState }) => <Field className="md:col-span-2" data-invalid={fieldState.invalid}><FieldLabel htmlFor="evangelism-districtVillage">District / village</FieldLabel><Input {...field} id="evangelism-districtVillage" placeholder="District, town, or village" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <SelectField control={form.control} name="branch" label="Church branch" placeholder="Select branch" options={branches} />
      </FormSection>
      {!editMode ? <FormSection icon={CalendarHeart} title="Outreach Encounter" description="Where, when, and how this encounter happened.">
        <TextField control={form.control} name="evangelismDate" label="Evangelism date" required type="date" />
        <TextField control={form.control} name="outreachLocation" label="Outreach location" required placeholder="e.g. Kawempe Trading Centre" />
        <SelectField control={form.control} name="evangelizedBy" label="Evangelized by" required placeholder="Select a worker" options={evangelismTeam.map((worker) => ({ value: worker.id, label: `${worker.name} · ${worker.role}` }))} />
        <SelectField control={form.control} name="outreachActivity" label="Outreach activity" placeholder="No linked activity" options={activities.map((activity) => ({ value: activity.id, label: `${activity.name} · ${activity.date}` }))} />
        <SelectField control={form.control} name="response" label="Response" required placeholder="Select a response" options={responseOptions} />
      </FormSection> : null}
      <FormSection icon={MessageSquareText} title="Pastoral Notes & Consent" description="Optional care notes and the person's communication preference.">
        <Controller name="notes" control={form.control} render={({ field, fieldState }) => <Field className="md:col-span-2" data-invalid={fieldState.invalid}><FieldLabel htmlFor="evangelism-notes">Prayer request or notes</FieldLabel><Textarea {...field} id="evangelism-notes" placeholder="Optional prayer request or encounter notes" aria-invalid={fieldState.invalid} /><FieldDescription>This is sensitive pastoral information. Backend permissions must restrict access before production use.</FieldDescription>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <ConsentToggle control={form.control} name="permissionToContact" label="Permission to contact" description="Leave unchecked unless this person explicitly agreed to follow-up contact." />
        <ConsentToggle control={form.control} name="followUpNeeded" label="Follow-up needed" description="Flags this person for a follow-up assignment." />
      </FormSection>
      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}{submitLabel}</Button></div>
    </form>
  );
}

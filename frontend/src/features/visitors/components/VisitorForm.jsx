"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { CalendarDays, ContactRound, LoaderCircle, MessageSquareText, UserRound } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { serviceOptions } from "../data/visitors.mock";

function isUgandanPhone(value) {
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(?:\+256|0)(?:2|3|7)\d{8}$/.test(normalized);
}

const visitorDetailsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().min(1, "Phone number is required.").refine(isUgandanPhone, "Enter a valid Ugandan phone number, such as 0772 123 456 or +256 772 123 456."),
  email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email address."),
  gender: z.string(),
  districtAddress: z.string().trim(),
  invitedBy: z.string().trim(),
  prayerRequest: z.string().trim(),
  permissionToContact: z.boolean(),
});

const registrationSchema = visitorDetailsSchema.extend({
  dateOfVisit: z.string().min(1, "Date of visit is required."),
  serviceAttended: z.string().min(1, "Service attended is required."),
});

export const emptyVisitorValues = {
  firstName: "", lastName: "", phone: "", email: "", gender: "", districtAddress: "", invitedBy: "", prayerRequest: "", permissionToContact: false, dateOfVisit: "", serviceAttended: "",
};

function TextField({ control, name, label, required, type = "text", placeholder, description, disabled }) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor={`visitor-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel><Input {...field} id={`visitor-${name}`} type={type} placeholder={placeholder} disabled={disabled} aria-invalid={fieldState.invalid} />{description ? <FieldDescription>{description}</FieldDescription> : null}{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />;
}

function FormSection({ icon: Icon, title, description, children }) {
  return <Card><CardHeader className="border-b"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><div className="space-y-1"><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div></div></CardHeader><CardContent className="grid gap-6 md:grid-cols-2">{children}</CardContent></Card>;
}

export function VisitorForm({ defaultValues, onSubmit, onCancel, registration = false, visitContext, submitLabel = "Save visitor" }) {
  const form = useForm({ resolver: zodResolver(registration ? registrationSchema : visitorDetailsSchema), defaultValues: { ...emptyVisitorValues, ...defaultValues } });

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Required field. Email and all unmarked fields are optional.</p>
      <FormSection icon={UserRound} title="Visitor Information" description="Basic details used to identify this visitor.">
        <TextField control={form.control} name="firstName" label="First name" required placeholder="e.g. Lydia" />
        <TextField control={form.control} name="lastName" label="Last name" required placeholder="e.g. Nakato" />
        <Controller name="gender" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="visitor-gender">Gender</FieldLabel><Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger id="visitor-gender" className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <TextField control={form.control} name="invitedBy" label="Invited by" placeholder="Member or ministry name" />
      </FormSection>
      <FormSection icon={ContactRound} title="Contact Information" description="Contact and location details for pastoral care and follow-up.">
        <TextField control={form.control} name="phone" label="Phone number" required type="tel" placeholder="0772 123 456" />
        <TextField control={form.control} name="email" label="Email address" type="email" placeholder="Optional email address" description="Email is not required to register a visitor." />
        <Controller name="districtAddress" control={form.control} render={({ field, fieldState }) => <Field className="md:col-span-2" data-invalid={fieldState.invalid}><FieldLabel htmlFor="visitor-address">District / address</FieldLabel><Textarea {...field} id="visitor-address" placeholder="District, town, village, or other helpful location details" aria-invalid={fieldState.invalid} />{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
      </FormSection>
      {registration ? <FormSection icon={CalendarDays} title="Visit Information" description="Details of the service or gathering attended.">
        <TextField control={form.control} name="dateOfVisit" label="Date of visit" required type="date" disabled={Boolean(visitContext)} />
        <Controller name="serviceAttended" control={form.control} render={({ field, fieldState }) => <Field data-invalid={fieldState.invalid}><FieldLabel htmlFor="visitor-service">Service attended <span className="text-destructive">*</span></FieldLabel><Select disabled={Boolean(visitContext)} value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger id="visitor-service" className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select a service" /></SelectTrigger><SelectContent>{serviceOptions.map((service) => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
      </FormSection> : null}
      <FormSection icon={MessageSquareText} title="Pastoral Care & Consent" description="Record optional care notes and the visitor's communication preference.">
        <Controller name="prayerRequest" control={form.control} render={({ field, fieldState }) => <Field className="md:col-span-2" data-invalid={fieldState.invalid}><FieldLabel htmlFor="visitor-prayer">Prayer request</FieldLabel><Textarea {...field} id="visitor-prayer" placeholder="Optional prayer request shared by the visitor" aria-invalid={fieldState.invalid} /><FieldDescription>This is sensitive pastoral information. Backend permissions must restrict access before production use.</FieldDescription>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</Field>} />
        <Controller name="permissionToContact" control={form.control} render={({ field }) => <Field className="md:col-span-2 rounded-xl border bg-muted/20 p-4" orientation="horizontal"><Checkbox id="visitor-consent" checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} /><div><FieldLabel htmlFor="visitor-consent">Visitor has given permission for follow-up communication</FieldLabel><FieldDescription>Leave unchecked unless the visitor explicitly agrees. Registration does not automatically grant consent.</FieldDescription></div></Field>} />
        {!form.watch("permissionToContact") ? <Alert className="md:col-span-2"><MessageSquareText /><AlertTitle>No communication consent recorded</AlertTitle><AlertDescription>The visitor can still be registered, but administrators should not contact them until permission is recorded.</AlertDescription></Alert> : null}
      </FormSection>
      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}{submitLabel}</Button></div>
    </form>
  );
}

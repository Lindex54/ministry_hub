"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Camera, Church, ContactRound, HeartHandshake, LoaderCircle, UserRound } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { membershipStatuses } from "../data/members.mock";
import { useMemberFormOptions } from "../useMemberFormOptions";

function isUgandanPhone(value) {
  if (!value) return true;
  const normalized = value.replace(/[\s()-]/g, "");
  return /^(?:\+256|0)(?:2|3|7)\d{8}$/.test(normalized);
}

const optionalPhone = z.string().trim().refine(isUgandanPhone, "Enter a valid Ugandan phone number, such as 0772 123 456 or +256 772 123 456.");

export const memberSchema = z.object({
  sourceVisitorId: z.string().optional(),
  membershipNumber: z.string(),
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  preferredName: z.string().trim(),
  gender: z.string(),
  dateOfBirth: z.string(),
  profilePhoto: z.string(),
  primaryPhone: z.string().trim().min(1, "Primary phone number is required.").refine(isUgandanPhone, "Enter a valid Ugandan phone number, such as 0772 123 456 or +256 772 123 456."),
  alternativePhone: optionalPhone,
  email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email address."),
  district: z.string().trim(),
  address: z.string().trim(),
  branch: z.string().min(1, "Church branch is required."),
  dateJoined: z.string(),
  status: z.string(),
  ministries: z.array(z.string()).min(1, "Select at least one ministry affiliation or choose None."),
  emergencyName: z.string().trim(),
  emergencyRelationship: z.string().trim(),
  emergencyPhone: optionalPhone,
});

export const emptyMemberValues = {
  sourceVisitorId: undefined,
  membershipNumber: "",
  firstName: "",
  lastName: "",
  preferredName: "",
  gender: "",
  dateOfBirth: "",
  profilePhoto: "",
  primaryPhone: "",
  alternativePhone: "",
  email: "",
  district: "",
  address: "",
  branch: "",
  dateJoined: "",
  status: "Active",
  ministries: [],
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
};

function TextField({ control, name, label, required, type = "text", placeholder, description, disabled }) {
  return (
    <Controller name={name} control={control} render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={`member-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel>
        <Input {...field} id={`member-${name}`} type={type} placeholder={placeholder} disabled={disabled} aria-invalid={fieldState.invalid} />
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
      </Field>
    )} />
  );
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span>
          <div className="space-y-1"><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function MemberForm({ defaultValues, onSubmit, submitLabel = "Save member", onCancel }) {
  const fileInputRef = useRef(null);
  const { branchNames, ministryNames } = useMemberFormOptions();
  const form = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: { ...emptyMemberValues, ...defaultValues },
  });

  async function handlePhoto(event, onChange) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      form.setError("profilePhoto", { message: "Choose an image file." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      form.setError("profilePhoto", { message: "Choose an image smaller than 2 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { onChange(String(reader.result)); form.clearErrors("profilePhoto"); };
    reader.readAsDataURL(file);
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <p className="text-sm text-muted-foreground"><span className="text-destructive">*</span> Required field. Email and all unmarked fields are optional.</p>

      <FormSection icon={UserRound} title="Personal Information" description="Basic identity and profile details for this member.">
        <TextField control={form.control} name="firstName" label="First name" required placeholder="e.g. Sarah" />
        <TextField control={form.control} name="lastName" label="Last name" required placeholder="e.g. Nabirye" />
        <TextField control={form.control} name="preferredName" label="Preferred name" placeholder="Name used in conversation" />
        <Controller name="gender" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="member-gender">Gender</FieldLabel>
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger id="member-gender" className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
            </Select>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )} />
        <TextField control={form.control} name="dateOfBirth" label="Date of birth" type="date" />
        <Controller name="profilePhoto" control={form.control} render={({ field, fieldState }) => (
          <Field className="md:row-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel>Profile photograph</FieldLabel>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dashed bg-muted/30 p-4">
              {field.value ? <img src={field.value} alt="Profile preview" className="size-20 rounded-full object-cover" /> : <span className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-8" /></span>}
              <div className="space-y-2">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Camera />Choose photograph</Button>
                {field.value ? <Button type="button" variant="ghost" size="sm" onClick={() => field.onChange("")}>Remove</Button> : null}
                <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => handlePhoto(event, field.onChange)} />
                <FieldDescription>Optional JPG or PNG, up to 2 MB.</FieldDescription>
              </div>
            </div>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )} />
      </FormSection>

      <FormSection icon={ContactRound} title="Contact Information" description="How the church can reach and locate the member.">
        <TextField control={form.control} name="primaryPhone" label="Primary phone number" required type="tel" placeholder="0772 123 456" />
        <TextField control={form.control} name="alternativePhone" label="Alternative phone" type="tel" placeholder="+256 701 234 567" />
        <TextField control={form.control} name="email" label="Email address" type="email" placeholder="Optional email address" description="Optional—an email address is not required to register a member." />
        <TextField control={form.control} name="district" label="District" placeholder="e.g. Kampala" />
        <Controller name="address" control={form.control} render={({ field, fieldState }) => (
          <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="member-address">Address</FieldLabel>
            <Textarea {...field} id="member-address" placeholder="Village, parish, town, or other helpful location details" aria-invalid={fieldState.invalid} />
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )} />
      </FormSection>

      <FormSection icon={Church} title="Church Information" description="Membership details and ministry involvement.">
        <TextField control={form.control} name="membershipNumber" label="Membership number" disabled description="Generated automatically by Ministry Hub." />
        <Controller name="branch" control={form.control} render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="member-branch">Church branch <span className="text-destructive">*</span></FieldLabel>
            <Select value={field.value || undefined} onValueChange={field.onChange}>
              <SelectTrigger id="member-branch" className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Select church branch" /></SelectTrigger>
              <SelectContent>{branchNames.map((branch) => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}</SelectContent>
            </Select>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )} />
        <TextField control={form.control} name="dateJoined" label="Date joined" type="date" />
        <Controller name="status" control={form.control} render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="member-status">Membership status</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="member-status" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{membershipStatuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
            </Select>
            <FieldDescription>New members default to Active.</FieldDescription>
          </Field>
        )} />
        <Controller name="ministries" control={form.control} render={({ field, fieldState }) => (
          <Field className="md:col-span-2" data-invalid={fieldState.invalid}>
            <FieldLabel>Ministry affiliations <span className="text-destructive">*</span></FieldLabel>
            <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {ministryNames.map((ministry) => (
                <label key={ministry} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={field.value.includes(ministry)}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        field.onChange(field.value.filter((item) => item !== ministry));
                        return;
                      }
                      field.onChange(
                        ministry === "None"
                          ? ["None"]
                          : [...field.value.filter((item) => item !== "None"), ministry]
                      );
                    }}
                  />
                  {ministry}
                </label>
              ))}
            </div>
            <FieldDescription>Select every applicable ministry, or choose None for congregation-only members.</FieldDescription>
            {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
          </Field>
        )} />
      </FormSection>

      <FormSection icon={HeartHandshake} title="Emergency Contact" description="A trusted person to contact when necessary.">
        <TextField control={form.control} name="emergencyName" label="Contact name" placeholder="Full name" />
        <TextField control={form.control} name="emergencyRelationship" label="Relationship" placeholder="e.g. Spouse, parent, sibling" />
        <TextField control={form.control} name="emergencyPhone" label="Phone number" type="tel" placeholder="0772 123 456" />
      </FormSection>

      <div className="sticky bottom-4 z-10 flex flex-col-reverse gap-3 rounded-xl border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" /> : null}{submitLabel}
        </Button>
      </div>
    </form>
  );
}

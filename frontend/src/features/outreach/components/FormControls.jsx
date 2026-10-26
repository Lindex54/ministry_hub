"use client";

import { Controller } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function FormControl({ control, name, label, options, multiline, required, ...props }) {
  return <Controller name={name} control={control} render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={`outreach-${name}`}>{label}{required ? <span className="text-destructive">*</span> : null}</FieldLabel>
      {options ? <Select value={field.value || undefined} onValueChange={field.onChange}><SelectTrigger ref={field.ref} onBlur={field.onBlur} id={`outreach-${name}`} className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Choose an option" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</SelectItem>)}</SelectContent></Select>
        : multiline ? <Textarea {...field} {...props} id={`outreach-${name}`} aria-invalid={fieldState.invalid} />
        : <Input {...field} {...props} id={`outreach-${name}`} aria-invalid={fieldState.invalid} />}
      {fieldState.error ? <FieldError errors={[fieldState.error]} /> : null}
    </Field>
  )} />;
}

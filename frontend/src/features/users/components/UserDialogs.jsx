"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Copy, Dices, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function generatePassword() {
  return crypto.getRandomValues(new Uint8Array(9)).reduce((value, byte) => value + byte.toString(36), "").slice(0, 12);
}

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  roleId: z.string().min(1, "Choose a role."),
  password: z.string().trim().min(8, "Password must be at least 8 characters."),
});

export function CreateUserDialog({ roles, onCreate, onCreated }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const defaults = () => ({ name: "", username: "", email: "", roleId: roles[0]?.id ?? "", password: generatePassword() });
  const form = useForm({ resolver: zodResolver(createUserSchema), defaultValues: defaults() });

  async function submit(values) {
    setSubmitting(true);
    try {
      const result = await onCreate(values);
      toast.success(`${result.user.name} added.`);
      setOpen(false);
      form.reset(defaults());
      onCreated?.(result);
    } catch (error) {
      toast.error(error.message ?? "Could not add this user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}>
      <DialogTrigger asChild><Button><UserPlus />Add user</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>They can change this password after signing in.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="user-name">Full name</FieldLabel>
            <Input id="user-name" {...form.register("name")} />
            {form.formState.errors.name ? <FieldError errors={[form.formState.errors.name]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.username}>
            <FieldLabel htmlFor="user-username">Username</FieldLabel>
            <Input id="user-username" {...form.register("username")} />
            {form.formState.errors.username ? <FieldError errors={[form.formState.errors.username]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="user-email">Email</FieldLabel>
            <Input id="user-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? <FieldError errors={[form.formState.errors.email]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.roleId}>
            <FieldLabel htmlFor="user-role">Role</FieldLabel>
            <Select value={form.watch("roleId")} onValueChange={(value) => form.setValue("roleId", value)}>
              <SelectTrigger id="user-role" className="w-full"><SelectValue placeholder="Choose a role" /></SelectTrigger>
              <SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent>
            </Select>
            {form.formState.errors.roleId ? <FieldError errors={[form.formState.errors.roleId]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.password}>
            <FieldLabel htmlFor="user-password">Temporary password</FieldLabel>
            <div className="flex gap-2">
              <Input id="user-password" {...form.register("password")} />
              <Button type="button" variant="outline" size="icon" onClick={() => form.setValue("password", generatePassword())} aria-label="Generate password">
                <Dices />
              </Button>
            </div>
            {form.formState.errors.password ? <FieldError errors={[form.formState.errors.password]} /> : null}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : null}Add user</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const editUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  roleId: z.string().min(1, "Choose a role."),
  status: z.enum(["Active", "Inactive"]),
});

export function EditUserDialog({ user, roles, onSave, trigger }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const defaults = () => ({ name: user.name, username: user.username, email: user.email, roleId: user.roleId, status: user.status });
  const form = useForm({ resolver: zodResolver(editUserSchema), defaultValues: defaults() });

  async function submit(values) {
    setSubmitting(true);
    try {
      await onSave(user.id, values);
      toast.success(`${values.name} updated.`);
      setOpen(false);
    } catch (error) {
      toast.error(error.message ?? "Could not update this user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) form.reset(defaults()); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader><DialogTitle>Edit user</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)} noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="edit-user-name">Full name</FieldLabel>
            <Input id="edit-user-name" {...form.register("name")} />
            {form.formState.errors.name ? <FieldError errors={[form.formState.errors.name]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.username}>
            <FieldLabel htmlFor="edit-user-username">Username</FieldLabel>
            <Input id="edit-user-username" {...form.register("username")} />
            {form.formState.errors.username ? <FieldError errors={[form.formState.errors.username]} /> : null}
          </Field>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="edit-user-email">Email</FieldLabel>
            <Input id="edit-user-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? <FieldError errors={[form.formState.errors.email]} /> : null}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.roleId}>
              <FieldLabel htmlFor="edit-user-role">Role</FieldLabel>
              <Select value={form.watch("roleId")} onValueChange={(value) => form.setValue("roleId", value)}>
                <SelectTrigger id="edit-user-role" className="w-full"><SelectValue placeholder="Choose a role" /></SelectTrigger>
                <SelectContent>{roles.map((role) => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field data-invalid={!!form.formState.errors.status}>
              <FieldLabel htmlFor="edit-user-status">Status</FieldLabel>
              <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                <SelectTrigger id="edit-user-status" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : null}Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TemporaryPasswordDialog({ open, onOpenChange, userName, password }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Password for {userName}</DialogTitle>
          <DialogDescription>This is shown once — copy it now.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3">
          <code className="flex-1 break-all text-sm font-medium">{password}</code>
          <Button type="button" variant="outline" size="icon" onClick={copy} aria-label="Copy password">
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
        <DialogFooter><Button type="button" onClick={() => onOpenChange(false)}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

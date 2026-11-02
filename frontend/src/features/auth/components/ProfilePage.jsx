"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  username: z.string().trim().min(3, "Username must be at least 3 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(1, "Confirm your new password."),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", username: user?.username ?? "", email: user?.email ?? "" },
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSaveProfile(values) {
    setSavingProfile(true);
    try {
      await updateProfile(values);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error.message ?? "Could not update your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function onChangePassword(values) {
    setChangingPassword(true);
    try {
      await changePassword(values);
      toast.success("Password changed.");
      passwordForm.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.message ?? "Could not change your password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader title="Profile" />

      <Card>
        <CardHeader className="flex-row items-center gap-4 border-b">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <CardTitle>{user?.name}</CardTitle>
            <Badge variant="outline" className="w-fit">{user?.role || "No role assigned"}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4" onSubmit={profileForm.handleSubmit(onSaveProfile)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!profileForm.formState.errors.name}>
                <FieldLabel htmlFor="profile-name">Full name</FieldLabel>
                <Input id="profile-name" {...profileForm.register("name")} />
                {profileForm.formState.errors.name ? <FieldError errors={[profileForm.formState.errors.name]} /> : null}
              </Field>
              <Field data-invalid={!!profileForm.formState.errors.username}>
                <FieldLabel htmlFor="profile-username">Username</FieldLabel>
                <Input id="profile-username" {...profileForm.register("username")} />
                {profileForm.formState.errors.username ? <FieldError errors={[profileForm.formState.errors.username]} /> : null}
              </Field>
            </div>
            <Field data-invalid={!!profileForm.formState.errors.email}>
              <FieldLabel htmlFor="profile-email">Email</FieldLabel>
              <Input id="profile-email" type="email" {...profileForm.register("email")} />
              {profileForm.formState.errors.email ? <FieldError errors={[profileForm.formState.errors.email]} /> : null}
            </Field>
            <div>
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? <Loader2 className="animate-spin" /> : null}
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4" onSubmit={passwordForm.handleSubmit(onChangePassword)} noValidate>
            <Field data-invalid={!!passwordForm.formState.errors.currentPassword}>
              <FieldLabel htmlFor="current-password">Current password</FieldLabel>
              <Input id="current-password" type={showPasswords ? "text" : "password"} autoComplete="current-password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword ? <FieldError errors={[passwordForm.formState.errors.currentPassword]} /> : null}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={!!passwordForm.formState.errors.newPassword}>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <Input id="new-password" type={showPasswords ? "text" : "password"} autoComplete="new-password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword ? <FieldError errors={[passwordForm.formState.errors.newPassword]} /> : null}
              </Field>
              <Field data-invalid={!!passwordForm.formState.errors.confirmPassword}>
                <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
                <Input id="confirm-password" type={showPasswords ? "text" : "password"} autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword ? <FieldError errors={[passwordForm.formState.errors.confirmPassword]} /> : null}
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="animate-spin" /> : null}
                Update password
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowPasswords((current) => !current)}>
                {showPasswords ? <EyeOff /> : <Eye />}
                {showPasswords ? "Hide" : "Show"} passwords
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

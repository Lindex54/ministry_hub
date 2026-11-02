"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Church, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email."),
  password: z.string().min(1, "Enter your password."),
  rememberMe: z.boolean().optional(),
});

export function LoginForm() {
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "", rememberMe: false },
  });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      await login(values.identifier, values.password);
      toast.success("Signed in.");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(error.message ?? "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30">
          <Church className="size-6" />
        </span>
        <h1 className="text-xl font-semibold text-sidebar-foreground">Welcome back</h1>
      </div>

      <Card className="border-sidebar-border bg-card/95 shadow-2xl shadow-black/20 backdrop-blur">
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Field data-invalid={!!form.formState.errors.identifier}>
              <FieldLabel htmlFor="login-identifier">Username or email</FieldLabel>
              <Input
                id="login-identifier"
                autoComplete="username"
                placeholder="your.username"
                aria-invalid={!!form.formState.errors.identifier}
                {...form.register("identifier")}
              />
              {form.formState.errors.identifier ? <FieldError errors={[form.formState.errors.identifier]} /> : null}
            </Field>

            <Field data-invalid={!!form.formState.errors.password}>
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              {form.formState.errors.password ? <FieldError errors={[form.formState.errors.password]} /> : null}
            </Field>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={form.watch("rememberMe")}
                onCheckedChange={(checked) => form.setValue("rememberMe", Boolean(checked))}
              />
              Keep me signed in
            </label>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="bg-gradient-to-r from-sidebar-primary to-accent text-primary-foreground hover:opacity-90"
            >
              {submitting ? <Loader2 className="animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

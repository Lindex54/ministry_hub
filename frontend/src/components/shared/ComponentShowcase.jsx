"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Ellipsis,
  Info,
  Plus,
  Users,
} from "lucide-react";
import { EChart } from "@/components/charts/EChart";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DataTable } from "@/components/tables/DataTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DatePicker } from "./DatePicker";
import { FadeIn } from "./Motion";
import { PageHeader, PageSection, ResponsiveGrid } from "./PageHeader";
import { StatCard } from "./StatCard";
import { EmptyState, ErrorState, LoadingState } from "./StatusState";

const formSchema = z.object({
  name: z.string().min(2, "Enter at least two characters."),
  category: z.string().min(1, "Choose a category."),
  date: z.date({ error: "Choose a date." }),
  notifications: z.boolean(),
  consent: z.literal(true, { error: "Confirm the example option." }),
});

const tableData = [
  { id: "1", name: "Amina N.", role: "Coordinator", status: "Active" },
  { id: "2", name: "Daniel K.", role: "Volunteer", status: "Pending" },
  { id: "3", name: "Grace A.", role: "Administrator", status: "Active" },
  { id: "4", name: "Moses T.", role: "Coordinator", status: "Inactive" },
  { id: "5", name: "Sarah L.", role: "Volunteer", status: "Active" },
  { id: "6", name: "Peter O.", role: "Coordinator", status: "Pending" },
];

const tableColumns = [
  {
    id: "select",
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
        aria-label="Select all visible rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(Boolean(value))} aria-label={`Select ${row.original.name}`} />
    ),
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>{row.original.status}</Badge>,
  },
  {
    id: "actions",
    enableSorting: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}><Ellipsis /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Row actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Edit record</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const chartOption = {
  tooltip: { trigger: "axis" },
  legend: { data: ["Primary", "Secondary"] },
  grid: { left: 24, right: 18, top: 48, bottom: 24, containLabel: true },
  xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
  yAxis: { type: "value" },
  series: [
    { name: "Primary", type: "line", smooth: true, data: [82, 94, 91, 108, 116, 128], areaStyle: { opacity: 0.08 } },
    { name: "Secondary", type: "bar", data: [32, 41, 38, 52, 47, 61], barMaxWidth: 22 },
  ],
};

function ShowcaseForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", category: "", date: undefined, notifications: true, consent: false },
  });

  function onSubmit() {
    toast.success("Example form validated successfully.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form foundation</CardTitle>
        <CardDescription>React Hook Form, Zod, and official shadcn controls.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller name="name" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="showcase-name">Display name</FieldLabel>
                <Input {...field} id="showcase-name" placeholder="Enter a name" aria-invalid={fieldState.invalid} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )} />
            <Controller name="category" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="showcase-category">Category</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="showcase-category" className="w-full" aria-invalid={fieldState.invalid}><SelectValue placeholder="Choose a category" /></SelectTrigger>
                  <SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="administration">Administration</SelectItem></SelectContent>
                </Select>
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )} />
            <Controller name="date" control={form.control} render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Date</FieldLabel>
                <DatePicker value={field.value} onChange={field.onChange} />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )} />
            <Controller name="notifications" control={form.control} render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1"><FieldLabel htmlFor="showcase-notifications">Notifications</FieldLabel><FieldDescription>Receive interface updates.</FieldDescription></div>
                <Switch id="showcase-notifications" checked={field.value} onCheckedChange={field.onChange} />
              </Field>
            )} />
            <Controller name="consent" control={form.control} render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <Checkbox id="showcase-consent" checked={field.value} onCheckedChange={field.onChange} aria-invalid={fieldState.invalid} />
                <div><FieldLabel htmlFor="showcase-consent">Confirm example option</FieldLabel>{fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}</div>
              </Field>
            )} />
            <Button type="submit">Validate example</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export function ComponentShowcase() {
  const [showLoading, setShowLoading] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
      <PageHeader
        title="Component showcase"
        description="A development-only preview of the reusable Ministry Hub interface foundation. All records and metrics shown here are mock data."
        actions={<><ThemeToggle /><Button><Plus />Primary action</Button></>}
      />

      <PageSection title="Cards and status" description="Theme-aware surfaces use centralized Ministry Hub tokens.">
        <FadeIn>
          <ResponsiveGrid>
            <StatCard title="Example total" value="1,284" change="8.2% this month" icon={Users} />
            <StatCard title="Scheduled items" value="24" change="3 added" icon={CalendarDays} />
          </ResponsiveGrid>
        </FadeIn>
        <Alert><Info /><AlertTitle>Design system ready</AlertTitle><AlertDescription>This alert uses the official shadcn component and centralized theme colors.</AlertDescription></Alert>
      </PageSection>

      <Tabs defaultValue="controls">
        <TabsList>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>
        <TabsContent value="controls" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Interactive controls</CardTitle><CardDescription>Buttons, badges, dialogs, menus, tooltips, and notifications.</CardDescription></CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button><Button variant="secondary">Secondary</Button><Button variant="outline">Outline</Button><Button variant="destructive">Destructive</Button>
              <Badge>Active</Badge><Badge variant="secondary">Pending</Badge><Badge variant="outline">Draft</Badge>
              <Dialog><DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Example dialog</DialogTitle><DialogDescription>This demonstrates the accessible dialog composition.</DialogDescription></DialogHeader><DialogFooter><Button type="button">Continue</Button></DialogFooter></DialogContent></Dialog>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>First action</DropdownMenuItem><DropdownMenuItem>Second action</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline" aria-label="Notifications"><Bell /></Button></TooltipTrigger><TooltipContent>Notifications</TooltipContent></Tooltip>
              <Button variant="outline" onClick={() => toast.success("Notification component is working.")}><CheckCircle2 />Show toast</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="form" className="mt-4"><ShowcaseForm /></TabsContent>
        <TabsContent value="states" className="mt-4 space-y-4">
          <div className="flex gap-2"><Button variant="outline" onClick={() => setShowLoading((value) => !value)}>{showLoading ? "Show empty state" : "Show loading state"}</Button></div>
          {showLoading ? <LoadingState /> : <EmptyState title="No example records" description="Empty states explain what is missing and what the user can do next." action={<Button size="sm">Add record</Button>} />}
          <ErrorState title="Example error state" description="The requested content could not be loaded." onRetry={() => toast.info("Retry requested.")} />
        </TabsContent>
      </Tabs>

      <PageSection title="Data table" description="TanStack Table behavior with shadcn table presentation.">
        <Card><CardContent className="pt-6"><DataTable columns={tableColumns} data={tableData} searchPlaceholder="Search mock records..." /></CardContent></Card>
      </PageSection>

      <PageSection title="Chart wrapper" description="Apache ECharts with responsive, theme-aware presentation and mock data.">
        <Card><CardHeader><CardTitle>Example trend</CardTitle><CardDescription>Blue primary series and cyan secondary series.</CardDescription></CardHeader><CardContent><EChart option={chartOption} /></CardContent></Card>
      </PageSection>
    </div>
  );
}


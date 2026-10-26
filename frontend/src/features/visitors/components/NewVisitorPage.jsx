"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisitors } from "../VisitorsProvider";
import { emptyVisitorValues, VisitorForm } from "./VisitorForm";

export function NewVisitorPage() {
  const router = useRouter();
  const { addVisitor } = useVisitors();
  function handleSubmit(values) {
    const result = addVisitor(values);
    toast.success(result.isReturning ? `${values.firstName} ${values.lastName} was identified as a returning visitor and the visit was added.` : `${values.firstName} ${values.lastName} was added to the mock visitors directory.`);
    router.push(`/visitors/${result.visitor.id}`);
  }
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8"><PageHeader title="Register visitor" description="Record a visitor and their first service attendance. Communication consent remains optional." actions={<Button variant="outline" onClick={() => router.push("/visitors")}><ArrowLeft />Visitors</Button>} /><VisitorForm registration defaultValues={{ ...emptyVisitorValues, dateOfVisit: format(new Date(), "yyyy-MM-dd") }} onSubmit={handleSubmit} onCancel={() => router.push("/visitors")} submitLabel="Register visitor" /></div>;
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisitors } from "../VisitorsProvider";
import { getVisitorName } from "../data/visitors.mock";
import { VisitorForm } from "./VisitorForm";

export function EditVisitorPage() {
  const { id } = useParams(); const router = useRouter(); const { getVisitor, updateVisitor } = useVisitors(); const visitor = getVisitor(id);
  if (!visitor) return <div className="mx-auto w-full max-w-3xl space-y-6"><Alert variant="destructive"><Users /><AlertTitle>Visitor not found</AlertTitle><AlertDescription>This mock record does not exist or was reset when the page refreshed.</AlertDescription></Alert><Button asChild variant="outline"><Link href="/visitors"><ArrowLeft />Return to visitors</Link></Button></div>;
  function handleSubmit(values) { updateVisitor(visitor.id, values); toast.success(`${values.firstName} ${values.lastName}'s details were updated.`); router.push(`/visitors/${visitor.id}`); }
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8"><PageHeader title={`Edit ${getVisitorName(visitor)}`} description="Update personal details, communication consent, and sensitive pastoral information." actions={<Button variant="outline" onClick={() => router.push(`/visitors/${visitor.id}`)}><ArrowLeft />Profile</Button>} /><VisitorForm defaultValues={visitor} onSubmit={handleSubmit} onCancel={() => router.push(`/visitors/${visitor.id}`)} submitLabel="Save changes" /></div>;
}

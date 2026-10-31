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
  const { id } = useParams();
  const router = useRouter();
  const { getVisitor, updateVisitor, loading } = useVisitors();
  const visitor = getVisitor(id);

  if (!visitor) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading visitor…</p>
        ) : (
          <Alert variant="destructive"><Users /><AlertTitle>Visitor not found</AlertTitle><AlertDescription>This visitor record does not exist.</AlertDescription></Alert>
        )}
        <Button asChild variant="outline"><Link href="/visitors"><ArrowLeft />Return to visitors</Link></Button>
      </div>
    );
  }

  async function handleSubmit(values) {
    try {
      await updateVisitor(visitor.id, values);
      toast.success(`${values.firstName} ${values.lastName}'s details were updated.`);
      router.push(`/visitors/${visitor.id}`);
    } catch (error) {
      toast.error(error.message || "Could not save this visitor's details. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={`Edit ${getVisitorName(visitor)}`}
        description="Update personal details, communication consent, and sensitive pastoral information."
        actions={<Button variant="outline" onClick={() => router.push(`/visitors/${visitor.id}`)}><ArrowLeft />Profile</Button>}
      />
      <VisitorForm defaultValues={visitor} onSubmit={handleSubmit} onCancel={() => router.push(`/visitors/${visitor.id}`)} submitLabel="Save changes" />
    </div>
  );
}

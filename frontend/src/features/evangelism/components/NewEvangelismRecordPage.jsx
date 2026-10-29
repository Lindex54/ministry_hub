"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useEvangelism } from "../EvangelismProvider";
import { emptyEvangelismValues, EvangelismForm } from "./EvangelismForm";

export function NewEvangelismRecordPage() {
  const router = useRouter();
  const { activities, addRecord } = useEvangelism();

  function handleSubmit(values) {
    const result = addRecord(values);
    toast.success(result.isReturning ? `${values.firstName} was recognized from a previous encounter. A new encounter was added to their record.` : `${values.firstName} was added to the mock evangelism records.`);
    router.push(`/evangelism/${result.record.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader title="Record soul" description="Record a person reached during evangelism and their response to the gospel." actions={<Button variant="outline" onClick={() => router.push("/evangelism")}><ArrowLeft />Evangelism</Button>} />
      <EvangelismForm activities={activities} defaultValues={{ ...emptyEvangelismValues, evangelismDate: format(new Date(), "yyyy-MM-dd") }} onSubmit={handleSubmit} onCancel={() => router.push("/evangelism")} submitLabel="Record soul" />
    </div>
  );
}

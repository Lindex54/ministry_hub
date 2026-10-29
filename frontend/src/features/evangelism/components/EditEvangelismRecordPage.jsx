"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useEvangelism } from "../EvangelismProvider";
import { getRecordName } from "../data/evangelism.mock";
import { EvangelismForm } from "./EvangelismForm";

export function EditEvangelismRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getRecord, updateRecord } = useEvangelism();
  const record = getRecord(id);
  if (!record) return <div className="mx-auto w-full max-w-3xl space-y-6"><Alert variant="destructive"><HeartHandshake /><AlertTitle>Record not found</AlertTitle><AlertDescription>This mock evangelism record does not exist or was reset when the page refreshed.</AlertDescription></Alert><Button variant="outline" onClick={() => router.push("/evangelism")}><ArrowLeft />Return to evangelism</Button></div>;

  function handleSubmit(values) {
    updateRecord(record.id, { firstName: values.firstName, lastName: values.lastName, phone: values.phone, gender: values.gender, districtVillage: values.districtVillage, branch: values.branch, permissionToContact: values.permissionToContact, followUpNeeded: values.followUpNeeded });
    toast.success(`${values.firstName}'s details were updated.`);
    router.push(`/evangelism/${record.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader title={`Edit ${getRecordName(record)}`} description="Update personal details, church branch, and communication consent. To record a new encounter, use Add encounter on the profile page." actions={<Button variant="outline" onClick={() => router.push(`/evangelism/${record.id}`)}><ArrowLeft />Profile</Button>} />
      <EvangelismForm editMode defaultValues={record} onSubmit={handleSubmit} onCancel={() => router.push(`/evangelism/${record.id}`)} submitLabel="Save changes" />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMembers } from "../MembersProvider";
import { getMemberDisplayName } from "../data/members.mock";
import { MemberForm } from "./MemberForm";

export function EditMemberPage() {
  const { id } = useParams();
  const router = useRouter();
  const { getMember, updateMember } = useMembers();
  const member = getMember(id);

  if (!member) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Alert variant="destructive"><UsersRound /><AlertTitle>Member not found</AlertTitle><AlertDescription>This mock member record does not exist or was reset when the page refreshed.</AlertDescription></Alert>
        <Button asChild variant="outline"><Link href="/members"><ArrowLeft />Return to members</Link></Button>
      </div>
    );
  }

  function handleSubmit(values) {
    updateMember(member.id, values);
    toast.success(`${values.firstName} ${values.lastName}'s information was updated.`);
    router.push(`/members/${member.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={`Edit ${getMemberDisplayName(member)}`}
        description="Update this member's personal, contact, church, and emergency information."
        actions={<Button variant="outline" onClick={() => router.push(`/members/${member.id}`)}><ArrowLeft />Profile</Button>}
      />
      <MemberForm
        defaultValues={member}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        onCancel={() => router.push(`/members/${member.id}`)}
      />
    </div>
  );
}

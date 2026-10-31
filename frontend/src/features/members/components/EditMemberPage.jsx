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
  const { getMember, updateMember, loading } = useMembers();
  const member = getMember(id);

  if (!member) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading member…</p>
        ) : (
          <Alert variant="destructive"><UsersRound /><AlertTitle>Member not found</AlertTitle><AlertDescription>This member record does not exist.</AlertDescription></Alert>
        )}
        <Button asChild variant="outline"><Link href="/members"><ArrowLeft />Return to members</Link></Button>
      </div>
    );
  }

  async function handleSubmit(values) {
    try {
      await updateMember(member.id, values);
      toast.success(`${values.firstName} ${values.lastName}'s information was updated.`);
      router.push(`/members/${member.id}`);
    } catch (error) {
      toast.error(error.message || "Could not save this member's information. Please try again.");
    }
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

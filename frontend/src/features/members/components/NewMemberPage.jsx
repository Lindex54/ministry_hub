"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMembers } from "../MembersProvider";
import { emptyMemberValues, MemberForm } from "./MemberForm";

export function NewMemberPage() {
  const router = useRouter();
  const { addMember, getNextMembershipNumber } = useMembers();
  const membershipNumber = getNextMembershipNumber();

  function handleSubmit(values) {
    const member = addMember(values);
    toast.success(`${values.firstName} ${values.lastName} was added to the mock directory.`);
    router.push(`/members/${member.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title="Register member"
        description="Create a new church member record. Only four core fields are required."
        actions={<Button variant="outline" onClick={() => router.push("/members")}><ArrowLeft />Members</Button>}
      />
      <MemberForm
        defaultValues={{ ...emptyMemberValues, membershipNumber }}
        onSubmit={handleSubmit}
        submitLabel="Register member"
        onCancel={() => router.push("/members")}
      />
    </div>
  );
}

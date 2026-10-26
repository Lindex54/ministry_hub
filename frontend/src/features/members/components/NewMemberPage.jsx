"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useMembers } from "../MembersProvider";
import { useVisitors } from "@/features/visitors/VisitorsProvider";
import { emptyMemberValues, MemberForm } from "./MemberForm";

export function NewMemberPage() {
  const router = useRouter();
  const { addMember, getNextMembershipNumber } = useMembers();
  const { memberConversionVisitorId, getVisitor, finishMemberConversion, cancelMemberConversion } = useVisitors();
  const membershipNumber = getNextMembershipNumber();
  const visitor = memberConversionVisitorId ? getVisitor(memberConversionVisitorId) : null;

  const defaultValues = visitor ? {
    ...emptyMemberValues,
    sourceVisitorId: visitor.id,
    membershipNumber,
    firstName: visitor.firstName,
    lastName: visitor.lastName,
    gender: visitor.gender,
    primaryPhone: visitor.phone,
    email: visitor.email,
    district: visitor.districtAddress.split(",").at(-1)?.trim() ?? "",
    address: visitor.districtAddress,
    dateJoined: format(new Date(), "yyyy-MM-dd"),
  } : { ...emptyMemberValues, membershipNumber };

  function handleSubmit(values) {
    const member = addMember(values);
    if (visitor) finishMemberConversion(visitor.id, member.id);
    toast.success(`${values.firstName} ${values.lastName} was added to the mock directory.`);
    router.push(`/members/${member.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={visitor ? `Register ${visitor.firstName} ${visitor.lastName} as member` : "Register member"}
        description={visitor ? "Available visitor information has been transferred into this form. Complete the required membership details." : "Create a new church member record with the required identity and church details."}
        actions={<Button variant="outline" onClick={() => { cancelMemberConversion(); router.push(visitor ? `/visitors/${visitor.id}` : "/members"); }}><ArrowLeft />{visitor ? "Visitor profile" : "Members"}</Button>}
      />
      <MemberForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Register member"
        onCancel={() => { cancelMemberConversion(); router.push(visitor ? `/visitors/${visitor.id}` : "/members"); }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { api } from "@/lib/api";
import { useMembers } from "../MembersProvider";
import { useVisitors } from "@/features/visitors/VisitorsProvider";
import { emptyMemberValues, MemberForm } from "./MemberForm";
import { useAttendance } from "@/features/attendance/AttendanceProvider";
import { normalizePhone } from "@/features/outreach/outreach-utils.mjs";
import { useEvangelism } from "@/features/evangelism/EvangelismProvider";

export function NewMemberPage() {
  const router = useRouter();
  const { members, addMember } = useMembers();
  const { registrationOccurrence, completeRegistration, cancelRegistration } = useAttendance();
  const { visitors, memberConversionVisitorId, getVisitor, finishMemberConversion, cancelMemberConversion } = useVisitors();
  const { memberConversionRecordId, getRecord, finishMemberConversion: finishEvangelismMemberConversion, cancelMemberConversion: cancelEvangelismMemberConversion } = useEvangelism();
  const [membershipNumber, setMembershipNumber] = useState("");
  const visitor = memberConversionVisitorId ? getVisitor(memberConversionVisitorId) : null;
  const evangelismRecord = !visitor && memberConversionRecordId ? getRecord(memberConversionRecordId) : null;

  useEffect(() => {
    let cancelled = false;
    api("/members/next-number")
      .then(({ membershipNumber: next }) => { if (!cancelled) setMembershipNumber(next); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

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
  } : evangelismRecord ? {
    ...emptyMemberValues,
    membershipNumber,
    firstName: evangelismRecord.firstName,
    lastName: evangelismRecord.lastName,
    gender: evangelismRecord.gender,
    primaryPhone: evangelismRecord.phone,
    district: evangelismRecord.districtVillage.split(",").at(-1)?.trim() ?? "",
    address: evangelismRecord.districtVillage,
    branch: evangelismRecord.branch ?? "",
    dateJoined: format(new Date(), "yyyy-MM-dd"),
  } : { ...emptyMemberValues, membershipNumber, branch: registrationOccurrence?.branch ?? "", dateJoined: registrationOccurrence?.date ?? "" };

  async function handleSubmit(values) {
    try {
      if (registrationOccurrence) {
        const existing = members.find((item) => normalizePhone(item.primaryPhone) === normalizePhone(values.primaryPhone));
        if (existing) {
          completeRegistration(existing.sourceVisitorId ? `visitor:${existing.sourceVisitorId}` : `member:${existing.id}`, "Member");
          toast.info("This member is already registered. Their existing record is available in the register.");
          router.push("/attendance"); return;
        }
      }
      const existingVisitor = registrationOccurrence ? visitors.find((item) => !item.convertedMemberId && normalizePhone(item.phone) === normalizePhone(values.primaryPhone)) : visitor;
      const member = await addMember(values);
      if (existingVisitor) finishMemberConversion(existingVisitor.id, member.id);
      if (evangelismRecord) {
        finishEvangelismMemberConversion(evangelismRecord.id, member.id);
        toast.success(`${values.firstName} ${values.lastName} was registered as a member from their evangelism record.`);
        router.push(`/members/${member.id}`); return;
      }
      if (registrationOccurrence) {
        completeRegistration(existingVisitor ? `visitor:${existingVisitor.id}` : `member:${member.id}`, "Member");
        toast.success("Member registered. You can now mark them present in the selected register.");
        router.push("/attendance"); return;
      }
      toast.success(`${values.firstName} ${values.lastName} was added to the member directory.`);
      router.push(`/members/${member.id}`);
    } catch (error) {
      toast.error(error.message || "Could not register this member. Please try again.");
    }
  }

  function cancel() {
    cancelMemberConversion(); cancelRegistration();
    if (evangelismRecord) { cancelEvangelismMemberConversion(); router.push(`/evangelism/${evangelismRecord.id}`); return; }
    router.push(registrationOccurrence ? "/attendance" : visitor ? `/visitors/${visitor.id}` : "/members");
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <PageHeader
        title={visitor ? `Register ${visitor.firstName} ${visitor.lastName} as member` : evangelismRecord ? `Register ${evangelismRecord.firstName} as member` : "Register member"}
        description={registrationOccurrence ? `Adding an attendee for ${registrationOccurrence.branch} · ${registrationOccurrence.service} · ${registrationOccurrence.date}.` : visitor ? "Available visitor information has been transferred into this form. Complete the required membership details." : evangelismRecord ? "Available evangelism information has been transferred into this form. Complete the required membership details." : "Create a new church member record with the required identity and church details."}
        actions={<Button variant="outline" onClick={cancel}><ArrowLeft />{registrationOccurrence ? "Attendance" : visitor ? "Visitor profile" : evangelismRecord ? "Evangelism profile" : "Members"}</Button>}
      />
      {membershipNumber ? (
        <MemberForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Register member"
          onCancel={cancel}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Loading registration form…</p>
      )}
    </div>
  );
}

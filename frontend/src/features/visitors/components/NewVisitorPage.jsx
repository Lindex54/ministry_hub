"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { useVisitors } from "../VisitorsProvider";
import { emptyVisitorValues, VisitorForm } from "./VisitorForm";
import { useAttendance } from "@/features/attendance/AttendanceProvider";
import { useMembers } from "@/features/members/MembersProvider";
import { normalizePhone } from "@/features/outreach/outreach-utils.mjs";

export function NewVisitorPage() {
  const router = useRouter();
  const { addVisitor } = useVisitors();
  const { members } = useMembers();
  const { registrationOccurrence, completeRegistration, cancelRegistration } = useAttendance();
  function handleSubmit(values) {
    if (registrationOccurrence) {
      const existingMember = members.find((member) => normalizePhone(member.primaryPhone) === normalizePhone(values.phone));
      if (existingMember) {
        completeRegistration(existingMember.sourceVisitorId ? `visitor:${existingMember.sourceVisitorId}` : `member:${existingMember.id}`, "Member");
        toast.info("This person is already a member. Their existing record is available in the register."); router.push("/attendance"); return;
      }
    }
    const result = addVisitor(registrationOccurrence ? { ...values, branch: registrationOccurrence.branch } : values);
    if (registrationOccurrence) {
      completeRegistration(`visitor:${result.visitor.id}`);
      toast.success(result.isReturning ? "Existing visitor found. You can mark their attendance in the register." : "Visitor registered. You can now mark them present in the register.");
      router.push("/attendance"); return;
    }
    toast.success(result.isReturning ? `${values.firstName} ${values.lastName} was identified as a returning visitor and the visit was added.` : `${values.firstName} ${values.lastName} was added to the mock visitors directory.`);
    router.push(`/visitors/${result.visitor.id}`);
  }
  function cancel() { cancelRegistration(); router.push(registrationOccurrence ? "/attendance" : "/visitors"); }
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8"><PageHeader title="Register visitor" description={registrationOccurrence ? `Adding an attendee for ${registrationOccurrence.branch} · ${registrationOccurrence.service} · ${registrationOccurrence.date}.` : "Record a visitor and their first service attendance. Communication consent remains optional."} actions={<Button variant="outline" onClick={cancel}><ArrowLeft />{registrationOccurrence ? "Attendance" : "Visitors"}</Button>} /><VisitorForm registration visitContext={registrationOccurrence} defaultValues={{ ...emptyVisitorValues, dateOfVisit: registrationOccurrence?.date ?? format(new Date(), "yyyy-MM-dd"), serviceAttended: registrationOccurrence?.service ?? "" }} onSubmit={handleSubmit} onCancel={cancel} submitLabel="Register visitor" /></div>;
}

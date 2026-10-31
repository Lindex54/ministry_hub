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
import { useEvangelism } from "@/features/evangelism/EvangelismProvider";
import { getLatestEncounter } from "@/features/evangelism/data/evangelism.mock";

export function NewVisitorPage() {
  const router = useRouter();
  const { addVisitor } = useVisitors();
  const { members } = useMembers();
  const { registrationOccurrence, completeRegistration, cancelRegistration } = useAttendance();
  const { visitorConversionRecordId, getRecord, finishVisitorConversion, cancelVisitorConversion } = useEvangelism();
  const evangelismRecord = !registrationOccurrence && visitorConversionRecordId ? getRecord(visitorConversionRecordId) : null;
  async function handleSubmit(values) {
    try {
      if (registrationOccurrence) {
        const existingMember = members.find((member) => normalizePhone(member.primaryPhone) === normalizePhone(values.phone));
        if (existingMember) {
          completeRegistration(existingMember.sourceVisitorId ? `visitor:${existingMember.sourceVisitorId}` : `member:${existingMember.id}`, "Member");
          toast.info("This person is already a member. Their existing record is available in the register."); router.push("/attendance"); return;
        }
      }
      const result = await addVisitor(registrationOccurrence ? { ...values, branch: registrationOccurrence.branch } : values);
      if (registrationOccurrence) {
        completeRegistration(`visitor:${result.visitor.id}`);
        toast.success(result.isReturning ? "Existing visitor found. You can mark their attendance in the register." : "Visitor registered. You can now mark them present in the register.");
        router.push("/attendance"); return;
      }
      if (evangelismRecord) {
        finishVisitorConversion(evangelismRecord.id, result.visitor.id);
        toast.success(`${values.firstName} ${values.lastName} was registered as a visitor from their evangelism record.`);
        router.push(`/visitors/${result.visitor.id}`); return;
      }
      toast.success(result.isReturning ? `${values.firstName} ${values.lastName} was identified as a returning visitor and the visit was added.` : `${values.firstName} ${values.lastName} was added to the visitors directory.`);
      router.push(`/visitors/${result.visitor.id}`);
    } catch (error) {
      toast.error(error.message || "Could not register this visitor. Please try again.");
    }
  }
  function cancel() {
    cancelRegistration();
    if (evangelismRecord) { cancelVisitorConversion(); router.push(`/evangelism/${evangelismRecord.id}`); return; }
    router.push(registrationOccurrence ? "/attendance" : "/visitors");
  }
  const defaultValues = evangelismRecord ? { ...emptyVisitorValues, firstName: evangelismRecord.firstName, lastName: evangelismRecord.lastName, phone: evangelismRecord.phone, gender: evangelismRecord.gender, districtAddress: evangelismRecord.districtVillage, prayerRequest: getLatestEncounter(evangelismRecord)?.notes ?? "", permissionToContact: evangelismRecord.permissionToContact, dateOfVisit: format(new Date(), "yyyy-MM-dd") } : { ...emptyVisitorValues, dateOfVisit: registrationOccurrence?.date ?? format(new Date(), "yyyy-MM-dd"), serviceAttended: registrationOccurrence?.service ?? "" };
  return <div className="mx-auto flex w-full max-w-5xl flex-col gap-8"><PageHeader title={evangelismRecord ? `Register ${evangelismRecord.firstName} as visitor` : "Register visitor"} description={registrationOccurrence ? `Adding an attendee for ${registrationOccurrence.branch} · ${registrationOccurrence.service} · ${registrationOccurrence.date}.` : evangelismRecord ? "Available evangelism information has been transferred into this form. Choose the service they will attend." : "Record a visitor and their first service attendance. Communication consent remains optional."} actions={<Button variant="outline" onClick={cancel}><ArrowLeft />{registrationOccurrence ? "Attendance" : evangelismRecord ? "Evangelism profile" : "Visitors"}</Button>} /><VisitorForm registration visitContext={registrationOccurrence} defaultValues={defaultValues} onSubmit={handleSubmit} onCancel={cancel} submitLabel="Register visitor" /></div>;
}

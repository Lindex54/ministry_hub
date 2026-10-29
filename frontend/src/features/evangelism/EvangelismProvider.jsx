"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { findRecordByPhone } from "./evangelism-utils.mjs";
import { mockEvangelismRecords, mockOutreachActivities } from "./data/evangelism.mock";

const EvangelismContext = createContext(null);

export function EvangelismProvider({ children }) {
  const [records, setRecords] = useState(mockEvangelismRecords);
  const [activities, setActivities] = useState(mockOutreachActivities);
  const [visitorConversionRecordId, setVisitorConversionRecordId] = useState(null);
  const [memberConversionRecordId, setMemberConversionRecordId] = useState(null);

  const value = useMemo(() => ({
    records,
    activities,
    getRecord: (id) => records.find((record) => record.id === id),
    getActivity: (id) => activities.find((activity) => activity.id === id),
    addActivity: (activity) => {
      const next = { ...activity, id: `activity-${crypto.randomUUID()}` };
      setActivities((current) => [next, ...current]);
      return next;
    },
    updateActivity: (id, changes) => setActivities((current) => current.map((activity) => activity.id === id ? { ...activity, ...changes } : activity)),
    addRecord: (values) => {
      const encounter = { id: `enc-${crypto.randomUUID()}`, date: values.evangelismDate, location: values.outreachLocation, activityId: values.outreachActivity || null, evangelizedBy: values.evangelizedBy, response: values.response, notes: values.notes };
      const existing = findRecordByPhone(records, values.phone);
      if (existing) {
        const updated = {
          ...existing,
          lastName: values.lastName || existing.lastName,
          gender: values.gender || existing.gender,
          districtVillage: values.districtVillage || existing.districtVillage,
          branch: values.branch || existing.branch,
          permissionToContact: existing.permissionToContact || values.permissionToContact,
          followUpNeeded: values.followUpNeeded || existing.followUpNeeded,
          history: [...existing.history, encounter],
        };
        setRecords((current) => current.map((record) => record.id === existing.id ? updated : record));
        return { record: updated, isReturning: true };
      }
      const id = `evang-${crypto.randomUUID()}`;
      const next = { id, firstName: values.firstName, lastName: values.lastName, phone: values.phone, gender: values.gender, districtVillage: values.districtVillage, branch: values.branch, permissionToContact: values.permissionToContact, followUpNeeded: values.followUpNeeded, history: [encounter] };
      setRecords((current) => [next, ...current]);
      return { record: next, isReturning: false };
    },
    updateRecord: (id, changes) => setRecords((current) => current.map((record) => record.id === id ? { ...record, ...changes } : record)),
    addEncounter: (id, encounter) => setRecords((current) => current.map((record) => record.id === id ? { ...record, history: [...record.history, { ...encounter, id: `enc-${crypto.randomUUID()}` }] } : record)),
    visitorConversionRecordId,
    startVisitorConversion: setVisitorConversionRecordId,
    finishVisitorConversion: (recordId, visitorId) => {
      setRecords((current) => current.map((record) => record.id === recordId ? { ...record, convertedVisitorId: visitorId } : record));
      setVisitorConversionRecordId(null);
    },
    cancelVisitorConversion: () => setVisitorConversionRecordId(null),
    memberConversionRecordId,
    startMemberConversion: setMemberConversionRecordId,
    finishMemberConversion: (recordId, memberId) => {
      setRecords((current) => current.map((record) => record.id === recordId ? { ...record, convertedMemberId: memberId } : record));
      setMemberConversionRecordId(null);
    },
    cancelMemberConversion: () => setMemberConversionRecordId(null),
  }), [records, activities, visitorConversionRecordId, memberConversionRecordId]);

  return <EvangelismContext.Provider value={value}>{children}</EvangelismContext.Provider>;
}

export function useEvangelism() {
  const context = useContext(EvangelismContext);
  if (!context) throw new Error("useEvangelism must be used within EvangelismProvider.");
  return context;
}

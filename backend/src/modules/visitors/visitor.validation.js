import { z } from "zod";

export const visitorIdParams = z.object({ id: z.coerce.number().int().positive() });

const baseFields = {
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  phone: z.string().trim().min(1, "Phone number is required."),
  email: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  districtAddress: z.string().trim().optional(),
  invitedBy: z.string().trim().optional(),
  prayerRequest: z.string().trim().optional(),
  permissionToContact: z.boolean().optional(),
  convertedMemberId: z.union([z.string(), z.number()]).optional(),
  branch: z.string().trim().optional(),
};

export const createVisitorBody = z.object({
  ...baseFields,
  dateOfVisit: z.string().trim().optional(),
  serviceAttended: z.string().trim().optional(),
});

export const updateVisitorBody = z.object(
  Object.fromEntries(Object.entries(baseFields).map(([key, schema]) => [key, schema.optional()]))
);

export const addVisitBody = z.object({
  date: z.string().trim().min(1, "Visit date is required."),
  service: z.string().trim().min(1, "Service attended is required."),
  notes: z.string().trim().optional(),
});

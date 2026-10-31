import { z } from "zod";

export const memberIdParams = z.object({ id: z.coerce.number().int().positive() });

export const listMembersQuery = z.object({
  branchId: z.coerce.number().int().positive().optional(),
  status: z.enum(["Active", "Inactive", "Transferred"]).optional(),
});

const baseFields = {
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  preferredName: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  profilePhoto: z.string().optional(),
  primaryPhone: z.string().trim().min(1, "Primary phone number is required."),
  alternativePhone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  district: z.string().trim().optional(),
  address: z.string().trim().optional(),
  branch: z.string().trim().min(1, "Church branch is required."),
  dateJoined: z.string().trim().optional(),
  status: z.enum(["Active", "Inactive", "Transferred"]).optional(),
  ministries: z.array(z.string()).optional(),
  emergencyName: z.string().trim().optional(),
  emergencyRelationship: z.string().trim().optional(),
  emergencyPhone: z.string().trim().optional(),
};

export const createMemberBody = z.object(baseFields);

export const updateMemberBody = z.object(
  Object.fromEntries(Object.entries(baseFields).map(([key, schema]) => [key, schema.optional()]))
);

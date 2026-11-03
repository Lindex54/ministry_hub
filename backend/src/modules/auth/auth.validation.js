import { z } from "zod";

export const loginBody = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email."),
  password: z.string().min(1, "Enter your password."),
});

export const refreshBody = z.object({
  refreshToken: z.string().min(1, "Missing refresh token."),
});

const usernameSchema = z.string().trim().min(3, "Username must be at least 3 characters.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, dots, dashes, and underscores are allowed.");

export const updateProfileBody = z.object({
  name: z.string().trim().min(1).optional(),
  username: usernameSchema.optional(),
  email: z.string().trim().email().optional(),
  districtId: z.union([z.string(), z.number()]).optional(),
  countyId: z.union([z.string(), z.number()]).optional(),
  subCountyId: z.union([z.string(), z.number()]).optional(),
  parishId: z.union([z.string(), z.number()]).optional(),
  villageId: z.union([z.string(), z.number()]).optional(),
});

export const changePasswordBody = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

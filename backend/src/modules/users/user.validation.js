import { z } from "zod";

export const userIdParams = z.object({ id: z.coerce.number().int().positive() });

const usernameSchema = z.string().trim().min(3, "Username must be at least 3 characters.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Only letters, numbers, dots, dashes, and underscores are allowed.");

export const createUserBody = z.object({
  name: z.string().trim().min(1, "Name is required."),
  username: usernameSchema,
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  roleId: z.union([z.string(), z.number()]).optional(),
  password: z.string().trim().min(8, "Password must be at least 8 characters.").optional().or(z.literal("")),
});

export const updateUserBody = z.object({
  name: z.string().trim().min(1).optional(),
  username: usernameSchema.optional(),
  email: z.string().trim().email().optional(),
  roleId: z.union([z.string(), z.number()]).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
});

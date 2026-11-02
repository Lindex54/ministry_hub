import { z } from "zod";

export const loginBody = z.object({
  identifier: z.string().trim().min(1, "Enter your username or email."),
  password: z.string().min(1, "Enter your password."),
});

export const refreshBody = z.object({
  refreshToken: z.string().min(1, "Missing refresh token."),
});

import { z } from "zod";

const recipient = z.object({
  personType: z.enum(["member", "visitor"]),
  personId: z.coerce.number().int().positive(),
});

export const sendEmailCampaignBody = z.object({
  title: z.string().trim().min(1).max(255),
  subject: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1).max(100_000),
  association: z.string().trim().max(100).optional(),
  recipients: z.array(recipient).min(1).max(500),
});

import { z } from "zod";

export const followUpTaskIdParams = z.object({ id: z.coerce.number().int().positive() });

export const createFollowUpTaskBody = z.object({
  personKey: z.string().trim().min(1, "Choose a person."),
  workerId: z.string().trim().min(1, "Assign a worker."),
  method: z.string().trim().min(1, "Choose a method."),
  scheduledDate: z.string().trim().min(1, "Choose a date."),
  priority: z.string().trim().optional(),
  reason: z.string().trim().min(1, "Enter a reason."),
});

export const followUpFeedbackBody = z.object({
  reached: z.enum(["Yes", "No"]),
  status: z.enum(["Pending", "In Progress", "Completed", "Unable to Reach"]),
  outcome: z.string().trim().min(1, "Describe the outcome."),
  notes: z.string().trim().optional(),
  anotherFollowUp: z.boolean().optional(),
  nextDate: z.string().trim().optional(),
});

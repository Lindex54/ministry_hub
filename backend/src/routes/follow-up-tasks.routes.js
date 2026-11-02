import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  listFollowUpTasksRoute, getFollowUpTaskRoute, createFollowUpTaskRoute, addFollowUpFeedbackRoute,
} from "../modules/follow-ups/follow-up-task.controller.js";
import {
  followUpTaskIdParams, createFollowUpTaskBody, followUpFeedbackBody,
} from "../modules/follow-ups/follow-up-task.validation.js";

export const followUpTasksRouter = Router();

followUpTasksRouter.get("/", listFollowUpTasksRoute);
followUpTasksRouter.get("/:id", validate({ params: followUpTaskIdParams }), getFollowUpTaskRoute);
followUpTasksRouter.post("/", validate({ body: createFollowUpTaskBody }), createFollowUpTaskRoute);
followUpTasksRouter.post(
  "/:id/feedback",
  validate({ params: followUpTaskIdParams, body: followUpFeedbackBody }),
  addFollowUpFeedbackRoute
);

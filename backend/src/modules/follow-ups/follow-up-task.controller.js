import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import {
  listApiFollowUpTasks, getApiFollowUpTaskById, createApiFollowUpTask, addApiFollowUpFeedback,
} from "./follow-up-task.service.js";

export const listFollowUpTasksRoute = asyncHandler(async (request, response) => {
  response.json(await listApiFollowUpTasks(request.query));
});

export const getFollowUpTaskRoute = asyncHandler(async (request, response) => {
  const task = await getApiFollowUpTaskById(request.params.id);
  if (!task) throw AppError.notFound("Follow-up task not found.");
  response.json(task);
});

export const createFollowUpTaskRoute = asyncHandler(async (request, response) => {
  const task = await createApiFollowUpTask(request.body);
  response.status(201).json(task);
});

export const addFollowUpFeedbackRoute = asyncHandler(async (request, response) => {
  const task = await addApiFollowUpFeedback(request.params.id, request.body);
  if (!task) throw AppError.notFound("Follow-up task not found.");
  response.status(201).json(task);
});

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import {
  listApiUsers, getApiUserById, createApiUser, updateApiUser, resetApiUserPassword, deleteApiUser,
} from "./user.service.js";

export const listUsersRoute = asyncHandler(async (_request, response) => {
  response.json(await listApiUsers());
});

export const getUserRoute = asyncHandler(async (request, response) => {
  const user = await getApiUserById(request.params.id);
  if (!user) throw AppError.notFound("User not found.");
  response.json(user);
});

export const createUserRoute = asyncHandler(async (request, response) => {
  const result = await createApiUser(request.body);
  response.status(201).json(result);
});

export const updateUserRoute = asyncHandler(async (request, response) => {
  const user = await updateApiUser(request.params.id, request.body);
  if (!user) throw AppError.notFound("User not found.");
  response.json(user);
});

export const resetUserPasswordRoute = asyncHandler(async (request, response) => {
  const result = await resetApiUserPassword(request.params.id);
  if (!result) throw AppError.notFound("User not found.");
  response.json(result);
});

export const deleteUserRoute = asyncHandler(async (request, response) => {
  const deleted = await deleteApiUser(request.params.id);
  if (!deleted) throw AppError.notFound("User not found.");
  response.status(204).end();
});

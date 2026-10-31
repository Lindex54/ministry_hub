import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import {
  listApiVisitors, getApiVisitorById, createApiVisitor, updateApiVisitor, addApiVisit,
} from "./visitor.service.js";

export const listVisitors = asyncHandler(async (_request, response) => {
  response.json(await listApiVisitors());
});

export const getVisitor = asyncHandler(async (request, response) => {
  const visitor = await getApiVisitorById(request.params.id);
  if (!visitor) throw AppError.notFound("Visitor not found.");
  response.json(visitor);
});

export const createVisitor = asyncHandler(async (request, response) => {
  const result = await createApiVisitor(request.body);
  response.status(201).json(result);
});

export const updateVisitor = asyncHandler(async (request, response) => {
  const visitor = await updateApiVisitor(request.params.id, request.body);
  if (!visitor) throw AppError.notFound("Visitor not found.");
  response.json(visitor);
});

export const addVisit = asyncHandler(async (request, response) => {
  const visitor = await addApiVisit(request.params.id, request.body);
  if (!visitor) throw AppError.notFound("Visitor not found.");
  response.status(201).json(visitor);
});

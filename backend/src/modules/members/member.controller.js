import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import {
  listApiMembers, getApiMemberById, createApiMember, updateApiMember, previewNextMembershipNumber,
} from "./member.service.js";

export const listMembers = asyncHandler(async (request, response) => {
  const members = await listApiMembers(request.query);
  response.json(members);
});

export const getNextMembershipNumber = asyncHandler(async (_request, response) => {
  response.json({ membershipNumber: await previewNextMembershipNumber() });
});

export const getMember = asyncHandler(async (request, response) => {
  const member = await getApiMemberById(request.params.id);
  if (!member) throw AppError.notFound("Member not found.");
  response.json(member);
});

export const createMember = asyncHandler(async (request, response) => {
  try {
    const member = await createApiMember(request.body);
    response.status(201).json(member);
  } catch (error) {
    if (error.statusCode) throw AppError.badRequest(error.message);
    throw error;
  }
});

export const updateMember = asyncHandler(async (request, response) => {
  try {
    const member = await updateApiMember(request.params.id, request.body);
    if (!member) throw AppError.notFound("Member not found.");
    response.json(member);
  } catch (error) {
    if (error.statusCode === 400) throw AppError.badRequest(error.message);
    throw error;
  }
});

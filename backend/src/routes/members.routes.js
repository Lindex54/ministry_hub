import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import {
  listMembers, getMember, createMember, updateMember, getNextMembershipNumber,
} from "../modules/members/member.controller.js";
import {
  memberIdParams, listMembersQuery, createMemberBody, updateMemberBody,
} from "../modules/members/member.validation.js";

export const membersRouter = Router();

membersRouter.get("/next-number", getNextMembershipNumber);
membersRouter.get("/", validate({ query: listMembersQuery }), listMembers);
membersRouter.get("/:id", validate({ params: memberIdParams }), getMember);
membersRouter.post("/", validate({ body: createMemberBody }), createMember);
membersRouter.patch("/:id", validate({ params: memberIdParams, body: updateMemberBody }), updateMember);

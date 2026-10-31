import { Router } from "express";
import { getBranches } from "../modules/branches/branch.controller.js";

export const branchesRouter = Router();

branchesRouter.get("/", getBranches);

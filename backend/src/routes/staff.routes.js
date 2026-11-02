import { Router } from "express";
import { getStaff } from "../modules/staff/staff.controller.js";

export const staffRouter = Router();

staffRouter.get("/", getStaff);

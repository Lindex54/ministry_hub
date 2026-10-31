import { Router } from "express";
import { getDashboard } from "../modules/dashboard/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", getDashboard);

import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { listRolesRoute } from "../modules/users/role.controller.js";

export const rolesRouter = Router();

rolesRouter.get("/", authenticate, listRolesRoute);

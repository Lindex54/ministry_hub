import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.middleware.js";
import {
  listUsersRoute, getUserRoute, createUserRoute, updateUserRoute, resetUserPasswordRoute, deleteUserRoute,
} from "../modules/users/user.controller.js";
import { userIdParams, createUserBody, updateUserBody } from "../modules/users/user.validation.js";

export const usersRouter = Router();

usersRouter.use(authenticate, requireAdmin);
usersRouter.get("/", listUsersRoute);
usersRouter.get("/:id", validate({ params: userIdParams }), getUserRoute);
usersRouter.post("/", validate({ body: createUserBody }), createUserRoute);
usersRouter.patch("/:id", validate({ params: userIdParams, body: updateUserBody }), updateUserRoute);
usersRouter.post("/:id/reset-password", validate({ params: userIdParams }), resetUserPasswordRoute);
usersRouter.delete("/:id", validate({ params: userIdParams }), deleteUserRoute);

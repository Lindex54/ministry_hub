import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { login, refresh, me, updateMe, changePassword, logout } from "../modules/auth/auth.controller.js";
import { loginBody, refreshBody, updateProfileBody, changePasswordBody } from "../modules/auth/auth.validation.js";

export const authRouter = Router();

authRouter.post("/login", validate({ body: loginBody }), login);
authRouter.post("/refresh", validate({ body: refreshBody }), refresh);
authRouter.get("/me", authenticate, me);
authRouter.patch("/me", authenticate, validate({ body: updateProfileBody }), updateMe);
authRouter.post("/change-password", authenticate, validate({ body: changePasswordBody }), changePassword);
authRouter.post("/logout", logout);

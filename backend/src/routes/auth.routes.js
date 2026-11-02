import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { login, refresh, me, logout } from "../modules/auth/auth.controller.js";
import { loginBody, refreshBody } from "../modules/auth/auth.validation.js";

export const authRouter = Router();

authRouter.post("/login", validate({ body: loginBody }), login);
authRouter.post("/refresh", validate({ body: refreshBody }), refresh);
authRouter.get("/me", authenticate, me);
authRouter.post("/logout", logout);

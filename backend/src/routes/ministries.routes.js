import { Router } from "express";
import { getMinistries } from "../modules/ministries/ministry.controller.js";

export const ministriesRouter = Router();

ministriesRouter.get("/", getMinistries);

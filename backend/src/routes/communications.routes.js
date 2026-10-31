import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { listCampaigns, sendCampaign } from "../modules/communications/communication.controller.js";
import { sendEmailCampaignBody } from "../modules/communications/communication.validation.js";

export const communicationsRouter = Router();

communicationsRouter.get("/campaigns", listCampaigns);
communicationsRouter.post("/campaigns/email/send", validate({ body: sendEmailCampaignBody }), sendCampaign);

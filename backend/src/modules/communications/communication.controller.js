import { asyncHandler } from "../../utils/asyncHandler.js";
import { listEmailCampaigns, sendEmailCampaign } from "./communication.service.js";

export const listCampaigns = asyncHandler(async (_request, response) => {
  response.json(await listEmailCampaigns());
});

export const sendCampaign = asyncHandler(async (request, response) => {
  response.status(201).json(await sendEmailCampaign(request.body));
});

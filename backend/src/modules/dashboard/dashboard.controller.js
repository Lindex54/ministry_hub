import { asyncHandler } from "../../utils/asyncHandler.js";
import { getDashboardData } from "./dashboard.service.js";

export const getDashboard = asyncHandler(async (request, response) => {
  const { from, to } = request.query;
  const data = await getDashboardData({ from, to });
  response.json(data);
});

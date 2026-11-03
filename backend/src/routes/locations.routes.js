import { Router } from "express";
import {
  listDistricts, listCounties, listSubCounties, listParishes, listVillages,
} from "../modules/locations/location.controller.js";

export const locationsRouter = Router();

locationsRouter.get("/districts", listDistricts);
locationsRouter.get("/districts/:districtId/counties", listCounties);
locationsRouter.get("/counties/:countyId/sub-counties", listSubCounties);
locationsRouter.get("/sub-counties/:subCountyId/parishes", listParishes);
locationsRouter.get("/parishes/:parishId/villages", listVillages);

import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { listVisitors, getVisitor, createVisitor, updateVisitor, addVisit } from "../modules/visitors/visitor.controller.js";
import { visitorIdParams, createVisitorBody, updateVisitorBody, addVisitBody } from "../modules/visitors/visitor.validation.js";

export const visitorsRouter = Router();

visitorsRouter.get("/", listVisitors);
visitorsRouter.get("/:id", validate({ params: visitorIdParams }), getVisitor);
visitorsRouter.post("/", validate({ body: createVisitorBody }), createVisitor);
visitorsRouter.patch("/:id", validate({ params: visitorIdParams, body: updateVisitorBody }), updateVisitor);
visitorsRouter.post("/:id/visits", validate({ params: visitorIdParams, body: addVisitBody }), addVisit);

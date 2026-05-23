import { Router } from "express";
import * as c from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const dashboardRoutes = Router();

dashboardRoutes.get(
  "/department-spending",
  asyncHandler(c.departmentSpending),
);

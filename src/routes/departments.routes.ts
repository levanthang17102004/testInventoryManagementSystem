import { Router } from "express";
import * as c from "../controllers/departments.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const departmentsRoutes = Router();

departmentsRoutes.get("/", asyncHandler(c.list));
departmentsRoutes.get("/:id", asyncHandler(c.getById));
departmentsRoutes.post("/", asyncHandler(c.create));
departmentsRoutes.put("/:id", asyncHandler(c.update));
departmentsRoutes.delete("/:id", asyncHandler(c.remove));

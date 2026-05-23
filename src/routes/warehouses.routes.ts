import { Router } from "express";
import * as c from "../controllers/warehouses.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const warehousesRoutes = Router();

warehousesRoutes.get("/", asyncHandler(c.list));
warehousesRoutes.get("/:id", asyncHandler(c.getById));
warehousesRoutes.post("/", asyncHandler(c.create));
warehousesRoutes.put("/:id", asyncHandler(c.update));
warehousesRoutes.delete("/:id", asyncHandler(c.remove));

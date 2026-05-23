import { Router } from "express";
import * as c from "../controllers/inventoryReceipts.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const inventoryReceiptsRoutes = Router();

inventoryReceiptsRoutes.get("/", asyncHandler(c.list));
inventoryReceiptsRoutes.get("/next-number", asyncHandler(c.previewNextNumber));
inventoryReceiptsRoutes.get("/:id", asyncHandler(c.getById));
inventoryReceiptsRoutes.post("/", asyncHandler(c.create));
inventoryReceiptsRoutes.put("/:id", asyncHandler(c.update));
inventoryReceiptsRoutes.delete("/:id", asyncHandler(c.remove));

import { Router } from "express";
import * as c from "../controllers/products.controller.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

export const productsRoutes = Router();

productsRoutes.get("/", asyncHandler(c.list));
productsRoutes.get("/:id", asyncHandler(c.getById));
productsRoutes.post("/", asyncHandler(c.create));
productsRoutes.put("/:id", asyncHandler(c.update));
productsRoutes.delete("/:id", asyncHandler(c.remove));

import type { Application } from "express";
import { departmentsRoutes } from "./departments.routes.js";
import { inventoryReceiptsRoutes } from "./inventoryReceipts.routes.js";
import { productsRoutes } from "./products.routes.js";
import { warehousesRoutes } from "./warehouses.routes.js";

export function registerRoutes(app: Application): void {
  app.use("/api/departments", departmentsRoutes);
  app.use("/api/warehouses", warehousesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/inventory-receipts", inventoryReceiptsRoutes);
}

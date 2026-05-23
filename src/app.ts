import cors from "cors";
import express from "express";
import { health } from "./controllers/health.controller.js";
import { errorHandler, notFound } from "./middlewares/index.js";
import { registerRoutes } from "./routes/index.js";

export function createApp(): express.Application {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", health);

  registerRoutes(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

import { Router } from "express";
import { register } from "prom-client";

export const metricsRouter = Router();

metricsRouter.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.send(await register.metrics());
});

import "./tracing"; // must be first so instrumentation patches express and fetch
import express from "express";
import { config } from "./config/config";
import { healthRouter } from "./routes/health";
import { metricsRouter } from "./routes/metrics";
import { recordRequestMetrics } from "./routes/recordRequestMetrics";
import { processRouter } from "./routes/process";

const app = express();
app.use(express.json());
app.use(healthRouter);
app.use(metricsRouter);
app.use(recordRequestMetrics); // after health/metrics so probes and scrapes are not counted
app.use(processRouter);
app.listen(config.port, () => console.log(`app-attacker listening on ${config.port}`));

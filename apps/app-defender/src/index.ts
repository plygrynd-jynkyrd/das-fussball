import "./tracing"; // must be first so instrumentation patches express and fetch
import express from "express";
import { config } from "./config/config";
import { healthRouter } from "./routes/health";
import { metricsRouter } from "./routes/metrics";
import { runPipeline } from "./services/runPipeline";


const app = express();
app.use(healthRouter);
app.use(metricsRouter);
app.listen(config.port, () => console.log(`app-defender listening on ${config.port}`));

runPipeline().catch((err) => {
  console.error("Error running pipeline:", err);
  process.exit(1);
});
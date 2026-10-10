import "./tracing"; // must be first so instrumentation patches express and fetch
import express from "express";
import { config } from "./config/config";
import { healthRouter } from "./routes/health";
import { processRouter } from "./routes/process";

const app = express();
app.use(express.json());
app.use(healthRouter);
app.use(processRouter);
app.listen(config.port, () => console.log(`app-midfielder listening on ${config.port}`));

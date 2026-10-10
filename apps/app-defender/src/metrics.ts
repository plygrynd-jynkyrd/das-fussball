import { Counter, Histogram } from "prom-client";

// Registered on prom-client's default registry, which /metrics exposes.
export const requestsCompleted = new Counter({
  name: "requests_completed_total",
  help: "Completed requests",
  labelNames: ["method", "route", "status"],
});

export const requestDuration = new Histogram({
  name: "request_duration_seconds",
  help: "Request duration in seconds",
  labelNames: ["method", "route", "status"],
});

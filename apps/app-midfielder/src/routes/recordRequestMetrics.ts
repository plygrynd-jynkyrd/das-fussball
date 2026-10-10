import { NextFunction, Request, Response } from "express";
import { requestDuration, requestsCompleted } from "../metrics";

export function recordRequestMetrics(req: Request, res: Response, next: NextFunction): void {
  const stopTimer = requestDuration.startTimer();
  res.on("finish", () => {
    const labels = { method: req.method, route: req.route?.path ?? req.path, status: res.statusCode };
    requestsCompleted.inc(labels);
    stopTimer(labels);
  });
  next();
}

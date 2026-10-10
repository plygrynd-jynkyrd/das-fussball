import { setTimeout as sleep } from "node:timers/promises";
import { config } from "../config/config";

export async function simulateProcessing(): Promise<void> {
  const { minDelayMs, maxDelayMs } = config;
  await sleep(minDelayMs + Math.random() * (maxDelayMs - minDelayMs));
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nextServiceUrl: process.env.NEXT_SERVICE_URL ?? "http://app-midfielder:3002",
  minDelayMs: Number(process.env.MIN_DELAY_MS ?? 500),
  maxDelayMs: Number(process.env.MAX_DELAY_MS ?? 1500),
};

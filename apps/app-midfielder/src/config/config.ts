export const config = {
  port: Number(process.env.PORT ?? 3002),
  nextServiceUrl: process.env.NEXT_SERVICE_URL ?? "http://app-attacker:3003",
  minDelayMs: Number(process.env.MIN_DELAY_MS ?? 2000),
  maxDelayMs: Number(process.env.MAX_DELAY_MS ?? 5000),
};

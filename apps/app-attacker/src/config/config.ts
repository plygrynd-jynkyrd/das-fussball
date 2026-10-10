export const config = {
  port: Number(process.env.PORT ?? 3003),
  minDelayMs: Number(process.env.MIN_DELAY_MS ?? 1000),
  maxDelayMs: Number(process.env.MAX_DELAY_MS ?? 3000),
};

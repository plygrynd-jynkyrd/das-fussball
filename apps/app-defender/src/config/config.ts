export const config = {
  port: Number(process.env.PORT ?? 3001),
  nextServiceUrl: process.env.NEXT_SERVICE_URL ?? "http://app-midfielder:3002",
};

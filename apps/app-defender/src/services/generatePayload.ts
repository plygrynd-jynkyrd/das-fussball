import { randomUUID } from "node:crypto";
import { Payload } from "../models/payload";

export function generatePayload(): Payload {
  return {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    value: Math.floor(Math.random() * 1000),
  };
}

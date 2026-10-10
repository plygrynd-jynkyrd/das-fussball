import { Payload } from "../models/payload";
import { simulateProcessing } from "./simulateProcessing";

export async function processPayload(payload: Payload): Promise<{ status: string; id: string }> {
  await simulateProcessing();
  return { status: "done", id: payload.id };
}

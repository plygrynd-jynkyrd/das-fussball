import { sendToAttacker } from "../clients/sendToAttacker";
import { Payload } from "../models/payload";
import { simulateProcessing } from "./simulateProcessing";

export async function processPayload(payload: Payload): Promise<unknown> {
  console.log("received a pass from the defender service");
  await simulateProcessing();
  console.log("passed to the attacker service successfully");
  return sendToAttacker(payload);
}

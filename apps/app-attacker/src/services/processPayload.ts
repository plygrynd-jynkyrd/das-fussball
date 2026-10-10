import { Payload } from "../models/payload";
import { simulateProcessing } from "./simulateProcessing";

export async function processPayload(payload: Payload): Promise<{ status: string; id: string }> {
  console.log("received a pass from the midfielder service");
  await simulateProcessing();
  console.log("scored a goal!");
  return { status: "done", id: payload.id };
}

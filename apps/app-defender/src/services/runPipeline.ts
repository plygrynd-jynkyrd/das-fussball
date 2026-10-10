import { sendToMidfielder } from "../clients/sendToMidfielder";
import { generatePayload } from "./generatePayload";

export async function runPipeline(): Promise<unknown> {
  console.log("Passing to the mildiefielder service");
  await sendToMidfielder(generatePayload());
  console.log("Passed to the mildiefielder service successfully");
  return runPipeline();
}

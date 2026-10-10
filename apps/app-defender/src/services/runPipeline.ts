import { sendToMidfielder } from "../clients/sendToMidfielder";
import { requestDuration, requestsCompleted } from "../metrics";
import { generatePayload } from "./generatePayload";

// The defender has no inbound traffic, so it counts its outgoing sends instead.
const labels = { method: "POST", route: "/process" };

export async function runPipeline(): Promise<unknown> {
  console.log("Passing to the mildiefielder service");
  const stopTimer = requestDuration.startTimer(labels);
  await sendToMidfielder(generatePayload());
  stopTimer({ status: 200 });
  requestsCompleted.inc({ ...labels, status: 200 });
  console.log("Passed to the mildiefielder service successfully");
  return runPipeline();
}

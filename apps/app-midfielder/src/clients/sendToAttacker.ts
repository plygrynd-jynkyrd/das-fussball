import { config } from "../config/config";
import { Payload } from "../models/payload";

export async function sendToAttacker(payload: Payload): Promise<unknown> {
  const response = await fetch(`${config.nextServiceUrl}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`attacker responded ${response.status}`);
  return response.json();
}

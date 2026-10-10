import { Router } from "express";
import { processPayload } from "../services/processPayload";

export const processRouter = Router();

processRouter.post("/process", async (req, res) => {
  try {
    res.json(await processPayload(req.body));
  } catch (err) {
    console.error("Error processing payload:", err);
    res.status(500).json({ error: "processing failed" });
  }
});

import { Router } from "express";
import { getSummary } from "../controllers/ai_summary_controller.js";

const router = Router();

// GET: Ambil summary_json terbaru
router.get("/ai_summary", getSummary);

export default router;

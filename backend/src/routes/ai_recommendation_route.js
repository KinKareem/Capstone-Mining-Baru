import { Router } from "express";
import { getRecommendation } from "../controllers/ai_recommendation_controller.js";

const router = Router();

// GET: Ambil summary_json terbaru
router.get("/ai_recommendation", getRecommendation);

export default router;

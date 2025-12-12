import { Router } from "express";
import {
  getKpi,
  getScheduleTimeline,
  getTargetVsActual,
  getWeatherCards,
  getBlendingPlans,
  getOptimizationLogs,
  getSelectedScenario,
  getVesselStatus,
} from "../controllers/shipping_dashboard_controller.js";

const router = Router();

router.get("/kpi", getKpi);
router.get("/schedule", getScheduleTimeline);
router.get("/target-vs-actual", getTargetVsActual);
router.get("/vessel-status", getVesselStatus);
router.get("/weather", getWeatherCards);
router.get("/blending-plans", getBlendingPlans);
router.get("/optimization-logs", getOptimizationLogs);
router.get("/selected-scenario", getSelectedScenario);

export default router;

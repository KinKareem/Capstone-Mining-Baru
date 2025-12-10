import { Router } from "express";
import {
  getKpi,
  getDailyTrend,
  getEquipmentBreakdown,
  getEquipmentStatus,
  getAttendanceSummary,
  getAttendanceDetail,
  getWeeklySchedulePage,
  getWeatherInfo,
} from "../controllers/dashboard_controller.js";

const router = Router();

router.get("/kpi", getKpi);
router.get("/daily-trend", getDailyTrend);
router.get("/equipment-breakdown", getEquipmentBreakdown);
router.get("/equipment-status", getEquipmentStatus);
router.get("/attendance-trend", getAttendanceSummary);
router.get("/attendance-detail", getAttendanceDetail);
router.get("/weekly-schedule", getWeeklySchedulePage);
router.get("/weather-today", getWeatherInfo);

export default router;

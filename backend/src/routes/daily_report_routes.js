import express from "express";
import {
  getAllDailyReport,
  getDailyReportDetail,
  createNewDailyReportEntry,
  updateDailyReportEntry,
  deleteDailyReportEntry,
  getDailySummaryReport,
  getDailyReportStatistics,
  generateAutoDailyReportEntry,
  getAvailableEquipment,
  getActivePeriod,
  getCurrentPeriod,
} from "../controllers/daily_report_controller.js";

const router = express.Router();

router.get("/", getAllDailyReport);
router.get("/stats", getDailyReportStatistics);
router.get("/summary", getDailySummaryReport);
router.get("/current-period", getCurrentPeriod); // NEW
router.get("/:id", getDailyReportDetail);
router.post("/", createNewDailyReportEntry);
router.post("/generate/:date", generateAutoDailyReportEntry);
router.patch("/:id", updateDailyReportEntry);
router.delete("/:id", deleteDailyReportEntry);

// New routes for available equipment and active period
router.get("/:date/available-equipment", getAvailableEquipment);
router.get("/:date/active-period", getActivePeriod);

export default router;

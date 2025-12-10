import express from "express";
import {
  getDailyAttendance,
  updateAttendance,
  batchUpdateDailyAttendance,
  getDailyAttendanceSummary,
} from "../controllers/daily_attendance_controller.js";

const router = express.Router();

router.get("/", getDailyAttendance);
router.get("/summary", getDailyAttendanceSummary);
router.post("/:date/batch", batchUpdateDailyAttendance);
router.post("/:date/:employee_id", updateAttendance);

export default router;

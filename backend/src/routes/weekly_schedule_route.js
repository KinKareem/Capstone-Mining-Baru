import express from "express";
import {
  getAllWeeklySchedule,
  getWeeklyScheduleDetail,
  createNewWeeklyScheduleEntry,
  updateWeeklyScheduleEntry,
  deleteWeeklyScheduleEntry,
  getDropdownData,
} from "../controllers/weekly_schedule_controller.js";

const router = express.Router();

router.get("/", getAllWeeklySchedule);
router.get("/dropdowns", getDropdownData);
router.get("/:id", getWeeklyScheduleDetail);
router.post("/", createNewWeeklyScheduleEntry);
router.patch("/:id", updateWeeklyScheduleEntry);
router.delete("/:id", deleteWeeklyScheduleEntry);

export default router;

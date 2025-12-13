import express from "express";
import {
  getShippingSchedules,
  getShippingSchedule,
  createNewShippingSchedule,
  updateExistingShippingSchedule,
  deleteExistingShippingSchedule,
  getShippingStatistics,
} from "../controllers/shipping_schedule_controller.js";

const router = express.Router();

router.get("/", getShippingSchedules);
router.get("/stats", getShippingStatistics);
router.get("/:vessel_id", getShippingSchedule);
router.post("/", createNewShippingSchedule);
router.patch("/:vessel_id", updateExistingShippingSchedule);
router.delete("/:vessel_id", deleteExistingShippingSchedule);

export default router;

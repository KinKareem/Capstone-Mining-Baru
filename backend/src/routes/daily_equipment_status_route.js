import express from "express";
import {
  getCurrentStatus,
  getStatusForDate,
  getStatusHistory,
  getEquipmentHistory,
  updateEquipmentStatus,
  deleteStatus,
  getStats,
  getDropdownData,
  quickUpdateStatus,
} from "../controllers/daily_equipment_status_controller.js";

const router = express.Router();

// Get current status (today's view)
router.get("/current", getCurrentStatus);

// Get status for specific date
router.get("/date", getStatusForDate);

// Get status history (all records)
router.get("/history", getStatusHistory);

// Get equipment-specific history
router.get("/history/:equipmentId", getEquipmentHistory);

// Get statistics
router.get("/stats", getStats);

// Get dropdown data
router.get("/dropdowns", getDropdownData);

// Quick update (for current day)
router.post("/quick-update", quickUpdateStatus);

// Update or create status
router.post("/update", updateEquipmentStatus);

// Delete status record
router.delete("/:id", deleteStatus);

export default router;

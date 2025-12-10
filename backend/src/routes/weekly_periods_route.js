import express from "express";
import {
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
  generateNextPeriod,
} from "../controllers/weekly_periods_controller.js";

const router = express.Router();

// CRUD routes
router.get("/", getAllPeriods);
router.get("/:id", getPeriodById);
router.post("/", createPeriod);
router.put("/:id", updatePeriod);
router.delete("/:id", deletePeriod);

// Special routes
router.post("/generate-next", generateNextPeriod);

export default router;

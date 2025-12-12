import express from "express";
import {
  getShippingVessels,
  getShippingVessel,
  createNewShippingVessel,
  updateExistingShippingVessel,
  deleteExistingShippingVessel,
  getShippingVesselStatistics,
  getVesselLoadingDetailsController,
  getVesselStockpileAllocationController,
} from "../controllers/shipping_vessel_controller.js";

const router = express.Router();

// Main routes
router.get("/", getShippingVessels);
router.get("/stats", getShippingVesselStatistics);
router.get("/:id", getShippingVessel);
router.post("/", createNewShippingVessel);
router.patch("/:id", updateExistingShippingVessel);
router.delete("/:id", deleteExistingShippingVessel);

// Additional details
router.get("/:id/loading-details", getVesselLoadingDetailsController);
router.get("/:id/stockpile-allocation", getVesselStockpileAllocationController);

export default router;

import express from "express";
import {
    getShippingSchedules,
    getShippingSchedule,
    createNewShippingSchedule,
    updateExistingShippingSchedule,
    deleteExistingShippingSchedule
} from "../controllers/shipping_schedule_controller.js";

const router = express.Router();

router.post("/", createNewShippingSchedule);
router.get("/", getShippingSchedules);
router.get("/:id", getShippingSchedule);
router.patch("/:id", updateExistingShippingSchedule);
router.delete("/:id", deleteExistingShippingSchedule);

export default router;

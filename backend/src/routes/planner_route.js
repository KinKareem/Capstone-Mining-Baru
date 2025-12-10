import express from "express";

import {
    getAllWeatherData,
    getWeatherDataByDate,
    updateWeatherData,
} from "../controllers/planner_controller.js";

const router = express.Router();

// Weather management routes
router.get("/weather", getAllWeatherData);
router.get("/weather/:date", getWeatherDataByDate);
router.patch("/weather/:date", updateWeatherData);

export default router;

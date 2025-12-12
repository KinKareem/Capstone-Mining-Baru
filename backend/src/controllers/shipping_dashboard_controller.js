import {
  getUpcomingVesselCount,
  getCurrentWeekTargetTonnage,
  getShippingScheduleTimeline,
  getTargetVsActualLoadingPerVessel,
  getWeatherToday,
  getBlendingPlansFiltered,
  getPlanOptimizationLog,
  getLatestSelectedScenario,
  getVesselStatusList,
} from "../models/dashboard_model.js";

export const getKpi = async (req, res) => {
  try {
    const upcomingVessel = await getUpcomingVesselCount();
    const weeklyTarget = await getCurrentWeekTargetTonnage();
    const weather = await getWeatherToday();
    res.json({
      message: "GET Shipping KPI success",
      data: {
        upcomingVessel,
        weeklyTarget,
        portStatus: weather?.port_status ?? null,
        waveHeight: weather?.max_wave_m ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getScheduleTimeline = async (req, res) => {
  try {
    const rows = await getShippingScheduleTimeline();
    res.json({ message: "GET schedule timeline success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getTargetVsActual = async (req, res) => {
  try {
    const rows = await getTargetVsActualLoadingPerVessel();
    res.json({ message: "GET target vs actual success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getWeatherCards = async (req, res) => {
  try {
    const d = await getWeatherToday();
    res.json({ message: "GET weather today success", data: d });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getBlendingPlans = async (req, res) => {
  try {
    const week = req.query.week;
    const year = req.query.year;
    const rows = await getBlendingPlansFiltered(week, year);
    res.json({ message: "GET blending plans success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getOptimizationLogs = async (req, res) => {
  try {
    const rows = await getPlanOptimizationLog();
    res.json({ message: "GET optimization logs success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getSelectedScenario = async (req, res) => {
  try {
    const result = await getLatestSelectedScenario();
    res.json({ message: "GET selected scenario success", data: result });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getVesselStatus = async (req, res) => {
  try {
    const rows = await getVesselStatusList();
    res.json({ message: "GET vessel status success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

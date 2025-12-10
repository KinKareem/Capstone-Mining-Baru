import {
  getDailyTonnageToday,
  getEquipmentReadyPercentToday,
  getEmployeeAttendancePercentToday,
  getProductionVsWeeklyTarget,
  getDailyProductionTrend,
  getProductionByEquipment,
  getEquipmentStatusToday,
  getAttendanceTrend,
  getAttendanceTable,
  getWeeklySchedule,
  getWeatherToday,
} from "../models/dashboard_model.js";

export const getKpi = async (req, res) => {
  try {
    const dailyTonnageToday = await getDailyTonnageToday();
    const equipmentReady = await getEquipmentReadyPercentToday();
    const employeeAttendance = await getEmployeeAttendancePercentToday();
    const prodWeekly = await getProductionVsWeeklyTarget();
    res.json({
      message: "GET KPI success",
      data: {
        dailyTonnageToday,
        equipmentReady,
        employeeAttendance,
        productionWeekly: prodWeekly,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getDailyTrend = async (req, res) => {
  try {
    const days = Number(req.query.days || 30);
    const rows = await getDailyProductionTrend(days);
    res.json({ message: "GET daily trend success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getEquipmentBreakdown = async (req, res) => {
  try {
    const days = Number(req.query.days || 7);
    const rows = await getProductionByEquipment(days);
    res.json({ message: "GET equipment breakdown success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getEquipmentStatus = async (req, res) => {
  try {
    const result = await getEquipmentStatusToday();
    res.json({ message: "GET equipment status success", data: result });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const days = Number(req.query.days || 14);
    const rows = await getAttendanceTrend(days);
    res.json({ message: "GET attendance trend success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAttendanceDetail = async (req, res) => {
  try {
    const days = Number(req.query.days || 14);
    const rows = await getAttendanceTable(days);
    res.json({ message: "GET attendance detail success", data: rows });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getWeeklySchedulePage = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const result = await getWeeklySchedule(page, pageSize);
    res.json({ message: "GET weekly schedule success", data: result });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getWeatherInfo = async (req, res) => {
  try {
    const row = await getWeatherToday();
    res.json({ message: "GET weather today success", data: row });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

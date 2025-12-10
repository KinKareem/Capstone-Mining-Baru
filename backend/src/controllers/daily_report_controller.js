import {
  getAllDailyReports,
  getDailyReportById,
  createNewDailyReport,
  updateDailyReport,
  deleteDailyReport,
  getDailyReportDetails,
  getDailySummary,
  getDailyReportStats,
  generateAutoDailyReport,
  getAvailableEquipmentByDate,
  getPeriodByDate,
  getCurrentPeriodInfo,
} from "../models/daily_report_model.js";

// Get all daily reports
export const getAllDailyReport = async (req, res) => {
  try {
    const [data] = await getAllDailyReports();
    res.json({
      message: "GET ALL daily reports success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get daily report detail
export const getDailyReportDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [data] = await getDailyReportById(id);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Daily report not found",
        data: null,
      });
    }

    // Get report details (equipment activities)
    const [details] = await getDailyReportDetails(id);

    res.json({
      message: "GET detail daily report success",
      data: {
        ...data[0],
        details,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Create new daily report - AUTO period_id based on date
export const createNewDailyReportEntry = async (req, res) => {
  const { body } = req;

  // Validation: hanya date yang wajib
  if (!body.date) {
    return res.status(400).json({
      message: "Date is required",
      data: null,
    });
  }

  try {
    const result = await createNewDailyReport(body);

    res.status(201).json({
      message: "CREATE new daily report success",
      data: {
        ...body,
        report_id: result.insertId,
        period_id: result.period_id,
        period_code: result.period_code,
        total_equipment_ready: result.total_equipment_ready,
        total_employees_present: result.total_employees_present,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Server error",
      serverMessage: error.message,
    });
  }
};

// Update daily report - AUTO period_id jika date diubah
export const updateDailyReportEntry = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    await updateDailyReport(body, id);
    res.status(200).json({
      message: "UPDATE daily report success",
      data: {
        report_id: id,
        ...body,
      },
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Server Error",
      serverMessage: error.message,
    });
  }
};

// Delete daily report
export const deleteDailyReportEntry = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteDailyReport(id);
    res.status(200).json({
      message: "DELETE daily report success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

// Get daily summary
export const getDailySummaryReport = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
      data: null,
    });
  }

  try {
    const summary = await getDailySummary(date);
    res.json({
      message: "GET daily summary success",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get statistics
export const getDailyReportStatistics = async (req, res) => {
  try {
    const stats = await getDailyReportStats();
    res.json({
      message: "GET daily report statistics success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Generate auto daily report
export const generateAutoDailyReportEntry = async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
      data: null,
    });
  }

  try {
    const result = await generateAutoDailyReport(date);
    res.status(201).json({
      message: "Auto-generated daily report success",
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get available equipment for a date
export const getAvailableEquipment = async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
      data: null,
    });
  }

  try {
    const [equipment] = await getAvailableEquipmentByDate(date);
    res.json({
      message: "GET available equipment success",
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get active period for a date
export const getActivePeriod = async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
      data: null,
    });
  }

  try {
    const [period] = await getPeriodByDate(date);
    if (period.length === 0) {
      return res.status(404).json({
        message: "No active period found for this date",
        data: null,
      });
    }
    res.json({
      message: "GET active period success",
      data: period[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get current period info (for dashboard)
export const getCurrentPeriod = async (req, res) => {
  try {
    const periodInfo = await getCurrentPeriodInfo();
    if (!periodInfo) {
      return res.status(404).json({
        message: "No active period found for today",
        data: null,
      });
    }
    res.json({
      message: "GET current period info success",
      data: periodInfo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

import * as weeklyPeriodsModel from "../models/weekly_periods_model.js";

export const getAllPeriods = async (req, res) => {
  try {
    const periods = await weeklyPeriodsModel.getAllWeeklyPeriods();
    res.json({
      success: true,
      data: periods,
      message: "Weekly periods retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getAllPeriods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve weekly periods",
      error: error.message,
    });
  }
};

export const getPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    const period = await weeklyPeriodsModel.getWeeklyPeriodById(id);

    if (!period) {
      return res.status(404).json({
        success: false,
        message: "Weekly period not found",
      });
    }

    res.json({
      success: true,
      data: period,
      message: "Weekly period retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getPeriodById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve weekly period",
      error: error.message,
    });
  }
};

export const createPeriod = async (req, res) => {
  try {
    const {
      period_code,
      start_date,
      end_date,
      target_tonnage,
      stockpile_tons_target,
    } = req.body;

    // Validation
    if (!period_code || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: period_code, start_date, end_date",
      });
    }

    const periodId = await weeklyPeriodsModel.createWeeklyPeriod({
      period_code,
      start_date,
      end_date,
      target_tonnage: parseFloat(target_tonnage) || 0,
      stockpile_tons_target: parseFloat(stockpile_tons_target) || 0,
    });

    res.status(201).json({
      success: true,
      data: { period_id: periodId, ...req.body },
      message: "Weekly period created successfully",
    });
  } catch (error) {
    console.error("Error in createPeriod:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create weekly period",
      error: error.message,
    });
  }
};

export const updatePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      period_code,
      start_date,
      end_date,
      target_tonnage,
      stockpile_tons_target,
    } = req.body;

    // Check if period exists
    const existingPeriod = await weeklyPeriodsModel.getWeeklyPeriodById(id);
    if (!existingPeriod) {
      return res.status(404).json({
        success: false,
        message: "Weekly period not found",
      });
    }

    const affectedRows = await weeklyPeriodsModel.updateWeeklyPeriod(id, {
      period_code: period_code || existingPeriod.period_code,
      start_date: start_date || existingPeriod.start_date,
      end_date: end_date || existingPeriod.end_date,
      target_tonnage:
        target_tonnage !== undefined
          ? parseFloat(target_tonnage)
          : existingPeriod.target_tonnage,
      stockpile_tons_target:
        stockpile_tons_target !== undefined
          ? parseFloat(stockpile_tons_target)
          : existingPeriod.stockpile_tons_target,
    });

    res.json({
      success: true,
      data: { period_id: id, ...req.body },
      message: "Weekly period updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePeriod:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update weekly period",
      error: error.message,
    });
  }
};

export const deletePeriod = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if period exists
    const existingPeriod = await weeklyPeriodsModel.getWeeklyPeriodById(id);
    if (!existingPeriod) {
      return res.status(404).json({
        success: false,
        message: "Weekly period not found",
      });
    }

    const affectedRows = await weeklyPeriodsModel.deleteWeeklyPeriod(id);

    res.json({
      success: true,
      message: "Weekly period deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePeriod:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete weekly period",
      error: error.message,
    });
  }
};

export const generateNextPeriod = async (req, res) => {
  try {
    const newPeriod = await weeklyPeriodsModel.generateNextWeeklyPeriod();

    res.status(201).json({
      success: true,
      data: newPeriod,
      message: "Next weekly period generated successfully",
    });
  } catch (error) {
    console.error("Error in generateNextPeriod:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate next weekly period",
      error: error.message,
    });
  }
};

import {
  getCurrentEquipmentStatus,
  getAllDailyEquipmentStatus,
  getEquipmentStatusHistory,
  upsertDailyEquipmentStatus,
  getTodayEquipmentStatus,
  getStatusByDate,
  deleteDailyEquipmentStatus,
  getDailyEquipmentStatusStats,
  getAvailableEquipment,
  getAllLocations,
} from "../models/daily_equipment_status_model.js";

// Get current status for all equipment
export const getCurrentStatus = async (req, res) => {
  try {
    const [data] = await getTodayEquipmentStatus();
    res.json({
      message: "GET current equipment status success",
      data,
    });
  } catch (error) {
    console.error("Error getting current equipment status:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get status for specific date
export const getStatusForDate = async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
      data: null,
    });
  }

  try {
    const [data] = await getStatusByDate(date);
    res.json({
      message: "GET equipment status for date success",
      data,
    });
  } catch (error) {
    console.error("Error getting status for date:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get all status history
export const getStatusHistory = async (req, res) => {
  try {
    const filters = {
      date: req.query.date || null,
      equipment_status: req.query.status || null,
      equipment_type: req.query.type || null,
    };

    const [data] = await getAllDailyEquipmentStatus(filters);
    res.json({
      message: "GET all status history success",
      data,
    });
  } catch (error) {
    console.error("Error getting status history:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get equipment status history by equipment ID
export const getEquipmentHistory = async (req, res) => {
  const { equipmentId } = req.params;

  try {
    const [data] = await getEquipmentStatusHistory(equipmentId);
    res.json({
      message: "GET equipment history success",
      data,
    });
  } catch (error) {
    console.error("Error getting equipment history:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Update or create daily equipment status
export const updateEquipmentStatus = async (req, res) => {
  const { body } = req;

  // Validation
  if (!body.equipment_id || !body.equipment_status) {
    return res.status(400).json({
      message: "Equipment ID and status are required",
      data: null,
    });
  }

  // Default to today's date if not provided
  const date = body.date || new Date().toISOString().split("T")[0];

  try {
    await upsertDailyEquipmentStatus({
      ...body,
      date: date,
    });

    res.status(200).json({
      message: "Equipment status updated successfully",
      data: {
        equipment_id: body.equipment_id,
        date: date,
        equipment_status: body.equipment_status,
      },
    });
  } catch (error) {
    console.error("Error updating equipment status:", error);
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

// Delete status record
export const deleteStatus = async (req, res) => {
  const { id } = req.params;

  try {
    await deleteDailyEquipmentStatus(id);

    res.status(200).json({
      message: "Status record deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting status record:", error);
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    const [data] = await getDailyEquipmentStatusStats();

    res.json({
      message: "GET equipment status stats success",
      data,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get dropdown data
export const getDropdownData = async (req, res) => {
  try {
    const [equipment] = await getAvailableEquipment();
    const [locations] = await getAllLocations();

    res.json({
      message: "GET dropdown data success",
      data: {
        equipment,
        locations,
      },
    });
  } catch (error) {
    console.error("Error getting dropdown data:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Quick update status (simple update for current day)
export const quickUpdateStatus = async (req, res) => {
  const { equipment_id, equipment_status, remarks } = req.body;
  const today = new Date().toISOString().split("T")[0];

  if (!equipment_id || !equipment_status) {
    return res.status(400).json({
      message: "Equipment ID and status are required",
      data: null,
    });
  }

  try {
    await upsertDailyEquipmentStatus({
      equipment_id,
      equipment_status,
      remarks: remarks || null,
      date: today,
    });

    res.status(200).json({
      message: "Status updated successfully",
      data: {
        equipment_id,
        date: today,
        equipment_status,
      },
    });
  } catch (error) {
    console.error("Error in quick update:", error);
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

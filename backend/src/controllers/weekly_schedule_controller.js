import {
  getAllWeeklySchedules,
  getWeeklyScheduleById,
  createNewWeeklySchedule,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  getScheduleDropdowns,
} from "../models/weekly_schedule_model.js";

// Get all schedules
export const getAllWeeklySchedule = async (req, res) => {
  try {
    const [data] = await getAllWeeklySchedules();
    res.json({
      message: "GET ALL weekly schedules success",
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get schedule detail
export const getWeeklyScheduleDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const [data] = await getWeeklyScheduleById(id);

    if (data.length === 0) {
      return res.status(404).json({
        message: "Schedule not found",
        data: null,
      });
    }

    res.json({
      message: "GET detail schedule success",
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Create new schedule
export const createNewWeeklyScheduleEntry = async (req, res) => {
  const { body } = req;

  // Validation
  if (
    !body.period_id ||
    !body.date ||
    !body.employee_id ||
    !body.equipment_id ||
    !body.shift_id ||
    !body.location_id
  ) {
    return res.status(400).json({
      message: "Missing required fields",
      data: null,
    });
  }

  try {
    await createNewWeeklySchedule(body);
    res.status(201).json({
      message: "CREATE new schedule success",
      data: body,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

// Update schedule
export const updateWeeklyScheduleEntry = async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  try {
    await updateWeeklySchedule(body, id);
    res.status(200).json({
      message: "UPDATE schedule success",
      data: {
        schedule_id: id,
        ...body,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Delete schedule
export const deleteWeeklyScheduleEntry = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteWeeklySchedule(id);
    res.status(200).json({
      message: "DELETE schedule success",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      serverMessage: error.message,
    });
  }
};

// Get dropdown data
export const getDropdownData = async (req, res) => {
  try {
    const dropdowns = await getScheduleDropdowns();
    res.json({
      message: "GET dropdown data success",
      data: dropdowns,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

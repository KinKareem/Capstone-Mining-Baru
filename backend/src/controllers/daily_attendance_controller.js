import {
  getAllAttendanceData,
  upsertDailyAttendance,
  batchUpdateAttendance,
  getAttendanceSummary,
} from "../models/daily_attendance_model.js";

// Get all attendance data for date
// Get all attendance data for date
export const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date parameter is required",
        data: null,
      });
    }

    const data = await getAllAttendanceData(date);
    const summary = await getAttendanceSummary(date);

    res.json({
      message: "GET daily attendance success",
      data: {
        ...data,
        summary: summary.summary,
        total_scheduled: summary.total_scheduled,
        total_employees: summary.total_employees,
      },
    });
  } catch (error) {
    console.error("Error in getDailyAttendance:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Create or update single attendance
export const updateAttendance = async (req, res) => {
  try {
    const { date, employee_id } = req.params;
    const { attendance_status, remarks } = req.body;

    console.log("updateAttendance called with:", { date, employee_id, attendance_status, remarks });

    if (!date || !employee_id || !attendance_status) {
      return res.status(400).json({
        message: "Date, employee_id, and attendance_status are required",
        data: null,
      });
    }

    // Validasi attendance_status
    const validStatuses = ['present', 'sick', 'permission', 'absent', 'leave'];
    if (!validStatuses.includes(attendance_status)) {
      return res.status(400).json({
        message: "Invalid attendance status",
        data: null,
      });
    }

    // LANGSUNG UPDATE TANPA CEK JADWAL
    const result = await upsertDailyAttendance(date, parseInt(employee_id), {
      attendance_status,
      remarks: remarks || null,
    });

    console.log("upsert result:", result);

    res.json({
      message: "Attendance updated successfully",
      data: {
        date,
        employee_id: parseInt(employee_id),
        attendance_status,
        remarks: remarks || null,
        attendance_id: result.attendance_id,
      },
    });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Batch update attendance
export const batchUpdateDailyAttendance = async (req, res) => {
  try {
    const { date } = req.params;
    const { attendance } = req.body;

    if (!date) {
      return res.status(400).json({
        message: "Date parameter is required",
        data: null,
      });
    }

    if (!attendance || !Array.isArray(attendance)) {
      return res.status(400).json({
        message: "Attendance array is required",
        data: null,
      });
    }

    // Filter hanya karyawan yang dijadwalkan
    const scheduledEmployees = [];
    for (const att of attendance) {
      const [scheduled] = await req.dbPool.execute(
        `SELECT 1 FROM weekly_schedule 
         WHERE date = ? AND employee_id = ?`,
        [date, att.employee_id]
      );

      if (scheduled.length > 0) {
        scheduledEmployees.push(att);
      }
    }

    if (scheduledEmployees.length === 0) {
      return res.status(400).json({
        message: "No scheduled employees found in the provided list",
        data: null,
      });
    }

    const result = await batchUpdateAttendance(date, scheduledEmployees);

    res.json({
      message: result.message,
      data: {
        date,
        updated_count: scheduledEmployees.length,
        results: result.results,
      },
    });
  } catch (error) {
    console.error("Error in batchUpdateDailyAttendance:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};

// Get attendance summary
export const getDailyAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date parameter is required",
        data: null,
      });
    }

    const summary = await getAttendanceSummary(date);

    res.json({
      message: "GET attendance summary success",
      data: summary,
    });
  } catch (error) {
    console.error("Error in getDailyAttendanceSummary:", error);
    res.status(500).json({
      message: "Server Error",
      serverMessage: error.message,
    });
  }
};
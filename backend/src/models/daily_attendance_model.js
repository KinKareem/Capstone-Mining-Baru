import { pool as dbPool } from "../config/database.js";

// Get all attendance data for date
export const getAllAttendanceData = async (date) => {
  try {
    // 1. Ambil SEMUA karyawan yang dijadwalkan di weekly_schedule untuk tanggal ini
    const [scheduledData] = await dbPool.execute(
      `SELECT 
        ws.schedule_id,
        ws.employee_id,
        ws.date,
        ws.equipment_id,
        ws.shift_id,
        ws.location_id,
        ws.notes as schedule_notes,
        e.name,
        e.position,
        e.competency,
        s.shift_name,
        s.start_time,
        s.end_time,
        l.location_name,
        he.unit_code as equipment_code,
        he.equipment_type
      FROM weekly_schedule ws
      LEFT JOIN employees e ON ws.employee_id = e.employee_id
      LEFT JOIN shifts s ON ws.shift_id = s.shift_id
      LEFT JOIN locations l ON ws.location_id = l.location_id
      LEFT JOIN heavy_equipment he ON ws.equipment_id = he.equipment_id
      WHERE ws.date = ?
      ORDER BY COALESCE(e.name, 'Unknown')`,
      [date]
    );

    if (scheduledData.length === 0) {
      return {
        attendance: [],
        date,
        message: "No scheduled employees found for this date",
      };
    }

    // 2. Ambil data kehadiran yang sudah tercatat untuk tanggal ini
    const [existingAttendance] = await dbPool.execute(
      `SELECT 
        da.attendance_id,
        da.employee_id,
        da.attendance_status,
        da.remarks
      FROM daily_attendance da
      WHERE da.date = ?`,
      [date]
    );

    // 3. Buat map untuk data attendance yang sudah ada
    const attendanceMap = new Map();
    existingAttendance.forEach((item) => {
      attendanceMap.set(item.employee_id, item);
    });

    // 4. Proses setiap karyawan yang dijadwalkan
    const attendanceList = scheduledData.map((scheduled) => {
      const existing = attendanceMap.get(scheduled.employee_id);

      // Jika sudah ada catatan di daily_attendance, gunakan status dari sana
      if (existing) {
        return {
          ...scheduled,
          attendance_id: existing.attendance_id,
          attendance_status: existing.attendance_status,
          remarks: existing.remarks || scheduled.schedule_notes,
          is_edited: true,
        };
      } else {
        // Default: semua yang dijadwalkan dianggap hadir
        return {
          ...scheduled,
          attendance_id: null,
          attendance_status: "present", // SEMUA default present
          remarks: scheduled.schedule_notes || "",
          is_edited: false,
        };
      }
    });

    return {
      attendance: attendanceList,
      date,
      total_scheduled: scheduledData.length,
    };
  } catch (error) {
    console.error("Error in getAllAttendanceData:", error);
    throw error;
  }
};

// Get attendance summary
export const getAttendanceSummary = async (date) => {
  try {
    const data = await getAllAttendanceData(date);

    // Hitung summary
    const summary = {
      present: 0,
      sick: 0,
      permission: 0,
      absent: 0,
      leave: 0,
    };

    data.attendance.forEach((item) => {
      const status = item.attendance_status;
      if (summary[status] !== undefined) {
        summary[status]++;
      }
    });

    // Convert ke array format
    const summaryArray = Object.keys(summary).map((status) => ({
      attendance_status: status,
      count: summary[status],
    }));

    return {
      summary: summaryArray,
      total_scheduled: data.total_scheduled || 0,
      total_employees: data.attendance.length,
    };
  } catch (error) {
    console.error("Error in getAttendanceSummary:", error);
    throw error;
  }
};

// Create or update attendance
export const upsertDailyAttendance = async (
  date,
  employeeId,
  attendanceData
) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if attendance already exists
    const [existing] = await connection.execute(
      `SELECT attendance_id FROM daily_attendance 
       WHERE date = ? AND employee_id = ?`,
      [date, employeeId]
    );

    let result;
    if (existing.length > 0) {
      // Update existing
      const SQLQuery = `
        UPDATE daily_attendance 
        SET attendance_status = ?, remarks = ?, created_at = NOW()
        WHERE attendance_id = ?
      `;
      const [updateResult] = await connection.execute(SQLQuery, [
        attendanceData.attendance_status,
        attendanceData.remarks || null,
        existing[0].attendance_id,
      ]);
      result = { updated: true, attendance_id: existing[0].attendance_id };
    } else {
      // Create new
      const SQLQuery = `
        INSERT INTO daily_attendance 
        (date, employee_id, attendance_status, remarks, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const [insertResult] = await connection.execute(SQLQuery, [
        date,
        employeeId,
        attendanceData.attendance_status,
        attendanceData.remarks || null,
      ]);
      result = { updated: false, attendance_id: insertResult.insertId };
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error("Error in upsertDailyAttendance:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Batch update attendance
export const batchUpdateAttendance = async (date, attendanceList) => {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    const results = [];
    for (const attendance of attendanceList) {
      const result = await upsertDailyAttendance(
        date,
        attendance.employee_id,
        attendance
      );
      results.push({
        employee_id: attendance.employee_id,
        ...result,
      });
    }

    await connection.commit();
    return {
      success: true,
      message: `Attendance updated for ${results.length} employees`,
      results,
    };
  } catch (error) {
    await connection.rollback();
    console.error("Error in batchUpdateAttendance:", error);
    throw error;
  } finally {
    connection.release();
  }
};

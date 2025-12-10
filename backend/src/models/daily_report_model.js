import { pool as dbPool } from "../config/database.js";

// FUNGSI UTAMA: Get period by date (tanggal antara start_date dan end_date)
export const getPeriodByDate = (date) => {
  const SQLQuery = `
    SELECT period_id, period_code, target_tonnage 
    FROM weekly_periods 
    WHERE ? BETWEEN start_date AND end_date
    LIMIT 1
  `;
  return dbPool.execute(SQLQuery, [date]);
};

// Get equipment ready count by date using persistent status
export const getReadyEquipmentCountByDate = (date) => {
  const SQLQuery = `
    WITH LatestStatus AS (
      SELECT 
        equipment_id,
        MAX(date) as latest_date
      FROM daily_equipment_status
      WHERE date <= ?
      GROUP BY equipment_id
    )
    SELECT COUNT(*) as count
    FROM heavy_equipment he
    LEFT JOIN LatestStatus ls ON he.equipment_id = ls.equipment_id
    LEFT JOIN daily_equipment_status des ON ls.equipment_id = des.equipment_id AND ls.latest_date = des.date
    WHERE COALESCE(des.equipment_status, he.default_status) = 'ready'
  `;
  return dbPool.execute(SQLQuery, [date]);
};

// Get attendance count by date
export const getAttendanceCountByDate = (date) => {
  const SQLQuery = `
    SELECT COUNT(*) as count 
    FROM daily_attendance 
    WHERE date = ? AND attendance_status IN ('present', 'permission')
  `;
  return dbPool.execute(SQLQuery, [date]);
};

// Get all daily reports with period info
export const getAllDailyReports = () => {
  const SQLQuery = `
    SELECT 
      dr.report_id,
      dr.date,
      dr.daily_tonnage,
      dr.total_employees_present,
      dr.total_equipment_ready,
      dr.notes,
      dr.created_at,
      wp.period_code,
      wp.target_tonnage,
      wp.stockpile_tons_target
    FROM daily_reports dr
    LEFT JOIN weekly_periods wp ON dr.period_id = wp.period_id
    ORDER BY dr.date DESC
  `;
  return dbPool.execute(SQLQuery);
};

// Get daily report by ID
export const getDailyReportById = (id) => {
  const SQLQuery = `
    SELECT 
      dr.*,
      wp.period_code,
      wp.target_tonnage,
      wp.stockpile_tons_target
    FROM daily_reports dr
    LEFT JOIN weekly_periods wp ON dr.period_id = wp.period_id
    WHERE dr.report_id = ?
  `;
  return dbPool.execute(SQLQuery, [id]);
};

// Create new daily report - AUTO period_id based on date
export const createNewDailyReport = async (body) => {
  try {
    // 1. Validate date
    if (!body.date) {
      throw new Error("Date is required");
    }

    // 2. Cari period_id berdasarkan tanggal (BETWEEN start_date AND end_date)
    const [periodRows] = await getPeriodByDate(body.date);
    if (periodRows.length === 0) {
      throw new Error(
        `No active period found for date: ${body.date}. Please create a weekly period first.`
      );
    }

    const period_id = periodRows[0].period_id;
    const period_code = periodRows[0].period_code;

    // 3. Jika total_equipment_ready tidak diberikan, hitung dari status equipment
    let total_equipment_ready = body.total_equipment_ready;
    if (total_equipment_ready === undefined || total_equipment_ready === null) {
      const [equipmentRows] = await getReadyEquipmentCountByDate(body.date);
      total_equipment_ready = equipmentRows[0].count || 0;
    }

    // 4. Jika total_employees_present tidak diberikan, hitung dari attendance
    let total_employees_present = body.total_employees_present;
    if (
      total_employees_present === undefined ||
      total_employees_present === null
    ) {
      const [attendanceRows] = await getAttendanceCountByDate(body.date);
      total_employees_present = attendanceRows[0].count || 0;
    }

    const SQLQuery = `
      INSERT INTO daily_reports 
        (period_id, date, daily_tonnage, total_employees_present, total_equipment_ready, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await dbPool.execute(SQLQuery, [
      period_id,
      body.date,
      body.daily_tonnage || 0,
      total_employees_present,
      total_equipment_ready,
      body.notes || null,
    ]);

    return {
      insertId: result.insertId,
      period_id,
      period_code,
      total_equipment_ready,
      total_employees_present,
    };
  } catch (error) {
    throw error;
  }
};

// Update daily report - AUTO period_id jika date diubah
export const updateDailyReport = async (body, id) => {
  try {
    let period_id = body.period_id;
    let date = body.date;

    // Jika date diubah, cari period_id baru berdasarkan date
    if (body.date) {
      const [periodRows] = await getPeriodByDate(body.date);
      if (periodRows.length === 0) {
        throw new Error(`No active period found for date: ${body.date}`);
      }
      period_id = periodRows[0].period_id;
      date = body.date;
    }

    const SQLQuery = `
      UPDATE daily_reports
      SET 
        period_id = ?,
        date = ?,
        daily_tonnage = ?,
        total_employees_present = ?,
        total_equipment_ready = ?,
        notes = ?
      WHERE report_id = ?
    `;

    return dbPool.execute(SQLQuery, [
      period_id,
      date,
      body.daily_tonnage || 0,
      body.total_employees_present || 0,
      body.total_equipment_ready || 0,
      body.notes || null,
      id,
    ]);
  } catch (error) {
    throw error;
  }
};

// Delete daily report
export const deleteDailyReport = (id) => {
  const SQLQuery = `DELETE FROM daily_reports WHERE report_id = ?`;
  return dbPool.execute(SQLQuery, [id]);
};

// Get daily report details (equipment activities)
export const getDailyReportDetails = (reportId) => {
  const SQLQuery = `
    SELECT 
      d.*,
      e.name as employee_name,
      e.position,
      h.unit_code,
      h.equipment_type,
      TIMEDIFF(d.end_time, d.start_time) as duration
    FROM daily_report_details d
    LEFT JOIN employees e ON d.employee_id = e.employee_id
    LEFT JOIN heavy_equipment h ON d.equipment_id = h.equipment_id
    WHERE d.report_id = ?
    ORDER BY d.start_time
  `;
  return dbPool.execute(SQLQuery, [reportId]);
};

// Get daily summary for specific date - DIPERBARUI untuk equipment count
export const getDailySummary = async (date) => {
  // Get attendance count
  const [attendance] = await getAttendanceCountByDate(date);

  // Get equipment ready count menggunakan status persisten
  const [equipment] = await getReadyEquipmentCountByDate(date);

  // Get total tonnage from details
  const [tonnage] = await dbPool.execute(
    `SELECT COALESCE(SUM(tonnage), 0) as total FROM daily_report_details WHERE DATE(start_time) = ?`,
    [date]
  );

  // Get active period for the date
  const [periodRows] = await getPeriodByDate(date);
  const period = periodRows.length > 0 ? periodRows[0] : null;

  return {
    attendance_count: attendance[0].count,
    equipment_count: equipment[0].count,
    total_tonnage: tonnage[0].total,
    active_period: period,
  };
};

// Get statistics for dashboard
export const getDailyReportStats = async () => {
  // Total reports
  const [totalReports] = await dbPool.execute(
    `SELECT COUNT(*) as count FROM daily_reports`
  );

  // Today's report
  const today = new Date().toISOString().split("T")[0];
  const [todayReport] = await dbPool.execute(
    `SELECT dr.*, wp.period_code, wp.target_tonnage
     FROM daily_reports dr
     LEFT JOIN weekly_periods wp ON dr.period_id = wp.period_id
     WHERE dr.date = ?`,
    [today]
  );

  // Monthly total tonnage
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [monthlyTonnage] = await dbPool.execute(
    `SELECT COALESCE(SUM(daily_tonnage), 0) as total FROM daily_reports WHERE MONTH(date) = ? AND YEAR(date) = ?`,
    [currentMonth, currentYear]
  );

  // Weekly average
  const [weeklyAvg] = await dbPool.execute(
    `SELECT COALESCE(AVG(daily_tonnage), 0) as average FROM daily_reports WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
  );

  // Get today's active period
  const [periodRows] = await getPeriodByDate(today);
  const todayPeriod = periodRows.length > 0 ? periodRows[0] : null;

  return {
    total_reports: totalReports[0].count,
    today_report: todayReport[0] || null,
    monthly_tonnage: monthlyTonnage[0].total,
    weekly_average: weeklyAvg[0].average,
    today_period: todayPeriod,
  };
};

// Generate daily report automatically
export const generateAutoDailyReport = async (date) => {
  const summary = await getDailySummary(date);

  // Find current period
  const [periods] = await getPeriodByDate(date);

  if (periods.length === 0) {
    throw new Error("No active period found for the selected date");
  }

  const periodId = periods[0].period_id;

  // Check if report already exists
  const [existing] = await dbPool.execute(
    `SELECT report_id FROM daily_reports WHERE date = ?`,
    [date]
  );

  if (existing.length > 0) {
    throw new Error("Daily report already exists for this date");
  }

  // Create new report
  const SQLQuery = `
    INSERT INTO daily_reports 
      (period_id, date, daily_tonnage, total_employees_present, total_equipment_ready, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await dbPool.execute(SQLQuery, [
    periodId,
    date,
    summary.total_tonnage,
    summary.attendance_count,
    summary.equipment_count,
    `Auto-generated report for ${date}`,
  ]);

  return {
    report_id: result.insertId,
    ...summary,
    period_id: periodId,
  };
};

// Get available equipment for a specific date (equipment dengan status ready)
export const getAvailableEquipmentByDate = (date) => {
  const SQLQuery = `
    WITH LatestStatus AS (
      SELECT 
        equipment_id,
        MAX(date) as latest_date
      FROM daily_equipment_status
      WHERE date <= ?
      GROUP BY equipment_id
    )
    SELECT 
      he.equipment_id,
      he.unit_code,
      he.equipment_type,
      he.model,
      COALESCE(des.equipment_status, he.default_status) as current_status,
      l.location_name
    FROM heavy_equipment he
    LEFT JOIN LatestStatus ls ON he.equipment_id = ls.equipment_id
    LEFT JOIN daily_equipment_status des ON ls.equipment_id = des.equipment_id AND ls.latest_date = des.date
    LEFT JOIN locations l ON des.location_id = l.location_id
    WHERE COALESCE(des.equipment_status, he.default_status) = 'ready'
    ORDER BY he.unit_code
  `;
  return dbPool.execute(SQLQuery, [date]);
};

// Get current period info
export const getCurrentPeriodInfo = async () => {
  const today = new Date().toISOString().split("T")[0];
  const [periodRows] = await getPeriodByDate(today);

  if (periodRows.length === 0) {
    return null;
  }

  // Get daily report for today if exists
  const [reportRows] = await dbPool.execute(
    `SELECT * FROM daily_reports WHERE date = ?`,
    [today]
  );

  return {
    period: periodRows[0],
    today_report: reportRows[0] || null,
  };
};

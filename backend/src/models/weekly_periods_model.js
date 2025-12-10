import { pool } from "../config/database.js";

export const getAllWeeklyPeriods = async () => {
  const SQL = `
    SELECT period_id, period_code, start_date, end_date, 
           target_tonnage, stockpile_tons_target, created_at
    FROM weekly_periods 
    ORDER BY start_date DESC
  `;
  const [rows] = await pool.execute(SQL);
  return rows;
};

export const getWeeklyPeriodById = async (id) => {
  const SQL = `
    SELECT period_id, period_code, start_date, end_date, 
           target_tonnage, stockpile_tons_target, created_at
    FROM weekly_periods 
    WHERE period_id = ?
  `;
  const [rows] = await pool.execute(SQL, [id]);
  return rows[0] || null;
};

export const createWeeklyPeriod = async (data) => {
  const SQL = `
    INSERT INTO weekly_periods 
    (period_code, start_date, end_date, target_tonnage, stockpile_tons_target, created_at)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;
  const [result] = await pool.execute(SQL, [
    data.period_code,
    data.start_date,
    data.end_date,
    data.target_tonnage || 0,
    data.stockpile_tons_target || 0,
  ]);
  return result.insertId;
};

export const updateWeeklyPeriod = async (id, data) => {
  const SQL = `
    UPDATE weekly_periods 
    SET period_code = ?, start_date = ?, end_date = ?, 
        target_tonnage = ?, stockpile_tons_target = ?
    WHERE period_id = ?
  `;
  const [result] = await pool.execute(SQL, [
    data.period_code,
    data.start_date,
    data.end_date,
    data.target_tonnage || 0,
    data.stockpile_tons_target || 0,
    id,
  ]);
  return result.affectedRows;
};

export const deleteWeeklyPeriod = async (id) => {
  const SQL = `DELETE FROM weekly_periods WHERE period_id = ?`;
  const [result] = await pool.execute(SQL, [id]);
  return result.affectedRows;
};

// Generate next week automatically
export const generateNextWeeklyPeriod = async () => {
  // Get latest period
  const SQL = `SELECT end_date FROM weekly_periods ORDER BY end_date DESC LIMIT 1`;
  const [rows] = await pool.execute(SQL);

  let nextStartDate;
  if (rows.length === 0) {
    // Start from today
    nextStartDate = new Date();
  } else {
    // Start day after last period ends
    const lastEndDate = new Date(rows[0].end_date);
    nextStartDate = new Date(lastEndDate);
    nextStartDate.setDate(nextStartDate.getDate() + 1);
  }

  // Calculate end date (6 days after start)
  const nextEndDate = new Date(nextStartDate);
  nextEndDate.setDate(nextEndDate.getDate() + 6);

  // Format dates
  const formatDate = (date) => date.toISOString().split("T")[0];

  // Generate period code (e.g., WEEK-2024-W15)
  const year = nextStartDate.getFullYear();
  const weekNumber = Math.ceil(
    (nextStartDate - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000)
  );
  const periodCode = `WEEK-${year}-W${weekNumber}`;

  // Insert new period
  const insertSQL = `
    INSERT INTO weekly_periods 
    (period_code, start_date, end_date, target_tonnage, stockpile_tons_target, created_at)
    VALUES (?, ?, ?, 0, 0, NOW())
  `;

  const [result] = await pool.execute(insertSQL, [
    periodCode,
    formatDate(nextStartDate),
    formatDate(nextEndDate),
  ]);

  return {
    period_id: result.insertId,
    period_code: periodCode,
    start_date: formatDate(nextStartDate),
    end_date: formatDate(nextEndDate),
    target_tonnage: 0,
    stockpile_tons_target: 0,
  };
};

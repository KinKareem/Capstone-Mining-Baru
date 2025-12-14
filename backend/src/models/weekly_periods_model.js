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

const getISOWeek = (date) => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    week: weekNo,
  };
};

export const generateNextWeeklyPeriod = async () => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.execute(`
      SELECT end_date 
      FROM weekly_periods 
      ORDER BY end_date DESC 
      LIMIT 1
      FOR UPDATE
    `);

    let nextStartDate;
    if (rows.length === 0) {
      nextStartDate = new Date();
    } else {
      nextStartDate = new Date(rows[0].end_date);
      nextStartDate.setDate(nextStartDate.getDate() + 1);
    }

    const nextEndDate = new Date(nextStartDate);
    nextEndDate.setDate(nextEndDate.getDate() + 6);

    const formatDate = (d) => d.toISOString().split("T")[0];

    const year = nextStartDate.getFullYear();
    const week = String(
      Math.ceil(
        (nextStartDate - new Date(year, 0, 1)) / (7 * 24 * 60 * 60 * 1000)
      )
    ).padStart(2, "0");

    const periodCode = `WEEK-${year}-W${week}`;
    const [exist] = await conn.execute(
      `SELECT 1 FROM weekly_periods WHERE period_code = ? FOR UPDATE`,
      [periodCode]
    );

    if (exist.length > 0) {
      await conn.rollback();
      return null;
    }

    await conn.execute(
      `
      INSERT INTO weekly_periods
      (period_code, start_date, end_date, target_tonnage, stockpile_tons_target, created_at)
      VALUES (?, ?, ?, 0, 0, NOW())
    `,
      [periodCode, formatDate(nextStartDate), formatDate(nextEndDate)]
    );

    await conn.commit();
    return periodCode;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

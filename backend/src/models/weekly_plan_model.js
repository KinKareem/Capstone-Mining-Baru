import { pool as dbPool } from "../config/database.js";

export const getAllWeeklyPlans = () => {
  const SQL = `SELECT period_id, period_code, start_date, end_date, target_tonnage, created_at
               FROM weekly_periods
               ORDER BY start_date DESC`;
  return dbPool.execute(SQL);
};

export const getWeeklyPlanById = (id) => {
  const SQL = `SELECT period_id, period_code, start_date, end_date, target_tonnage, created_at
               FROM weekly_periods WHERE period_id = ?`;
  return dbPool.execute(SQL, [id]);
};

export const createWeeklyPlan = (body) => {
  const SQL = `INSERT INTO weekly_periods
    (period_code, start_date, end_date, target_tonnage, created_at)
    VALUES (?, ?, ?, ?, NOW())`;
  return dbPool.execute(SQL, [
    body.period_code,
    body.start_date,
    body.end_date,
    body.target_tonnage || 0,
  ]);
};

export const updateWeeklyPlan = (body, id) => {
  const SQL = `UPDATE weekly_periods
               SET period_code = ?, start_date = ?, end_date = ?, target_tonnage = ?
               WHERE period_id = ?`;
  return dbPool.execute(SQL, [
    body.period_code,
    body.start_date,
    body.end_date,
    body.target_tonnage || 0,
    id,
  ]);
};

export const deleteWeeklyPlan = (id) => {
  const SQL = `DELETE FROM weekly_periods WHERE period_id = ?`;
  return dbPool.execute(SQL, [id]);
};

/**
 * Generate next weekly period based on latest existing period.
 * Logic:
 *  - fetch MAX(end_date)
 *  - new start = max_end_date + 1
 *  - new end = new start + 6
 *  - generate code like WEEK-YYYY-Wxx or BR-001 style (we'll use WEEK-YYYY-<iso-week>)
 *
 * Returns inserted row info.
 */
export const generateNextWeeklyPlan = async () => {
  // get latest end_date
  const [rows] = await dbPool.execute(
    `SELECT period_id, period_code, start_date, end_date 
     FROM weekly_periods ORDER BY end_date DESC LIMIT 1`
  );

  // compute new dates
  const last = rows[0];
  let newStart, newEnd;
  if (!last) {
    // default: next Monday from today
    const [r] = await dbPool.execute(`SELECT CURDATE() AS today`);
    const today = r[0].today;
    newStart = new Date(today);
    // set newStart to next Monday
    const day = newStart.getDay(); // 0 sun..6 sat
    const daysToNextMonday = (8 - day) % 7 || 1;
    newStart.setDate(newStart.getDate() + daysToNextMonday);
  } else {
    newStart = new Date(last.end_date);
    newStart.setDate(newStart.getDate() + 1);
  }
  newEnd = new Date(newStart);
  newEnd.setDate(newStart.getDate() + 6);

  // format yyyy-mm-dd
  const fmt = (d) => d.toISOString().slice(0, 10);

  // generate period_code: WEEK-YYYY-<ISO_WEEK>
  const isoWeek = (d) => {
    // simple ISO week number
    const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const periodCode = `WEEK-${isoWeek(newStart)}`;

  // insert new week
  const [result] = await dbPool.execute(
    `INSERT INTO weekly_periods (period_code, start_date, end_date, target_tonnage, created_at)
     VALUES (?, ?, ?, 0, NOW())`,
    [periodCode, fmt(newStart), fmt(newEnd)]
  );

  // return inserted row
  const newId = result.insertId;
  const [newRow] = await dbPool.execute(
    `SELECT period_id, period_code, start_date, end_date, target_tonnage, created_at
     FROM weekly_periods WHERE period_id = ?`,
    [newId]
  );

  return newRow[0];
};

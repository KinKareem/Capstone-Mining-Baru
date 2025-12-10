import { pool as dbPool } from "../config/database.js";

// Get all weekly schedules
export const getAllWeeklySchedules = () => {
  const SQLQuery = `
    SELECT 
      ws.schedule_id,
      ws.date,
      ws.notes,
      ws.created_at,
      wp.period_code,
      e.name as employee_name,
      e.position,
      he.unit_code,
      he.equipment_type,
      s.shift_name,
      s.start_time as shift_start,
      s.end_time as shift_end,
      l.location_name,
      l.location_type
    FROM weekly_schedule ws
    LEFT JOIN weekly_periods wp ON ws.period_id = wp.period_id
    LEFT JOIN employees e ON ws.employee_id = e.employee_id
    LEFT JOIN heavy_equipment he ON ws.equipment_id = he.equipment_id
    LEFT JOIN shifts s ON ws.shift_id = s.shift_id
    LEFT JOIN locations l ON ws.location_id = l.location_id
    ORDER BY ws.date DESC, ws.schedule_id DESC
  `;
  return dbPool.execute(SQLQuery);
};

// Get schedule by ID
export const getWeeklyScheduleById = (id) => {
  const SQLQuery = `
    SELECT 
      ws.*,
      wp.period_code,
      e.name as employee_name,
      e.position,
      he.unit_code,
      he.equipment_type,
      s.shift_name,
      l.location_name
    FROM weekly_schedule ws
    LEFT JOIN weekly_periods wp ON ws.period_id = wp.period_id
    LEFT JOIN employees e ON ws.employee_id = e.employee_id
    LEFT JOIN heavy_equipment he ON ws.equipment_id = he.equipment_id
    LEFT JOIN shifts s ON ws.shift_id = s.shift_id
    LEFT JOIN locations l ON ws.location_id = l.location_id
    WHERE ws.schedule_id = ?
  `;
  return dbPool.execute(SQLQuery, [id]);
};

// Create new schedule
export const createNewWeeklySchedule = (body) => {
  const SQLQuery = `
    INSERT INTO weekly_schedule 
      (period_id, date, employee_id, equipment_id, shift_id, location_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  return dbPool.execute(SQLQuery, [
    body.period_id,
    body.date,
    body.employee_id,
    body.equipment_id,
    body.shift_id,
    body.location_id,
    body.notes || null,
  ]);
};

// Update schedule
export const updateWeeklySchedule = (body, id) => {
  const SQLQuery = `
    UPDATE weekly_schedule
    SET 
      period_id = ?,
      date = ?,
      employee_id = ?,
      equipment_id = ?,
      shift_id = ?,
      location_id = ?,
      notes = ?
    WHERE schedule_id = ?
  `;

  return dbPool.execute(SQLQuery, [
    body.period_id,
    body.date,
    body.employee_id,
    body.equipment_id,
    body.shift_id,
    body.location_id,
    body.notes || null,
    id,
  ]);
};

// Delete schedule
export const deleteWeeklySchedule = (id) => {
  const SQLQuery = `DELETE FROM weekly_schedule WHERE schedule_id = ?`;
  return dbPool.execute(SQLQuery, [id]);
};

// Get dropdown data for forms
export const getScheduleDropdowns = async () => {
  const [periods] = await dbPool.execute(
    "SELECT period_id, period_code FROM weekly_periods ORDER BY start_date DESC"
  );
  const [employees] = await dbPool.execute(
    "SELECT employee_id, name, position FROM employees WHERE status = 'active' ORDER BY name"
  );
  const [equipment] = await dbPool.execute(
    "SELECT equipment_id, unit_code, equipment_type FROM heavy_equipment ORDER BY unit_code"
  );
  const [shifts] = await dbPool.execute(
    "SELECT shift_id, shift_name, start_time, end_time FROM shifts ORDER BY start_time"
  );
  const [locations] = await dbPool.execute(
    "SELECT location_id, location_name, location_type FROM locations ORDER BY location_name"
  );

  return { periods, employees, equipment, shifts, locations };
};

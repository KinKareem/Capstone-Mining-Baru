import { pool as dbPool } from "../config/database.js";

// Get current status for all equipment (latest status for each)
export const getCurrentEquipmentStatus = () => {
  const SQLQuery = `
    SELECT 
      he.equipment_id,
      he.unit_code,
      he.equipment_type,
      he.model,
      COALESCE(
        (SELECT des.equipment_status 
         FROM daily_equipment_status des 
         WHERE des.equipment_id = he.equipment_id 
         ORDER BY des.date DESC, des.status_id DESC 
         LIMIT 1),
        'ready'
      ) as current_status,
      COALESCE(
        (SELECT des.remarks 
         FROM daily_equipment_status des 
         WHERE des.equipment_id = he.equipment_id 
         ORDER BY des.date DESC, des.status_id DESC 
         LIMIT 1),
        ''
      ) as last_remarks,
      COALESCE(
        (SELECT des.date 
         FROM daily_equipment_status des 
         WHERE des.equipment_id = he.equipment_id 
         ORDER BY des.date DESC, des.status_id DESC 
         LIMIT 1),
        CURDATE()
      ) as last_report_date,
      COALESCE(
        (SELECT l.location_name 
         FROM daily_equipment_status des 
         LEFT JOIN locations l ON des.location_id = l.location_id
         WHERE des.equipment_id = he.equipment_id 
         ORDER BY des.date DESC, des.status_id DESC 
         LIMIT 1),
        ''
      ) as last_location
    FROM heavy_equipment he
    ORDER BY he.unit_code
  `;

  return dbPool.execute(SQLQuery);
};

// Get all status history with details
export const getAllDailyEquipmentStatus = (filters = {}) => {
  let SQLQuery = `
    SELECT 
      des.status_id,
      des.date,
      des.equipment_id,
      he.unit_code,
      he.equipment_type,
      he.model,
      des.equipment_status,
      des.remarks,
      des.created_at,
      des.location_id,
      l.location_name,
      l.location_type
    FROM daily_equipment_status des
    LEFT JOIN heavy_equipment he ON des.equipment_id = he.equipment_id
    LEFT JOIN locations l ON des.location_id = l.location_id
    WHERE 1=1
  `;

  const params = [];

  if (filters.date) {
    SQLQuery += ` AND des.date = ?`;
    params.push(filters.date);
  }

  if (filters.equipment_status && filters.equipment_status !== "all") {
    SQLQuery += ` AND des.equipment_status = ?`;
    params.push(filters.equipment_status);
  }

  if (filters.equipment_type && filters.equipment_type !== "all") {
    SQLQuery += ` AND he.equipment_type = ?`;
    params.push(filters.equipment_type);
  }

  SQLQuery += ` ORDER BY des.date DESC, des.status_id DESC`;

  return dbPool.execute(SQLQuery, params);
};

// Get status history for specific equipment
export const getEquipmentStatusHistory = (equipmentId, limit = 30) => {
  const SQLQuery = `
    SELECT 
      des.status_id,
      des.date,
      des.equipment_status,
      des.remarks,
      des.created_at,
      l.location_name
    FROM daily_equipment_status des
    LEFT JOIN locations l ON des.location_id = l.location_id
    WHERE des.equipment_id = ?
    ORDER BY des.date DESC, des.status_id DESC
    LIMIT ?
  `;

  return dbPool.execute(SQLQuery, [equipmentId, limit]);
};

// Create or update daily equipment status
export const upsertDailyEquipmentStatus = (body) => {
  // Check if status already exists for today
  const checkQuery = `
    SELECT status_id FROM daily_equipment_status 
    WHERE equipment_id = ? AND date = ?
  `;

  return dbPool
    .execute(checkQuery, [body.equipment_id, body.date])
    .then(([rows]) => {
      if (rows.length > 0) {
        // Update existing
        const updateQuery = `
          UPDATE daily_equipment_status
          SET equipment_status = ?, remarks = ?, location_id = ?
          WHERE equipment_id = ? AND date = ?
        `;
        return dbPool.execute(updateQuery, [
          body.equipment_status,
          body.remarks || null,
          body.location_id || null,
          body.equipment_id,
          body.date,
        ]);
      } else {
        // Insert new
        const insertQuery = `
          INSERT INTO daily_equipment_status
            (date, equipment_id, equipment_status, remarks, location_id)
          VALUES (?, ?, ?, ?, ?)
        `;
        return dbPool.execute(insertQuery, [
          body.date,
          body.equipment_id,
          body.equipment_status,
          body.remarks || null,
          body.location_id || null,
        ]);
      }
    });
};

// Get today's status for all equipment (show current status)
export const getTodayEquipmentStatus = () => {
  const today = new Date().toISOString().split("T")[0];

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
      he.default_status,
      COALESCE(des.equipment_status, he.default_status) as current_status,
      COALESCE(des.remarks, '') as remarks,
      COALESCE(des.date, ?) as last_updated,
      l.location_name,
      CASE 
        WHEN des.date = ? THEN 'today'
        ELSE CONCAT('since ', DATE_FORMAT(des.date, '%d %b'))
      END as status_duration
    FROM heavy_equipment he
    LEFT JOIN LatestStatus ls ON he.equipment_id = ls.equipment_id
    LEFT JOIN daily_equipment_status des ON ls.equipment_id = des.equipment_id AND ls.latest_date = des.date
    LEFT JOIN locations l ON des.location_id = l.location_id
    ORDER BY 
      CASE des.equipment_status
        WHEN 'breakdown' THEN 1
        WHEN 'maintenance' THEN 2
        WHEN 'standby' THEN 3
        WHEN 'ready' THEN 4
        ELSE 5
      END,
      he.unit_code
  `;

  return dbPool.execute(SQLQuery, [today, today, today]);
};

// Get status for specific date
export const getStatusByDate = (date) => {
  const SQLQuery = `
    WITH StatusOnDate AS (
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
      COALESCE(des.equipment_status, he.default_status) as status_on_date,
      COALESCE(des.remarks, '') as remarks,
      COALESCE(des.date, '1900-01-01') as reported_date,
      l.location_name,
      CASE 
        WHEN des.date IS NULL THEN 'No report'
        WHEN des.date = ? THEN 'Reported on this day'
        ELSE CONCAT('From ', DATE_FORMAT(des.date, '%d %b'))
      END as status_info
    FROM heavy_equipment he
    LEFT JOIN StatusOnDate sod ON he.equipment_id = sod.equipment_id
    LEFT JOIN daily_equipment_status des ON sod.equipment_id = des.equipment_id AND sod.latest_date = des.date
    LEFT JOIN locations l ON des.location_id = l.location_id
    ORDER BY he.unit_code
  `;

  return dbPool.execute(SQLQuery, [date, date]);
};

// Delete specific status record
export const deleteDailyEquipmentStatus = (id) => {
  const SQLQuery = `DELETE FROM daily_equipment_status WHERE status_id = ?`;
  return dbPool.execute(SQLQuery, [id]);
};

// Get statistics
export const getDailyEquipmentStatusStats = () => {
  const today = new Date().toISOString().split("T")[0];

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
      COALESCE(des.equipment_status, he.default_status) as status,
      COUNT(*) as count
    FROM heavy_equipment he
    LEFT JOIN LatestStatus ls ON he.equipment_id = ls.equipment_id
    LEFT JOIN daily_equipment_status des ON ls.equipment_id = des.equipment_id AND ls.latest_date = des.date
    GROUP BY COALESCE(des.equipment_status, he.default_status)
  `;

  return dbPool.execute(SQLQuery, [today]);
};

// Get available equipment for dropdown
export const getAvailableEquipment = () => {
  const SQLQuery = `
    SELECT 
      equipment_id,
      unit_code,
      equipment_type,
      model,
      default_status
    FROM heavy_equipment
    ORDER BY unit_code
  `;

  return dbPool.execute(SQLQuery);
};

// Get all locations
export const getAllLocations = () => {
  const SQLQuery = `
    SELECT 
      location_id,
      location_name,
      location_type
    FROM locations
    ORDER BY location_name
  `;

  return dbPool.execute(SQLQuery);
};

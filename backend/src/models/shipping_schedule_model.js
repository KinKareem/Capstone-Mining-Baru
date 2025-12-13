import { pool as dbPool } from "../config/database.js";

export const getAllShippingSchedules = async () => {
  try {
    const [rows] = await dbPool.query(`
            SELECT 
                vessel_code,
                vessel_name,
                DATE_FORMAT(eta_date, '%Y-%m-%d') as eta_date,
                DATE_FORMAT(latest_berthing, '%Y-%m-%d') as latest_berthing,
                target_load_tons,
                shipping_notes,
                DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
            FROM shipping_schedule 
            ORDER BY eta_date DESC, updated_at DESC
        `);
    return rows;
  } catch (error) {
    throw new Error("Failed to fetch shipping schedules: " + error.message);
  }
};

export const getShippingScheduleById = async (vessel_id) => {
  try {
    const [rows] = await dbPool.query(
      `
            SELECT 
                vessel_id,
                vessel_name,
                DATE_FORMAT(eta_date, '%Y-%m-%d') as eta_date,
                DATE_FORMAT(latest_berthing, '%Y-%m-%d') as latest_berthing,
                target_load_tons,
                shipping_notes,
                DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
            FROM shipping_schedule 
            WHERE vessel_id = ?
        `,
      [vessel_id]
    );

    if (rows.length === 0) {
      throw new Error("Shipping schedule not found");
    }

    return rows[0];
  } catch (error) {
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error("Failed to fetch shipping schedule: " + error.message);
  }
};

export const createShippingSchedule = async (scheduleData) => {
  try {
    const {
      vessel_id,
      vessel_name,
      eta_date,
      latest_berthing,
      target_load_tons,
      shipping_notes,
    } = scheduleData;

    const [result] = await dbPool.query(
      `
            INSERT INTO shipping_schedule 
            (vessel_id, vessel_name, eta_date, latest_berthing, target_load_tons, shipping_notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `,
      [
        vessel_id,
        vessel_name,
        eta_date,
        latest_berthing,
        target_load_tons,
        shipping_notes,
      ]
    );

    return getShippingScheduleById(vessel_id);
  } catch (error) {
    throw new Error("Failed to create shipping schedule: " + error.message);
  }
};

export const updateShippingSchedule = async (vessel_id, scheduleData) => {
  try {
    const {
      vessel_name,
      eta_date,
      latest_berthing,
      target_load_tons,
      shipping_notes,
    } = scheduleData;

    const [result] = await dbPool.query(
      `
            UPDATE shipping_schedule
            SET 
                vessel_name = ?, 
                eta_date = ?, 
                latest_berthing = ?, 
                target_load_tons = ?, 
                shipping_notes = ?, 
                updated_at = CURRENT_TIMESTAMP
            WHERE vessel_id = ?
        `,
      [
        vessel_name,
        eta_date,
        latest_berthing,
        target_load_tons,
        shipping_notes,
        vessel_id,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Shipping schedule not found");
    }

    return getShippingScheduleById(vessel_id);
  } catch (error) {
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error("Failed to update shipping schedule: " + error.message);
  }
};

export const deleteShippingSchedule = async (vessel_id) => {
  try {
    const [result] = await dbPool.query(
      `
            DELETE FROM shipping_schedule 
            WHERE vessel_id = ?
        `,
      [vessel_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Shipping schedule not found");
    }

    return true;
  } catch (error) {
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error("Failed to delete shipping schedule: " + error.message);
  }
};

export const getShippingStats = async () => {
  try {
    const [rows] = await dbPool.query(`
            SELECT 
                COUNT(*) as total_vessels,
                COALESCE(SUM(target_load_tons), 0) as total_load,
                COUNT(CASE WHEN eta_date >= CURDATE() AND eta_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as upcoming_vessels,
                COUNT(CASE WHEN MONTH(eta_date) = MONTH(CURDATE()) AND YEAR(eta_date) = YEAR(CURDATE()) THEN 1 END) as monthly_vessels
            FROM shipping_schedule
        `);
    return rows[0];
  } catch (error) {
    throw new Error("Failed to fetch shipping stats: " + error.message);
  }
};

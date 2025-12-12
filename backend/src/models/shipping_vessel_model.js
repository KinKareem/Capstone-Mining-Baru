import { pool as dbPool } from "../config/database.js";

export const getAllShippingVessels = async () => {
  try {
    const [rows] = await dbPool.query(`
            SELECT 
                s.schedule_id,
                s.vessel_code,
                s.vessel_name,
                DATE_FORMAT(s.eta_date, '%Y-%m-%d') as eta_date,
                DATE_FORMAT(s.latest_berthing, '%Y-%m-%d') as latest_berthing,
                s.target_load_tons,
                s.loading_status,
                s.shipping_notes,
                s.updated_at,
                
                -- Calculate loaded tons and progress
                COALESCE(SUM(sld.loaded_tons), 0) as loaded_tons,
                ROUND((COALESCE(SUM(sld.loaded_tons), 0) / s.target_load_tons) * 100, 2) as progress_percentage,
                
                -- Get stockpile information
                GROUP_CONCAT(DISTINCT ssa.stockpile_id) as stockpile_ids,
                COALESCE(SUM(ssa.allocated_tons), 0) as allocated_tons,
                
                -- Get loading details count
                COUNT(DISTINCT sld.loading_id) as loading_sessions,
                
                -- Calculate ETD (Estimated Departure Date) - add 2 days after last loading
                DATE_FORMAT(
                    DATE_ADD(
                        COALESCE(MAX(sld.date), s.latest_berthing), 
                        INTERVAL 2 DAY
                    ), 
                    '%Y-%m-%d'
                ) as estimated_departure_date
                
            FROM shipping_schedule s
            
            -- Join with loading details
            LEFT JOIN shipping_loading_details sld 
                ON s.schedule_id = sld.schedule_id
            
            -- Join with stockpile allocation
            LEFT JOIN shipping_stockpile_allocation ssa 
                ON s.schedule_id = ssa.schedule_id
            
            GROUP BY s.schedule_id
            ORDER BY s.eta_date DESC, s.updated_at DESC
        `);
    return rows;
  } catch (error) {
    throw new Error("Failed to fetch shipping vessels: " + error.message);
  }
};

export const getShippingVesselStats = async () => {
  try {
    const [rows] = await dbPool.query(`
            SELECT 
                -- Basic counts
                COUNT(*) as total_vessels,
                COALESCE(SUM(target_load_tons), 0) as total_capacity,
                
                -- Status breakdown
                COUNT(CASE WHEN loading_status = 'waiting' THEN 1 END) as waiting_vessels,
                COUNT(CASE WHEN loading_status = 'loading' THEN 1 END) as loading_vessels,
                COUNT(CASE WHEN loading_status = 'completed' THEN 1 END) as completed_vessels,
                COUNT(CASE WHEN loading_status = 'delayed' THEN 1 END) as delayed_vessels,
                
                -- Stockpile stats
                COUNT(DISTINCT ssa.stockpile_id) as active_stockpiles,
                
                -- Loading efficiency
                ROUND(
                    COALESCE(
                        SUM(sld.loaded_tons) / NULLIF(SUM(s.target_load_tons), 0) * 100, 
                        0
                    ), 2
                ) as overall_progress_percentage,
                
                -- Average loading time (in hours)
                ROUND(
                    COALESCE(
                        AVG(TIMESTAMPDIFF(HOUR, sld.start_time, sld.end_time)), 
                        0
                    ), 1
                ) as avg_loading_hours,
                
                -- Monthly stats
                COUNT(CASE WHEN MONTH(s.eta_date) = MONTH(CURDATE()) THEN 1 END) as monthly_vessels,
                COALESCE(SUM(CASE WHEN MONTH(s.eta_date) = MONTH(CURDATE()) THEN s.target_load_tons END), 0) as monthly_capacity
                
            FROM shipping_schedule s
            
            LEFT JOIN shipping_loading_details sld 
                ON s.schedule_id = sld.schedule_id
            
            LEFT JOIN shipping_stockpile_allocation ssa 
                ON s.schedule_id = ssa.schedule_id
        `);
    return rows[0];
  } catch (error) {
    throw new Error("Failed to fetch shipping vessel stats: " + error.message);
  }
};

export const getShippingVesselById = async (schedule_id) => {
  try {
    const [rows] = await dbPool.query(
      `
            SELECT 
                s.*,
                DATE_FORMAT(s.eta_date, '%Y-%m-%d') as eta_date,
                DATE_FORMAT(s.latest_berthing, '%Y-%m-%d') as latest_berthing,
                COALESCE(SUM(sld.loaded_tons), 0) as loaded_tons,
                ROUND((COALESCE(SUM(sld.loaded_tons), 0) / s.target_load_tons) * 100, 2) as progress_percentage
            FROM shipping_schedule s
            LEFT JOIN shipping_loading_details sld 
                ON s.schedule_id = sld.schedule_id
            WHERE s.schedule_id = ?
            GROUP BY s.schedule_id
        `,
      [schedule_id]
    );

    if (rows.length === 0) {
      throw new Error("Shipping vessel not found");
    }

    return rows[0];
  } catch (error) {
    throw new Error("Failed to fetch shipping vessel: " + error.message);
  }
};

export const createShippingVessel = async (vesselData) => {
  try {
    const {
      vessel_code,
      vessel_name,
      eta_date,
      latest_berthing,
      target_load_tons,
      loading_status = "waiting",
      shipping_notes,
    } = vesselData;

    const [result] = await dbPool.query(
      `
            INSERT INTO shipping_schedule 
            (vessel_code, vessel_name, eta_date, latest_berthing, target_load_tons, loading_status, shipping_notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
      [
        vessel_code,
        vessel_name,
        eta_date,
        latest_berthing,
        target_load_tons,
        loading_status,
        shipping_notes || null,
      ]
    );

    const newVessel = await getShippingVesselById(result.insertId);
    return newVessel;
  } catch (error) {
    throw new Error("Failed to create shipping vessel: " + error.message);
  }
};

export const updateShippingVessel = async (schedule_id, vesselData) => {
  try {
    const {
      vessel_code,
      vessel_name,
      eta_date,
      latest_berthing,
      target_load_tons,
      loading_status,
      shipping_notes,
    } = vesselData;

    const [result] = await dbPool.query(
      `
            UPDATE shipping_schedule 
            SET 
                vessel_code = ?,
                vessel_name = ?,
                eta_date = ?,
                latest_berthing = ?,
                target_load_tons = ?,
                loading_status = ?,
                shipping_notes = ?,
                updated_at = NOW()
            WHERE schedule_id = ?
        `,
      [
        vessel_code,
        vessel_name,
        eta_date,
        latest_berthing,
        target_load_tons,
        loading_status,
        shipping_notes || null,
        schedule_id,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Shipping vessel not found");
    }

    const updatedVessel = await getShippingVesselById(schedule_id);
    return updatedVessel;
  } catch (error) {
    throw new Error("Failed to update shipping vessel: " + error.message);
  }
};

export const deleteShippingVessel = async (schedule_id) => {
  try {
    await dbPool.query(
      "DELETE FROM shipping_loading_details WHERE schedule_id = ?",
      [schedule_id]
    );

    await dbPool.query(
      "DELETE FROM shipping_stockpile_allocation WHERE schedule_id = ?",
      [schedule_id]
    );

    const [result] = await dbPool.query(
      "DELETE FROM shipping_schedule WHERE schedule_id = ?",
      [schedule_id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Shipping vessel not found");
    }

    return { success: true };
  } catch (error) {
    throw new Error("Failed to delete shipping vessel: " + error.message);
  }
};

export const getVesselLoadingDetails = async (schedule_id) => {
  try {
    const [rows] = await dbPool.query(
      `
            SELECT 
                loading_id,
                DATE_FORMAT(date, '%Y-%m-%d') as date,
                shift_id,
                TIME_FORMAT(start_time, '%H:%i') as start_time,
                TIME_FORMAT(end_time, '%H:%i') as end_time,
                loaded_tons,
                equipment_id,
                remarks,
                DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as created_at
            FROM shipping_loading_details
            WHERE schedule_id = ?
            ORDER BY date DESC, start_time DESC
        `,
      [schedule_id]
    );

    return rows;
  } catch (error) {
    throw new Error("Failed to fetch vessel loading details: " + error.message);
  }
};

export const getVesselStockpileAllocation = async (schedule_id) => {
  try {
    const [rows] = await dbPool.query(
      `
            SELECT 
                allocation_id,
                stockpile_id,
                allocated_tons,
                quality_cv,
                quality_tm,
                quality_ash,
                quality_ts,
                DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i') as updated_at
            FROM shipping_stockpile_allocation
            WHERE schedule_id = ?
            ORDER BY allocated_tons DESC
        `,
      [schedule_id]
    );

    return rows;
  } catch (error) {
    throw new Error(
      "Failed to fetch vessel stockpile allocation: " + error.message
    );
  }
};

export const getVesselPortsAndProgress = async (schedule_id) => {
  try {
    const [rows] = await dbPool.query(
      `
            SELECT 
                ssa.stockpile_id,
                ssa.allocated_tons,
                ssa.quality_cv,
                ssa.quality_tm,
                ssa.quality_ash,
                ssa.quality_ts,
                ssa.updated_at as last_allocation,
                
                -- Calculate loading progress for this stockpile
                COALESCE(
                    (SELECT SUM(loaded_tons) 
                     FROM shipping_loading_details 
                     WHERE schedule_id = ?
                     AND remarks LIKE CONCAT('%stockpile:', ssa.stockpile_id, '%')
                    ), 0
                ) as loaded_from_stockpile
                
            FROM shipping_stockpile_allocation ssa
            WHERE ssa.schedule_id = ?
            ORDER BY ssa.allocated_tons DESC
        `,
      [schedule_id, schedule_id]
    );

    return rows;
  } catch (error) {
    throw new Error(
      "Failed to fetch vessel ports and progress: " + error.message
    );
  }
};

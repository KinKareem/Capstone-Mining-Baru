import db from "../services/database.js";

export const getAllShippingSchedules = async () => {
    try {
        const [rows] = await db.query(`
      SELECT ss.*, u.username as created_by_username
      FROM tb_shipping_schedule ss
      LEFT JOIN tb_users u ON ss.created_by = u.id
      ORDER BY ss.departure_date DESC, ss.departure_time DESC
    `);
        return rows;
    } catch (error) {
        throw new Error('Failed to fetch shipping schedules: ' + error.message);
    }
};

export const getShippingScheduleById = async (id) => {
    try {
        const [rows] = await db.query(`
      SELECT ss.*, u.username as created_by_username
      FROM tb_shipping_schedule ss
      LEFT JOIN tb_users u ON ss.created_by = u.id
      WHERE ss.id = ?
    `, [id]);

        if (rows.length === 0) {
            throw new Error('Shipping schedule not found');
        }

        return rows[0];
    } catch (error) {
        if (error.message.includes('not found')) {
            throw error;
        }
        throw new Error('Failed to fetch shipping schedule: ' + error.message);
    }
};

export const createShippingSchedule = async (scheduleData) => {
    try {
        const {
            vessel_name,
            departure_date,
            departure_time,
            destination_port,
            cargo_type,
            tonnage,
            status = 'Scheduled',
            notes,
            created_by
        } = scheduleData;

        const [result] = await db.query(`
      INSERT INTO tb_shipping_schedule
      (vessel_name, departure_date, departure_time, destination_port, cargo_type, tonnage, status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [vessel_name, departure_date, departure_time, destination_port, cargo_type, tonnage, status, notes, created_by]);

        // Fetch the created schedule
        const [rows] = await db.query(`
      SELECT ss.*, u.username as created_by_username
      FROM tb_shipping_schedule ss
      LEFT JOIN tb_users u ON ss.created_by = u.id
      WHERE ss.id = ?
    `, [result.insertId]);

        return rows[0];
    } catch (error) {
        throw new Error('Failed to create shipping schedule: ' + error.message);
    }
};

export const updateShippingSchedule = async (id, scheduleData) => {
    try {
        const {
            vessel_name,
            departure_date,
            departure_time,
            destination_port,
            cargo_type,
            tonnage,
            status,
            notes
        } = scheduleData;

        const [result] = await db.query(`
      UPDATE tb_shipping_schedule
      SET vessel_name = ?, departure_date = ?, departure_time = ?, destination_port = ?,
          cargo_type = ?, tonnage = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [vessel_name, departure_date, departure_time, destination_port, cargo_type, tonnage, status, notes, id]);

        if (result.affectedRows === 0) {
            throw new Error('Shipping schedule not found');
        }

        // Fetch the updated schedule
        const [rows] = await db.query(`
      SELECT ss.*, u.username as created_by_username
      FROM tb_shipping_schedule ss
      LEFT JOIN tb_users u ON ss.created_by = u.id
      WHERE ss.id = ?
    `, [id]);

        return rows[0];
    } catch (error) {
        if (error.message.includes('not found')) {
            throw error;
        }
        throw new Error('Failed to update shipping schedule: ' + error.message);
    }
};

export const deleteShippingSchedule = async (id) => {
    try {
        const [result] = await db.query('DELETE FROM tb_shipping_schedule WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            throw new Error('Shipping schedule not found');
        }

        return true;
    } catch (error) {
        if (error.message.includes('not found')) {
            throw error;
        }
        throw new Error('Failed to delete shipping schedule: ' + error.message);
    }
};

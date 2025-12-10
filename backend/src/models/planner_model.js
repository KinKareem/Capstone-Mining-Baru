import { pool as dbPool } from "../config/database.js";

export const getAllWeather = () => {
    const SQLQuery = `SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') AS date,
    rainfall_mm, road_condition, max_wave_m, port_status, 
    effective_working_hours, updated_at
    FROM weather
    ORDER BY date DESC
    LIMIT 1;`;

    return dbPool.execute(SQLQuery);
};

export const getWeatherByDate = (date) => {
    const SQLQuery = `SELECT * FROM weather WHERE date = ?`;
    return dbPool.execute(SQLQuery, [date]);
};

export const updateWeather = (body, date) => {
    const SQLQuery = `
        UPDATE weather
        SET rainfall_mm = ?, road_condition = ?, max_wave_m = ?, port_status = ?, effective_working_hours = ?
        WHERE date = ?
    `;

    return dbPool.execute(SQLQuery, [
        body.rainfall_mm,
        body.road_condition,
        body.max_wave_m,
        body.port_status,
        body.effective_working_hours,
        date
    ]);
};

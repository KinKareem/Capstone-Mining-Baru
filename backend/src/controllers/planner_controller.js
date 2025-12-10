import {
    getAllWeather,
    getWeatherByDate,
    updateWeather,
} from "../models/planner_model.js";

// GET all
export const getAllWeatherData = async (req, res) => {
    try {
        const [rows] = await getAllWeather();
        res.json({
            message: "Weather data retrieved successfully",
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving weather data",
            error: error.message
        });
    }
};

// GET by date
export const getWeatherDataByDate = async (req, res) => {
    try {
        const { date } = req.params;
        if (rows.length === 0) {
            return res.status(404).json({
                message: "Weather data not found for the specified date"
            });
        }

        res.json({
            message: "Weather data retrieved successfully",
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving weather data",
            error: error.message
        });
    }
};

export const updateWeatherData = async (req, res) => {
    try {
        const date = req.params.date;
        const body = req.body;

        // 1. Ambil data lama
        const [[oldData]] = await getWeatherByDate(date);

        if (!oldData) {
            return res.status(404).json({ message: "Weather data not found" });
        }

        // 2. Gabungkan body yg dikirim dengan data lama
        const finalData = {
            rainfall_mm: body.rainfall_mm ?? oldData.rainfall_mm,
            road_condition: body.road_condition ?? oldData.road_condition,
            max_wave_m: body.max_wave_m ?? oldData.max_wave_m,
            port_status: body.port_status ?? oldData.port_status,
            effective_working_hours: body.effective_working_hours ?? oldData.effective_working_hours
        };

        // 3. Update pakai data final (no more undefined)
        await updateWeather(finalData, date);

        res.json({
            message: "Weather updated successfully",
            updated: finalData
        });

    } catch (error) {
        console.log("UPDATE WEATHER ERROR:", error);
        res.status(500).json({ message: "Update failed", error });
    }
};


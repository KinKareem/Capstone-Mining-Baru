import { getAllSumarry } from "../models/ai_summary_model.js";

export const getSummary = async (req, res) => {
    try {
        const [rows] = await getAllSumarry();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No summary data found",
                data: null,
            });
        }

        // Ambil hanya summary_json
        const summaryJson = rows[0].summary_json;

        return res.status(200).json({
            message: "Summary retrieved successfully",
            data: summaryJson,
        });

    } catch (error) {
        console.error("Error fetching summary:", error);

        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

import { getAllRecommendation } from "../models/ai_recommendation_model.js";

export const getRecommendation = async (req, res) => {
    try {
        const [rows] = await getAllRecommendation();

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No recommendation found",
                data: null
            });
        }

        const raw = rows[0].scenarios_json;

        // FIX: aman terhadap null atau string kosong
        let parsed = {};

        if (typeof raw === "string" && raw.trim() !== "") {
            try {
                parsed = JSON.parse(raw);
            } catch (err) {
                console.error("JSON parse error:", err);
                parsed = {};
            }
        } else if (typeof raw === "object" && raw !== null) {
            parsed = raw;
        }

        return res.json({
            message: "Recommendation retrieved successfully",
            scenarios: parsed.scenarios || [],
            context_check: parsed.context_check || {},
            final_reasoning: parsed.final_reasoning || {}
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

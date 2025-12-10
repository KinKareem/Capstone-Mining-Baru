import { pool as dbPool } from "../config/database.js";

export const getAllRecommendation = () => {
  const SQLQuery = `SELECT plan_id, scenarios_json
        FROM plan_optimization_log
        ORDER BY log_id DESC
        LIMIT 1;
    `;

  return dbPool.execute(SQLQuery);
};

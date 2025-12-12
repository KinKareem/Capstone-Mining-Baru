import { pool as dbPool } from "../config/database.js";

export const getDailyTonnageToday = async () => {
  // Use the latest available date if no data for today
  const [rows] = await dbPool.query(
    "SELECT COALESCE(SUM(daily_tonnage),0) AS value FROM daily_reports WHERE date = (SELECT MAX(date) FROM daily_reports)"
  );
  return rows?.[0]?.value ?? 0;
};

export const getEquipmentReadyPercentToday = async () => {
  const [[{ total }]] = await dbPool.query(
    "SELECT COUNT(*) AS total FROM heavy_equipment"
  );
  // Use latest available date for equipment status
  const [[{ latestDate }]] = await dbPool.query(
    "SELECT COALESCE(MAX(date), CURDATE()) AS latestDate FROM daily_equipment_status"
  );
  const [[{ rowsToday }]] = await dbPool.query(
    "SELECT COUNT(*) AS rowsToday FROM daily_equipment_status WHERE date = ?",
    [latestDate]
  );
  let ready = 0;
  if (rowsToday) {
    const [[r]] = await dbPool.query(
      "SELECT COUNT(*) AS ready FROM daily_equipment_status WHERE date = ? AND equipment_status = 'ready'",
      [latestDate]
    );
    ready = r.ready || 0;
  } else {
    const [[r]] = await dbPool.query(
      "SELECT COUNT(*) AS ready FROM heavy_equipment WHERE default_status = 'ready'"
    );
    ready = r.ready || 0;
  }
  const percent = total ? Math.round((ready / total) * 100) : 0;
  return { ready, total, percent };
};

export const getEmployeeAttendancePercentToday = async () => {
  const [[{ total }]] = await dbPool.query(
    "SELECT COUNT(*) AS total FROM employees"
  );
  // Use latest available date for attendance
  const [[{ latestDate }]] = await dbPool.query(
    "SELECT COALESCE(MAX(date), CURDATE()) AS latestDate FROM daily_attendance"
  );
  const [[{ present }]] = await dbPool.query(
    "SELECT COUNT(*) AS present FROM daily_attendance WHERE date = ? AND attendance_status = 'present'",
    [latestDate]
  );
  let effectivePresent = present;
  if (!present) {
    const [[{ scheduled }]] = await dbPool.query(
      "SELECT COUNT(*) AS scheduled FROM weekly_schedule WHERE date = ? AND employee_id IS NOT NULL",
      [latestDate]
    );
    effectivePresent = scheduled || 0;
  }
  const percent = total ? Math.round((effectivePresent / total) * 100) : 0;
  return { present: effectivePresent, total, percent };
};

export const getProductionVsWeeklyTarget = async () => {
  const [periodRows] = await dbPool.query(
    "SELECT period_id, target_tonnage, start_date, end_date FROM weekly_periods WHERE start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY start_date DESC LIMIT 1"
  );
  let period = periodRows?.[0];
  if (!period) {
    const [fallback] = await dbPool.query(
      "SELECT period_id, target_tonnage, start_date, end_date FROM weekly_periods ORDER BY end_date DESC LIMIT 1"
    );
    period = fallback?.[0] ?? null;
  }
  if (!period) {
    return { period: null, target: 0, actual: 0, percent: 0 };
  }
  const [[{ actual }]] = await dbPool.query(
    "SELECT COALESCE(SUM(daily_tonnage),0) AS actual FROM daily_reports WHERE period_id = ?",
    [period.period_id]
  );
  const target = Number(period.target_tonnage || 0);
  const percent = target
    ? Math.min(100, Math.round((actual / target) * 100))
    : 0;
  return { period, target, actual, percent };
};

export const getDailyProductionTrend = async (days = 30) => {
  const [rows] = await dbPool.query(
    "SELECT date, COALESCE(SUM(daily_tonnage),0) AS tonnage FROM daily_reports WHERE date >= (CURDATE() - INTERVAL ? DAY) GROUP BY date ORDER BY date",
    [Number(days)]
  );
  return rows;
};

export const getProductionByEquipment = async (days = 7) => {
  const [rows] = await dbPool.query(
    `SELECT he.unit_code, COALESCE(SUM(drd.tonnage),0) AS total_tonnage
     FROM daily_report_details drd
     JOIN heavy_equipment he ON drd.equipment_id = he.equipment_id
     JOIN daily_reports dr ON drd.report_id = dr.report_id
     WHERE dr.date >= (CURDATE() - INTERVAL ? DAY)
     GROUP BY he.unit_code
     ORDER BY total_tonnage DESC`,
    [Number(days)]
  );
  return rows;
};

export const getEquipmentStatusToday = async () => {
  const [[{ any }]] = await dbPool.query(
    "SELECT COUNT(*) AS any FROM daily_equipment_status"
  );
  if (!any) {
    const [fallback] = await dbPool.query(
      "SELECT default_status AS equipment_status, COUNT(*) AS count FROM heavy_equipment GROUP BY default_status"
    );
    const mapped = ["ready", "breakdown", "maintenance", "standby"].map(
      (k) => ({
        equipment_status: k,
        count: Number(
          (fallback.find((r) => r.equipment_status === k) || {}).count || 0
        ),
      })
    );
    return { date: null, rows: mapped };
  }
  // Use latest available date for equipment status
  const [[{ latest }]] = await dbPool.query(
    "SELECT MAX(date) AS latest FROM daily_equipment_status"
  );
  const [rows] = await dbPool.query(
    "SELECT equipment_status, COUNT(*) AS count FROM daily_equipment_status WHERE date = ? GROUP BY equipment_status",
    [latest]
  );
  return { date: latest, rows };
};

export const getAttendanceTrend = async (days = 14) => {
  const [rows] = await dbPool.query(
    `SELECT date, attendance_status, COUNT(*) AS count
     FROM daily_attendance
     WHERE date >= (CURDATE() - INTERVAL ? DAY)
     GROUP BY date, attendance_status
     ORDER BY date`,
    [Number(days)]
  );
  return rows;
};

export const getAttendanceTable = async (days = 14) => {
  const [rows] = await dbPool.query(
    `SELECT e.name, da.date, da.attendance_status, da.remarks
     FROM daily_attendance da
     JOIN employees e ON da.employee_id = e.employee_id
     WHERE da.date >= (CURDATE() - INTERVAL ? DAY)
     ORDER BY da.date DESC, e.name ASC`,
    [Number(days)]
  );
  return rows;
};

export const getWeeklySchedule = async (page = 1, pageSize = 20) => {
  const [[active]] = await dbPool.query(
    "SELECT period_id FROM weekly_periods WHERE start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY start_date DESC LIMIT 1"
  );
  const periodId = active?.period_id ?? null;
  if (!periodId) {
    return { total: 0, rows: [], periodId: null };
  }
  const [[{ total }]] = await dbPool.query(
    "SELECT COUNT(*) AS total FROM weekly_schedule WHERE period_id = ?",
    [periodId]
  );
  const offset =
    (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
  const [rows] = await dbPool.query(
    `SELECT ws.date, e.name, he.unit_code, s.shift_name, l.location_name, ws.notes
     FROM weekly_schedule ws
     LEFT JOIN employees e ON ws.employee_id = e.employee_id
     LEFT JOIN heavy_equipment he ON ws.equipment_id = he.equipment_id
     LEFT JOIN shifts s ON ws.shift_id = s.shift_id
     LEFT JOIN locations l ON ws.location_id = l.location_id
     WHERE ws.period_id = ?
     ORDER BY ws.date ASC
     LIMIT ? OFFSET ?`,
    [periodId, Math.max(1, Number(pageSize)), offset]
  );
  return { total, rows, periodId };
};

export const getWeatherToday = async () => {
  // Use latest available weather data
  const [[latest]] = await dbPool.query(
    "SELECT * FROM weather ORDER BY date DESC LIMIT 1"
  );
  return latest ?? null;
};

export const getUpcomingVesselCount = async () => {
  const [[{ cnt }]] = await dbPool.query(
    "SELECT COUNT(*) AS cnt FROM tb_shipping_schedule WHERE departure_date >= CURDATE()"
  );
  return cnt || 0;
};

export const getCurrentWeekTargetTonnage = async () => {
  const [[row]] = await dbPool.query(
    "SELECT target_tonnage_weekly AS target FROM tb_blending_plan WHERE plan_week = WEEKOFYEAR(CURDATE()) AND plan_year = YEAR(CURDATE()) ORDER BY id DESC LIMIT 1"
  );
  if (row && row.target != null) return row.target;
  const [[period]] = await dbPool.query(
    "SELECT target_tonnage FROM weekly_periods WHERE start_date <= CURDATE() AND end_date >= CURDATE() ORDER BY start_date DESC LIMIT 1"
  );
  if (period && period.target_tonnage != null) return period.target_tonnage;
  const [[latest]] = await dbPool.query(
    "SELECT target_tonnage FROM weekly_periods ORDER BY end_date DESC LIMIT 1"
  );
  return latest?.target_tonnage ?? 0;
};

export const getShippingScheduleTimeline = async () => {
  const [rows] = await dbPool.query(
    "SELECT id AS vessel_id, vessel_name, departure_date AS eta_date, departure_date AS latest_berthing, tonnage AS target_load_tons FROM tb_shipping_schedule ORDER BY departure_date ASC"
  );
  return rows;
};

export const getTargetVsActualLoadingPerVessel = async () => {
  const [rows] = await dbPool.query(
    `SELECT ss.id AS vessel_id,
            ss.vessel_name,
            ss.tonnage AS target_load_tons,
            COALESCE(SUM(drd.tonnage), 0) AS actual_tonnage
     FROM tb_shipping_schedule ss
     LEFT JOIN weekly_periods wp
       ON COALESCE(ss.departure_date, ss.departure_date) BETWEEN wp.start_date AND wp.end_date
     LEFT JOIN daily_reports dr
       ON dr.period_id = wp.period_id
     LEFT JOIN daily_report_details drd
       ON drd.report_id = dr.report_id
     GROUP BY ss.id, ss.vessel_name, target_load_tons, ss.departure_date
     ORDER BY ss.departure_date ASC`
  );
  return rows;
};

export const getVesselStatusList = async () => {
  const [rows] = await dbPool.query(
    "SELECT id AS vessel_id, vessel_name, status FROM tb_shipping_schedule ORDER BY departure_date DESC"
  );
  return rows;
};

export const getBlendingPlansFiltered = async (week, year) => {
  if (week && year) {
    const [rows] = await dbPool.query(
      "SELECT * FROM tb_blending_plan WHERE plan_week = ? AND plan_year = ? ORDER BY id DESC",
      [Number(week), Number(year)]
    );
    return rows;
  }
  const [rows] = await dbPool.query(
    "SELECT * FROM tb_blending_plan ORDER BY id DESC LIMIT 20"
  );
  return rows;
};

export const getPlanOptimizationLog = async () => {
  const [rows] = await dbPool.query(
    "SELECT * FROM plan_optimization_log ORDER BY created_at ASC"
  );
  return rows;
};

export const getLatestSelectedScenario = async () => {
  const [rows] = await dbPool.query(
    "SELECT selected_scenario_id, scenarios_json, rejection_note FROM plan_optimization_log ORDER BY created_at DESC, log_id DESC LIMIT 1"
  );
  const row = rows?.[0] || null;
  if (!row) return { selected: null, scenario: null };

  // Jika log terbaru adalah hasil reject dari Shipping, jangan tampilkan scenario
  const noteVal = row.rejection_note;
  if (noteVal !== null && String(noteVal).trim().length > 0) {
    return { selected: null, scenario: null };
  }

  let selected = null;
  let scenario = null;

  // Parse selected_scenario_id which may be a number, stringified number, or JSON object/string
  try {
    const raw = row.selected_scenario_id;
    if (typeof raw === "number") {
      selected = raw;
    } else if (typeof raw === "string") {
      const str = raw.trim();
      if (str.startsWith("{") || str.startsWith("[")) {
        const obj = JSON.parse(str);
        if (obj && typeof obj === "object") {
          selected = obj.id ?? null;
          scenario = obj; // full scenario already provided
        }
      } else {
        const n = Number(str);
        selected = Number.isNaN(n) ? null : n;
      }
    } else if (raw && typeof raw === "object") {
      selected = raw.id ?? null;
      scenario = raw;
    }
  } catch {
    selected = null;
  }

  // If we don't have the full scenario object yet, try to locate it inside scenarios_json
  if (!scenario) {
    try {
      const payload =
        typeof row.scenarios_json === "string"
          ? JSON.parse(row.scenarios_json)
          : row.scenarios_json;
      const list = Array.isArray(payload?.scenarios) ? payload.scenarios : [];
      if (selected != null) {
        scenario = list.find((s) => Number(s.id) === Number(selected)) || null;
      }
      // If selected was missing but list contains ai_recommended, fallback
      if (!scenario && list.length) {
        scenario =
          list.find((s) => s.ai_recommended === true) || list[0] || null;
        selected = scenario?.id ?? selected;
      }
    } catch {
      // keep scenario null
    }
  }

  return { selected, scenario };
};

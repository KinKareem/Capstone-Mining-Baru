const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:3000/api/auth";
import { BASE_URL, API_BASE_URL } from "./config";
import { getAccessToken } from "./auth";

export async function postAuth(endpoint, data) {
  const url = `${API_BASE}${endpoint}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch (e) {}

  if (!res.ok) {
    const msg = payload?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return payload;
}

const ENDPOINTS = {
  // Crew
  CREW_LIST: `${BASE_URL}/crews`,
  CREW_DETAIL: (idCrew) => `${BASE_URL}/crews/${idCrew}`,

  // Equipment
  EQUIPMENT_LIST: `${BASE_URL}/equipments`,
  EQUIPMENT_DETAIL: (idEquipments) => `${BASE_URL}/equipments/${idEquipments}`,

  // Daily Reports (BARU)
  DAILY_REPORT_LIST: `${BASE_URL}/daily-reports`,
  DAILY_REPORT_DETAIL: (idReport) => `${BASE_URL}/daily-reports/${idReport}`,
};

ENDPOINTS.WEEKLY_PLAN_LIST = `${BASE_URL}/weekly-plans`;
ENDPOINTS.WEEKLY_PLAN_DETAIL = (id) => `${BASE_URL}/weekly-plans/${id}`;
ENDPOINTS.WEEKLY_PLAN_GENERATE = `${BASE_URL}/weekly-plans/generate-next`;

// EQUIPMENT API
ENDPOINTS.EQUIPMENT_LIST = `${API_BASE_URL}/equipments`;
ENDPOINTS.EQUIPMENT_DETAIL = (id) => `${API_BASE_URL}/equipments/${id}`;

// EMPLOYEES API
ENDPOINTS.EMPLOYEES_LIST = `${API_BASE_URL}/employees`;
ENDPOINTS.EMPLOYEES_DETAIL = (id) => `${API_BASE_URL}/employees/${id}`;

// WEEKLY SCHEDULE API
ENDPOINTS.WEEKLY_SCHEDULE_LIST = `${API_BASE_URL}/weekly-schedules`;
ENDPOINTS.WEEKLY_SCHEDULE_DETAIL = (id) =>
  `${API_BASE_URL}/weekly-schedules/${id}`;
ENDPOINTS.WEEKLY_SCHEDULE_DROPDOWNS = `${API_BASE_URL}/weekly-schedules/dropdowns`;

// DAILY REPORT API
ENDPOINTS.DAILY_REPORT_STATS = `${BASE_URL}/daily-reports/stats`;
ENDPOINTS.DAILY_REPORT_SUMMARY = `${BASE_URL}/daily-reports/summary`;

ENDPOINTS.DAILY_REPORT_AVAILABLE_EQUIPMENT = (date) =>
  `${BASE_URL}/daily-reports/${date}/available-equipment`;

ENDPOINTS.DAILY_REPORT_ACTIVE_PERIOD = (date) =>
  `${BASE_URL}/daily-reports/${date}/active-period`;

ENDPOINTS.DAILY_REPORT_CURRENT_PERIOD = `${BASE_URL}/daily-reports/current-period`;

// DAILY ATTENDANCE API
ENDPOINTS.DAILY_ATTENDANCE = `${BASE_URL}/daily-attendance`;
ENDPOINTS.DAILY_ATTENDANCE_SUMMARY = `${BASE_URL}/daily-attendance/summary`;
ENDPOINTS.DAILY_ATTENDANCE = `${BASE_URL}/daily-attendance`;

export async function getCrewData() {
  const accessToken = getAccessToken();

  const fetchCrew = await fetch(ENDPOINTS.CREW_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  const json = await fetchCrew.json();
  return {
    ...json,
    ok: fetchCrew.ok,
  };
}

export async function deleteCrew(id) {
  const accessToken = getAccessToken();

  try {
    const response = await fetch(ENDPOINTS.CREW_DETAIL(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    let json = {};
    if (
      response.status !== 204 &&
      response.headers.get("content-type")?.includes("application/json")
    ) {
      json = await response.json().catch(() => ({}));
    }

    if (!response.ok) {
      throw new Error(
        json.message || `Gagal menghapus ID ${id}. Status: ${response.status}`
      );
    }
    return { ok: true, message: json.message };
  } catch (error) {
    throw error;
  }
}

// export functions
export async function getWeeklyPlans() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PLAN_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  return { ...json, ok: res.ok, status: res.status };
}

export async function createWeeklyPlan(payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PLAN_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Failed creating weekly plan");
  return json;
}

export async function generateNextWeeklyPlan() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PLAN_GENERATE, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Failed to generate");
  return json;
}

export async function deleteWeeklyPlan(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PLAN_DETAIL(id), {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete ${id}`);
  }
  return { ok: true };
}

/**
 * Mengambil semua daily reports
 */
export async function getAllDailyReports() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil detail daily report berdasarkan ID
 */
export async function getDailyReportDetail(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_DETAIL(id), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Membuat daily report baru
 */
export async function createDailyReport(payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed creating daily report");
  }

  return json;
}

/**
 * Mengupdate daily report
 */
export async function updateDailyReport(id, payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_DETAIL(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed updating daily report");
  }

  return json;
}

/**
 * Menghapus daily report
 */
export async function deleteDailyReport(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_DETAIL(id), {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete daily report ${id}`);
  }

  return { ok: true };
}

/**
 * Menambahkan equipment activity ke daily report
 */
export async function addDailyReportDetail(reportId, detail) {
  const accessToken = getAccessToken();
  const res = await fetch(
    `${ENDPOINTS.DAILY_REPORT_DETAIL(reportId)}/details`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(detail),
    }
  );
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed adding equipment activity");
  }

  return json;
}

/**
 * Mengupdate equipment activity
 */
export async function updateDailyReportDetail(detailId, detail) {
  const accessToken = getAccessToken();
  const res = await fetch(`${BASE_URL}/daily-reports/details/${detailId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(detail),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed updating equipment activity");
  }

  return json;
}

/**
 * Menghapus equipment activity
 */
export async function deleteDailyReportDetail(detailId) {
  const accessToken = getAccessToken();
  const res = await fetch(`${BASE_URL}/daily-reports/details/${detailId}`, {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(
      json.message || `Failed to delete equipment activity ${detailId}`
    );
  }

  return { ok: true };
}

/**
 * Menghasilkan laporan harian otomatis
 */
export async function generateDailyReport(date) {
  const accessToken = getAccessToken();
  const res = await fetch(`${ENDPOINTS.DAILY_REPORT_LIST}/generate/${date}`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed to generate daily report");
  }

  return json;
}

export async function getAvailableEquipmentForDate(date) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_AVAILABLE_EQUIPMENT(date), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

export async function getActivePeriodForDate(date) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_ACTIVE_PERIOD(date), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

export async function getCurrentPeriodInfo() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_CURRENT_PERIOD, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil available employees untuk tanggal tertentu
 */
export async function getAvailableEmployees(date) {
  const accessToken = getAccessToken();
  const res = await fetch(
    `${BASE_URL}/daily-reports/${date}/available/employees`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil available equipment untuk tanggal tertentu
 */
export async function getAvailableEquipment(date) {
  const accessToken = getAccessToken();
  const res = await fetch(
    `${BASE_URL}/daily-reports/${date}/available/equipment`,
    {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    }
  );
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil semua equipment
 */
export async function getAllEquipments() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EQUIPMENT_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil detail equipment berdasarkan ID
 */
export async function getEquipmentDetail(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EQUIPMENT_DETAIL(id), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Membuat equipment baru
 */
export async function createEquipment(payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EQUIPMENT_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed creating equipment");
  }

  return json;
}

/**
 * Mengupdate equipment
 */
export async function updateEquipment(id, payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EQUIPMENT_DETAIL(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed updating equipment");
  }

  return json;
}

/**
 * Menghapus equipment
 */
export async function deleteEquipment(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EQUIPMENT_DETAIL(id), {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete equipment ${id}`);
  }

  return { ok: true };
}

/**
 * Mengambil semua employees
 */
export async function getAllEmployees() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EMPLOYEES_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil detail employee berdasarkan ID
 */
export async function getEmployeeDetail(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EMPLOYEES_DETAIL(id), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Membuat employee baru
 */
export async function createEmployee(payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EMPLOYEES_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed creating employee");
  }

  return json;
}

/**
 * Mengupdate employee
 */
export async function updateEmployee(id, payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EMPLOYEES_DETAIL(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed updating employee");
  }

  return json;
}

/**
 * Menghapus employee
 */
export async function deleteEmployee(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.EMPLOYEES_DETAIL(id), {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete employee ${id}`);
  }

  return { ok: true };
}

/**
 * Mengambil employee statistics
 */
export async function getEmployeeStats() {
  const accessToken = getAccessToken();
  const res = await fetch(`${ENDPOINTS.EMPLOYEES_LIST}/stats`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil semua weekly schedules
 */
export async function getWeeklySchedules() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil detail weekly schedule berdasarkan ID
 */
export async function getWeeklyScheduleDetail(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_DETAIL(id), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Membuat weekly schedule baru
 */
export async function createWeeklySchedule(payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_LIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed creating weekly schedule");
  }

  return json;
}

/**
 * Mengupdate weekly schedule
 */
export async function updateWeeklySchedule(id, payload) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_DETAIL(id), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json.message || "Failed updating weekly schedule");
  }

  return json;
}

/**
 * Menghapus weekly schedule
 */
export async function deleteWeeklySchedule(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_DETAIL(id), {
    method: "DELETE",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Failed to delete weekly schedule ${id}`);
  }

  return { ok: true };
}

/**
 * Mengambil dropdown data untuk form
 */
export async function getWeeklyScheduleDropdowns() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_SCHEDULE_DROPDOWNS, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mendapatkan statistik harian
 */
export async function getDailyReportStats() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.DAILY_REPORT_STATS, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mendapatkan ringkasan laporan harian
 */
export async function getDailyReportSummary(date) {
  const accessToken = getAccessToken();
  const url = date
    ? `${ENDPOINTS.DAILY_REPORT_SUMMARY}?date=${date}`
    : ENDPOINTS.DAILY_REPORT_SUMMARY;

  const res = await fetch(url, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil semua weekly periods - FUNGSI INI YANG DITAMBAHKAN
 */
export async function getWeeklyPeriods() {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PERIODS_LIST, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Mengambil detail weekly period berdasarkan ID
 */
export async function getWeeklyPeriodDetail(id) {
  const accessToken = getAccessToken();
  const res = await fetch(ENDPOINTS.WEEKLY_PERIODS_DETAIL(id), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));

  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Batch update kehadiran
 */
export async function batchUpdateDailyAttendance(date, attendanceList) {
  const accessToken = getAccessToken();
  const res = await fetch(`${ENDPOINTS.DAILY_ATTENDANCE}/${date}/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({ attendance: attendanceList }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(json.message || "Failed to batch update attendance");
  return json;
}

/**
 * Update kehadiran untuk karyawan tertentu
 */
export async function updateAttendance(date, employeeId, attendanceData) {
  try {
    const accessToken = getAccessToken();
    console.log("Updating attendance:", { date, employeeId, attendanceData });

    const res = await fetch(
      `${ENDPOINTS.DAILY_ATTENDANCE}/${date}/${employeeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(attendanceData),
      }
    );

    console.log("Response status:", res.status);

    const text = await res.text();
    console.log("Response text:", text);

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new Error("Invalid response from server");
    }

    if (!res.ok) {
      console.error("Server error response:", json);
      throw new Error(
        json.message ||
          json.serverMessage ||
          `Failed to update attendance (${res.status})`
      );
    }

    return json;
  } catch (error) {
    console.error("API Error updateAttendance:", error);
    throw error;
  }
}
/**
 * Mengambil data karyawan untuk dropdown
 */
export async function getAllActiveEmployees() {
  const accessToken = getAccessToken();
  const res = await fetch(`${ENDPOINTS.EMPLOYEES_LIST}?status=active`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  return {
    ...json,
    ok: res.ok,
    status: res.status,
  };
}

/**
 * Get daily attendance for a date
 */
export async function getDailyAttendance(date) {
  try {
    const accessToken = getAccessToken();
    const res = await fetch(`${ENDPOINTS.DAILY_ATTENDANCE}?date=${date}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || "Failed to get daily attendance");
    }

    return json; // json sudah mengandung { message, data }
  } catch (error) {
    console.error("API Error getDailyAttendance:", error);
    throw error;
  }
}

/**
 * Get daily attendance summary
 */
export async function getDailyAttendanceSummary(date) {
  const accessToken = getAccessToken();
  const res = await fetch(
    `${ENDPOINTS.DAILY_ATTENDANCE}/summary?date=${date}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    }
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(json.message || "Failed to get attendance summary");
  return json;
}

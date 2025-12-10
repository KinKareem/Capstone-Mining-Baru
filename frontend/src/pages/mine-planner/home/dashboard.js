import { BASE_URL } from "../../utils/config.js";
import { getAccessToken } from "../../utils/auth.js";

// =========================
//  TANGGAL FORMAT: "05 Des"
// =========================
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("T")[0].split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  return `${d} ${months[Number(m) - 1]}`;
}

async function fetchJson(path) {
  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed ${res.status}`);
  return data;
}

// =========================
//    BAR CHART PRO
// =========================
function renderBarChart(canvas, labels, values) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 50;
  const paddingBottom = 35;
  const paddingTop = 25;

  const maxVal = Math.max(...values, 1);
  const yTicks = 4;
  const step = Math.ceil(maxVal / yTicks);

  const chartHeight = h - paddingBottom - paddingTop;
  const chartWidth = w - paddingLeft - 20;

  const barWidth = values.length ? chartWidth / values.length - 10 : 20;

  ctx.strokeStyle = "#e5e7eb";
  for (let t = 0; t <= yTicks; t++) {
    const y = h - paddingBottom - (t / yTicks) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px system-ui";
    ctx.fillText(String(t * step), 8, y + 4);
  }

  values.forEach((v, i) => {
    const x = paddingLeft + i * (barWidth + 10) + 5;
    const barHeight = Math.round((v / (yTicks * step)) * chartHeight);
    const y = h - paddingBottom - barHeight;

    ctx.fillStyle = "#6366F1";
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = "#1f2937";
    ctx.font = "12px system-ui";

    if (i % Math.ceil(labels.length / 6) === 0)
      ctx.fillText(labels[i], x, h - paddingBottom + 16);

    if (v > 0) ctx.fillText(v, x, y - 4);
  });
}

// =========================
//      PIE CHART PRO
// =========================
function renderPieChart(canvas, entries, legendEl) {
  const total = entries.reduce((a, b) => a + b.value, 0) || 1;
  const ctx = canvas.getContext("2d");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = Math.min(cx, cy) - 10;

  let start = -Math.PI / 2;

  const colors = ["#4ADE80", "#F87171", "#FBBF24", "#60A5FA", "#818CF8"];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  entries.forEach((e, i) => {
    const angle = (e.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += angle;
  });

  if (legendEl) {
    legendEl.innerHTML = entries
      .map(
        (e, i) =>
          `<div class="legend-item">
            <span class="legend-swatch" style="background:${colors[i % colors.length]}"></span>
            ${e.label}
          </div>`
      )
      .join("");
  }
}

// =========================
//     LINE CHART PRO
// =========================
function renderLineChart(canvas, labels, values) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 50;
  const paddingBottom = 35;
  const paddingTop = 25;

  const maxVal = Math.max(...values, 1);
  const yTicks = 4;
  const step = Math.ceil(maxVal / yTicks);

  const chartHeight = h - paddingBottom - paddingTop;
  const chartWidth = w - paddingLeft - 20;

  ctx.strokeStyle = "#e5e7eb";
  for (let t = 0; t <= yTicks; t++) {
    const y = h - paddingBottom - (t / yTicks) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px system-ui";
    ctx.fillText(String(t * step), 8, y + 4);
  }

  ctx.strokeStyle = "#4F46E5";
  ctx.lineWidth = 2;
  ctx.beginPath();

  labels.forEach((_, i) => {
    const x = paddingLeft + (i / Math.max(1, labels.length - 1)) * chartWidth;
    const v = values[i] ?? 0;
    const y = h - paddingBottom - Math.round((v / (yTicks * step)) * chartHeight);

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  ctx.fillStyle = "#1f2937";
  ctx.font = "12px system-ui";

  labels.forEach((lab, i) => {
    if (i % Math.ceil(labels.length / 6) === 0) {
      const x = paddingLeft + (i / Math.max(1, labels.length - 1)) * chartWidth;
      ctx.save();
      ctx.translate(x, h - paddingBottom + 15);
      ctx.rotate(-0.4);
      ctx.fillText(lab, 0, 0);
      ctx.restore();
    }
  });
}

// =========================
//  STACKED BAR CHART PRO
// =========================
function renderStackedBar(canvas, labels, seriesMap) {
  const statuses = Object.keys(seriesMap);

  const colors = {
    present: "#4ADE80",
    sick: "#FBBF24",
    permission: "#60A5FA",
    absent: "#F87171",
    leave: "#A1A1AA",
  };

  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 50;
  const paddingBottom = 35;
  const paddingTop = 25;

  const chartHeight = h - paddingBottom - paddingTop;
  const chartWidth = w - paddingLeft - 20;

  const barWidth = labels.length ? chartWidth / labels.length - 10 : 20;

  const totals = labels.map((_, i) =>
    statuses.reduce((sum, s) => sum + (seriesMap[s][i] || 0), 0)
  );

  const maxVal = Math.max(...totals, 1);
  const yTicks = 4;
  const step = Math.ceil(maxVal / yTicks);

  ctx.strokeStyle = "#e5e7eb";
  for (let t = 0; t <= yTicks; t++) {
    const y = h - paddingBottom - (t / yTicks) * chartHeight;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
    ctx.fillStyle = "#9ca3af";
    ctx.font = "12px system-ui";
    ctx.fillText(String(t * step), 8, y + 4);
  }

  labels.forEach((lab, i) => {
    let yBase = h - paddingBottom;

    statuses.forEach((s) => {
      const v = seriesMap[s][i] || 0;
      const height = Math.round((v / (yTicks * step)) * chartHeight);
      const x = paddingLeft + i * (barWidth + 10) + 5;

      ctx.fillStyle = colors[s] || "#6366F1";
      ctx.fillRect(x, yBase - height, barWidth, height);
      yBase -= height;
    });

    ctx.fillStyle = "#1f2937";
    ctx.font = "12px system-ui";

    if (i % Math.ceil(labels.length / 6) === 0)
      ctx.fillText(lab, paddingLeft + i * (barWidth + 10), h - paddingBottom + 16);
  });
}

// =========================
//        WEATHER
// =========================
async function loadWeather() {
  const card = document.getElementById("weatherCard");
  try {
    const wx = await fetchJson("/dashboard/weather-today");
    let d = wx.data || {};

    const label = d.road_condition || "Cuaca";
    const emoji = "🌤️";

    document.getElementById("weatherSummary").textContent =
      `${emoji} ${label} • Hujan: ${d.rainfall_mm ?? 0}mm`;

    document.getElementById("weatherMeta").textContent =
      `Gelombang: ${d.max_wave_m ?? 0}m • Pelabuhan: ${d.port_status ?? "-"} • Jam efektif: ${d.effective_working_hours ?? "-"}`;
  } catch {
    const d = mockWeatherData;
    const label = d.road_condition || "Cuaca";
    const emoji = "🌤️";
    document.getElementById("weatherSummary").textContent =
      `${emoji} ${label} • Hujan: ${d.rainfall_mm ?? 0}mm`;

    document.getElementById("weatherMeta").textContent =
      `Gelombang: ${d.max_wave_m ?? 0}m • Pelabuhan: ${d.port_status ?? "-"} • Jam efektif: ${d.effective_working_hours ?? "-"}`;
  }
}

// =========================
//     MAIN DASHBOARD INIT
// =========================
async function initDashboard() {
  // KPI
  try {
    const kpi = await fetchJson("/dashboard/kpi");
    const d = kpi.data || {};
    const dailyTonnage = d.dailyTonnageToday ?? 0;

    const eq = d.equipmentReady || { ready: 0, total: 0, percent: 0 };
    const att = d.employeeAttendance || { present: 0, total: 0, percent: 0 };
    const wk = d.productionWeekly || { target: 0, actual: 0, percent: 0 };

    document.getElementById("kpiTonnageToday").textContent =
      dailyTonnage.toLocaleString("id-ID");

    document.getElementById("kpiEquipmentReadyBar").style.width = `${eq.percent}%`;
    document.getElementById("kpiEquipmentReadyText").textContent =
      `${eq.ready} / ${eq.total}`;

    document.getElementById("kpiAttendanceBar").style.width = `${att.percent}%`;
    document.getElementById("kpiAttendanceText").textContent =
      `${att.present} / ${att.total}`;

    document.getElementById("kpiWeeklyProgressBar").style.width = `${wk.percent}%`;
    document.getElementById("kpiWeeklyProgressText").textContent =
      `${wk.actual.toLocaleString("id-ID")} / ${wk.target.toLocaleString("id-ID")} Ton`;

  } catch {
    document.getElementById("kpiTonnageToday").textContent = "0";
    document.getElementById("kpiEquipmentReadyBar").style.width = "0%";
    document.getElementById("kpiEquipmentReadyText").textContent = "0 / 0";
    document.getElementById("kpiAttendanceBar").style.width = "0%";
    document.getElementById("kpiAttendanceText").textContent = "0 / 0";
    document.getElementById("kpiWeeklyProgressBar").style.width = "0%";
    document.getElementById("kpiWeeklyProgressText").textContent = "0 / 0 Ton";
  }

  // Daily Trend Line
  try {
    const trend = await fetchJson("/dashboard/daily-trend?days=30");
    const rows = trend.data || [];

    const labels = rows.map((r) => formatDate(r.date));
    const values = rows.map((r) => Number(r.tonnage || 0));

    renderLineChart(
      document.getElementById("dailyTrendChart"),
      labels,
      values
    );
  } catch {
    renderLineChart(document.getElementById("dailyTrendChart"), [], []);
  }

  // Equipment Breakdown Bar
  try {
    const br = await fetchJson("/dashboard/equipment-breakdown?days=7");
    const rows = br.data || [];

    const labels = rows.map((r) => r.unit_code);
    const values = rows.map((r) => Number(r.total_tonnage || 0));

    renderBarChart(
      document.getElementById("equipmentBreakdownChart"),
      labels,
      values
    );

    const legend = document.getElementById("equipmentBreakdownLegend");
    if (legend)
      legend.innerHTML = labels
        .map(
          (l) =>
            `<div class="legend-item"><span class="legend-swatch" style="background:#6366F1"></span>${l}</div>`
        )
        .join("");

  } catch {
    renderBarChart(document.getElementById("equipmentBreakdownChart"), [], []);
  }

  // Equipment Status Pie
  try {
    const st = await fetchJson("/dashboard/equipment-status");
    const rows = (st.data && st.data.rows) || [];

    const entries = ["ready", "breakdown", "maintenance", "standby"].map((k) => ({
      label: k,
      value: Number(
        (rows.find((r) => r.equipment_status === k) || {}).count || 0
      ),
    }));

    renderPieChart(
      document.getElementById("equipmentStatusChart"),
      entries,
      document.getElementById("equipmentStatusLegend")
    );
  } catch {
    renderPieChart(document.getElementById("equipmentStatusChart"), [], []);
  }

  // Attendance Stacked Bar
  try {
    const at = await fetchJson("/dashboard/attendance-trend?days=14");
    const rows = at.data || [];

    const labels = Array.from(
      new Set(rows.map((r) => formatDate(r.date)))
    ).sort();

    const statuses = ["present", "sick", "permission", "absent", "leave"];

    const seriesMap = Object.fromEntries(
      statuses.map((s) => [
        s,
        labels.map((d) => {
          const m = rows.find(
            (r) => formatDate(r.date) === d && r.attendance_status === s
          );
          return Number(m?.count || 0);
        }),
      ])
    );

    renderStackedBar(
      document.getElementById("attendanceStackedChart"),
      labels,
      seriesMap
    );
  } catch {
    renderStackedBar(document.getElementById("attendanceStackedChart"), [], {});
  }

  // =========================
  //   ATTENDANCE TABLE (UPDATED)
  // =========================
  try {
    const det = await fetchJson("/dashboard/attendance-detail?days=14");
    const rows = det.data || [];

    // Ambil tanggal hari ini (format YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // Filter hanya data attendance hari ini
    const todayRows = rows.filter(r =>
      r.date.split("T")[0] === today
    );

    const tbody = document.querySelector("#attendanceDetailTable tbody");

    if (tbody)
      tbody.innerHTML = todayRows
        .map(
          (r) =>
            `<tr>
              <td>${r.name || "-"}</td>
              <td>${formatDate(r.date)}</td>
              <td>${r.attendance_status || "-"}</td>
              <td>${r.remarks || ""}</td>
            </tr>`
        )
        .join("");

  } catch { }

  // Weekly Schedule
  try {
    let page = 1;
    const pageSize = 10;

    const renderSchedule = async () => {
      const sch = await fetchJson(
        `/dashboard/weekly-schedule?page=${page}&pageSize=${pageSize}`
      );

      const data = sch.data || {};
      const rows = data.rows || [];

      const tbody = document.querySelector("#weeklyScheduleTable tbody");

      if (tbody)
        tbody.innerHTML = rows
          .map(
            (r) =>
              `<tr>
                <td>${formatDate(r.date)}</td>
                <td>${r.name || "-"}</td>
                <td>${r.unit_code || "-"}</td>
                <td>${r.shift_name || "-"}</td>
                <td>${r.location_name || "-"}</td>
                <td>${r.notes || ""}</td>
              </tr>`
          )
          .join("");
    };

    document.getElementById("weeklyPrev").addEventListener("click", () => {
      if (page > 1) {
        page--;
        renderSchedule();
      }
    });

    document.getElementById("weeklyNext").addEventListener("click", () => {
      page++;
      renderSchedule();
    });

    renderSchedule();
  } catch {
    const tbody = document.querySelector("#weeklyScheduleTable tbody");
    if (tbody)
      tbody.innerHTML =
        "<tr><td colspan='6' class='text-center'>No data available</td></tr>";
  }

  loadWeather();
}

document.addEventListener("DOMContentLoaded", initDashboard);

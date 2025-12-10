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
//    DUAL BAR CHART PRO
// =========================
function renderDualBarChart(canvas, labels, targetValues, actualValues) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 50;
  const paddingBottom = 35;
  const paddingTop = 25;

  const maxVal = Math.max(...targetValues, ...actualValues, 1);
  const yTicks = 4;
  const step = Math.ceil(maxVal / yTicks);

  const chartHeight = h - paddingBottom - paddingTop;
  const chartWidth = w - paddingLeft - 20;

  const groupWidth = labels.length ? chartWidth / labels.length - 12 : 20;
  const barWidth = Math.max(6, Math.floor(groupWidth / 2) - 2);

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
    const xBase = paddingLeft + i * (groupWidth + 12) + 6;
    const tVal = targetValues[i] || 0;
    const aVal = actualValues[i] || 0;
    const tH = Math.round((tVal / (yTicks * step)) * chartHeight);
    const aH = Math.round((aVal / (yTicks * step)) * chartHeight);
    const yT = h - paddingBottom - tH;
    const yA = h - paddingBottom - aH;

    // Target bar (blue)
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(xBase, yT, barWidth, tH);

    // Actual bar (green)
    ctx.fillStyle = "#10b981";
    ctx.fillRect(xBase + barWidth + 4, yA, barWidth, aH);

    ctx.fillStyle = "#374151";
    ctx.font = "12px system-ui";
    ctx.fillText(String(lab).slice(0, 8), xBase, h - paddingBottom + 16);
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

// ====================================
//     VERTICAL GANTT CHART (UPWARDS)
// ====================================
function renderGantt(container, items) {
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="text-center py-4 text-muted">No vessel data available</div>';
    return;
  }

  items.sort((a, b) => new Date(a.eta_date) - new Date(b.eta_date));

  const oneDay = 1000 * 60 * 60 * 24;

  const earliestDate = new Date(Math.min(...items.map(i => new Date(i.eta_date))));
  const latestDate = new Date(Math.max(...items.map(i => new Date(i.latest_berthing || i.eta_date))));

  const dateRange = Math.max(1, Math.ceil((latestDate - earliestDate) / oneDay));

  // KOLom antar kapal
  const colWidth = 80;
  const chartHeight = dateRange * 22 + 60;

  let html = `
    <div style="display:flex; padding-top:20px;">
  `;

  // ===============================
  //  LEFT Y-AXIS (TANGGAL)
  // ===============================
  html += `
    <div style="width:80px; text-align:right; padding-right:8px; font-size:11px;">
  `;

  for (let i = dateRange; i >= 0; i--) {
    const d = new Date(latestDate.getTime() - i * oneDay);
    const dateStr = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

    html += `
      <div style="height:22px; line-height:22px; border-bottom:1px dashed #e5e7eb;">
        ${dateStr}
      </div>
    `;
  }

  html += `</div>`;

  // ===============================
  //  VERTICAL BARS PER KAPAL
  // ===============================
  html += `<div style="display:flex;">`;

  items.forEach((item) => {
    const start = new Date(item.eta_date);
    const end = new Date(item.latest_berthing || item.eta_date);

    const startOffset = Math.floor((start - earliestDate) / oneDay);
    const endOffset = Math.floor((end - earliestDate) / oneDay);

    const barBottom = (dateRange - endOffset) * 22;
    const barHeight = (endOffset - startOffset + 1) * 22;

    html += `
      <div style="width:${colWidth}px; text-align:center; position:relative;">
        
        <!-- Nama kapal -->
        <div style="font-size:12px; font-weight:600; margin-bottom:8px;">
          ${item.vessel_name}
        </div>

        <!-- Bar vertikal -->
        <div style="
          position:absolute;
          bottom:${barBottom}px;
          left:50%;
          transform:translateX(-50%);
          width:20px;
          height:${barHeight}px;
          background:#ef4444cc;
          border-radius:4px;
        "></div>
        
        <!-- Grid vertical -->
        <div style="height:${chartHeight}px; border-left:1px dashed #f3f4f6;"></div>
      </div>
    `;
  });

  html += `</div></div>`;

  container.innerHTML = html;
}



// =========================
//        WEATHER
// =========================
async function loadWeather() {
  try {
    const wx = await fetchJson("/shipping-dashboard/weather");
    const d = wx.data || {};

    const rainfall = d.rainfall_mm ?? 0;
    const waveHeight = d.max_wave_m ?? 0;
    const portStatus = d.port_status ?? "-";
    const workingHours = d.effective_working_hours ?? 0;

    // Update summary card
    document.getElementById("weatherSummary").textContent =
      `🌤️ Port Status: ${portStatus} • Rainfall: ${rainfall}mm`;

    document.getElementById("weatherMeta").textContent =
      `Wave Height: ${waveHeight}m • Effective Working Hours: ${workingHours}`;

    // Update individual weather cards
    document.getElementById("wxRainfall").textContent = rainfall;
    document.getElementById("wxWave").textContent = waveHeight;
    document.getElementById("wxPort").textContent = portStatus;
    document.getElementById("wxHours").textContent = workingHours;

  } catch (error) {
    console.error("Error loading weather:", error);
    // Fallback data
    document.getElementById("weatherSummary").textContent =
      "🌤️ Port Status: Operational • Rainfall: 0mm";

    document.getElementById("weatherMeta").textContent =
      "Wave Height: 0.5m • Effective Working Hours: 12";

    document.getElementById("wxRainfall").textContent = "0";
    document.getElementById("wxWave").textContent = "0.5";
    document.getElementById("wxPort").textContent = "Operational";
    document.getElementById("wxHours").textContent = "12";
  }
}

// =========================
//     MAIN DASHBOARD INIT
// =========================
async function initDashboard() {
  // KPI Cards
  try {
    const kpi = await fetchJson("/shipping-dashboard/kpi");
    const d = kpi.data || {};

    document.getElementById("kpiUpcomingVessel").textContent = d.upcomingVessel ?? 0;
    document.getElementById("kpiWeeklyTarget").textContent =
      (d.weeklyTarget ?? 0).toLocaleString("id-ID");
    document.getElementById("kpiPortStatus").textContent = d.portStatus ?? "-";
    document.getElementById("kpiWaveHeight").textContent = `${d.waveHeight ?? 0} m`;

  } catch (error) {
    console.error("Error loading KPI:", error);
    // Fallback values
    document.getElementById("kpiUpcomingVessel").textContent = "0";
    document.getElementById("kpiWeeklyTarget").textContent = "0";
    document.getElementById("kpiPortStatus").textContent = "-";
    document.getElementById("kpiWaveHeight").textContent = "0 m";
  }

  // Target vs Actual Chart
  try {
    const ta = await fetchJson("/shipping-dashboard/target-vs-actual");
    const rows = ta.data || [];

    const labels = rows.slice(0, 7).map((r) => r.vessel_name || "Vessel");
    const targetValues = rows.slice(0, 7).map((r) => Number(r.target_load_tons || 0));
    const actualValues = rows.slice(0, 7).map((r) => Number(r.actual_tonnage || 0));

    const canvas = document.getElementById("targetActualChart");
    if (canvas) {
      renderDualBarChart(canvas, labels, targetValues, actualValues);
    }
  } catch (error) {
    console.error("Error loading target vs actual:", error);
    const canvas = document.getElementById("targetActualChart");
    if (canvas) {
      renderDualBarChart(canvas, [], [], []);
    }
  }

  // Vessel Status Pie Chart
  try {
    const statusData = await fetchJson("/shipping-dashboard/vessel-status");
    const rows = statusData.data || [];

    const statusCounts = {
      'Ready': 0,
      'Arriving': 0,
      'Loading': 0,
      'Delayed': 0,
      'Maintenance': 0
    };

    rows.forEach(vessel => {
      const status = vessel.status?.toLowerCase() || 'ready';
      if (status.includes('ready')) statusCounts['Ready']++;
      else if (status.includes('arriv')) statusCounts['Arriving']++;
      else if (status.includes('load')) statusCounts['Loading']++;
      else if (status.includes('delay')) statusCounts['Delayed']++;
      else if (status.includes('maintenance')) statusCounts['Maintenance']++;
      else statusCounts['Ready']++;
    });

    const entries = Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([label, value]) => ({ label, value }));

    const canvas = document.getElementById("vesselStatusChart");
    const legendEl = document.getElementById("vesselStatusLegend");

    if (canvas) {
      renderPieChart(canvas, entries, legendEl);
    }
  } catch (error) {
    console.error("Error loading vessel status:", error);
    const canvas = document.getElementById("vesselStatusChart");
    if (canvas) {
      renderPieChart(canvas, [], document.getElementById("vesselStatusLegend"));
    }
  }

  // Gantt Chart
  try {
    const scheduleData = await fetchJson("/shipping-dashboard/schedule");
    const rows = scheduleData.data || [];

    const container = document.getElementById("ganttContainer");
    if (container) {
      renderGantt(container, rows);
    }
  } catch (error) {
    console.error("Error loading schedule:", error);
    const container = document.getElementById("ganttContainer");
    if (container) {
      container.innerHTML = '<div class="text-center py-4 text-muted">Failed to load vessel timeline</div>';
    }
  }
  // Weather Data
  await loadWeather();

  // Blending Plan Table
  try {
    let week = null;
    let year = null;

    const renderBlending = async () => {
      const url = week && year
        ? `/shipping-dashboard/blending-plans?week=${week}&year=${year}`
        : `/shipping-dashboard/blending-plans`;

      const res = await fetchJson(url);
      const rows = res.data || [];

      const tbody = document.querySelector("#shippingBlendingTable tbody");
      if (tbody) {
        tbody.innerHTML = rows
          .map(
            (p) => `
            <tr>
              <td>${p.plan_week || "-"}</td>
              <td>${p.plan_year || "-"}</td>
              <td>${p.target_tonnage_weekly?.toLocaleString("id-ID") || "0"}</td>
              <td>${p.target_calori || "-"}</td>
              <td>${p.initial_ash_draft || "-"}</td>
              <td>${p.final_ash_result || "-"}</td>
              <td>
                <span class="badge ${Number(p.is_approved_mine) === 1 ? "ok" : "pending"}">
                  ${Number(p.is_approved_mine) === 1 ? "Approved" : "Pending"}
                </span>
              </td>
              <td>
                <span class="badge ${Number(p.is_approved_shipping) === 1 ? "ok" : "pending"}">
                  ${Number(p.is_approved_shipping) === 1 ? "Approved" : "Pending"}
                </span>
              </td>
            </tr>`
          )
          .join("");
      }
    };

    document.getElementById("applyFilter")?.addEventListener("click", () => {
      week = Number(document.getElementById("filterWeek").value) || null;
      year = Number(document.getElementById("filterYear").value) || null;
      renderBlending();
    });

    await renderBlending();
  } catch (error) {
    console.error("Error loading blending plans:", error);
    const tbody = document.querySelector("#shippingBlendingTable tbody");
    if (tbody) {
      tbody.innerHTML = "<tr><td colspan='8' class='text-center'>No data available</td></tr>";
    }
  }

  // Optimization Logs
  try {
    const logs = await fetchJson("/shipping-dashboard/optimization-logs");
    const rows = logs.data || [];

    const accordion = document.getElementById("optimizationAccordion");
    if (accordion) {
      if (rows.length === 0) {
        accordion.innerHTML = '<div class="text-center py-2 text-muted">No optimization logs available</div>';
      } else {
        accordion.innerHTML = rows
          .slice(0, 5) // Show only 5 most recent logs
          .map((r, idx) => {
            const id = `opt${idx}`;
            const step = r.current_step || "-";
            const note = r.rejection_note || "-";
            const isRejected = note !== "-";

            return `
              <div class="accordion-item">
                <h2 class="accordion-header" id="h${id}">
                  <button class="accordion-button ${isRejected ? "text-danger" : ""}" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#c${id}" 
                          aria-expanded="false" 
                          aria-controls="c${id}">
                    ${r.plan_id || "Plan"} • v${r.version || "1"} • ${step} • ${r.created_at || ""}
                  </button>
                </h2>
                <div id="c${id}" 
                     class="accordion-collapse collapse" 
                     aria-labelledby="h${id}">
                  <div class="accordion-body">
                    <div><strong>Step:</strong> ${step}</div>
                    <div class="mt-2"><strong>Rejection Note:</strong> ${note}</div>
                  </div>
                </div>
              </div>`;
          })
          .join("");
      }
    }
  } catch (error) {
    console.error("Error loading optimization logs:", error);
    const accordion = document.getElementById("optimizationAccordion");
    if (accordion) {
      accordion.innerHTML = '<div class="text-center py-2 text-muted">Failed to load optimization logs</div>';
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", initDashboard);
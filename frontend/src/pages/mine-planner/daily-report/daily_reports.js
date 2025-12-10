import {
  getAllDailyReports,
  createDailyReport,
  updateDailyReport,
  deleteDailyReport,
  getDailyReportDetail,
  getDailyReportSummary,
  generateDailyReport,
  getAvailableEquipmentForDate,
  getActivePeriodForDate,
  getAllEmployees,
  getAllEquipments,
} from "../../utils/api.js";

let reportsList = [];
let periodsList = [];
let productionChart = null;

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num || 0);
}

function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "-";
  }
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function calculateAchievement(actual, target) {
  if (!target || target === 0) return 0;
  return Math.round((actual / target) * 100);
}

function showToast(type, title, message) {
  const existingToasts = document.querySelectorAll(".toast");
  existingToasts.forEach((toast) => toast.remove());

  const toastHtml = `
        <div class="toast align-items-center text-bg-${type} border-0 position-fixed bottom-0 end-0 m-3" 
             role="alert" style="z-index: 1060">
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", toastHtml);
  const toast = new bootstrap.Toast(document.querySelector(".toast"));
  toast.show();
}

function updateTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const timeElement = document.getElementById("current-time");
  if (timeElement) {
    timeElement.textContent = timeString;
  }
}

async function updatePeriodAndEquipment(date, isEdit = false) {
  if (!date) return;

  const periodDisplay = isEdit
    ? document.getElementById("edit_period_display")
    : document.getElementById("period_display");

  const periodInput = isEdit
    ? document.getElementById("edit_period_id")
    : document.getElementById("period_id");

  const equipmentCountInput = isEdit
    ? document.getElementById("edit_total_equipment_ready")
    : document.getElementById("total_equipment_ready");

  const attendanceCountInput = isEdit
    ? document.getElementById("edit_total_employees_present")
    : document.getElementById("total_employees_present");

  try {
    // Get active period for the date - PERBAIKAN: Gunakan endpoint yang benar
    const response = await getActivePeriodForDate(date);

    // Pastikan response memiliki data yang valid
    if (response.ok && response.data) {
      const period = response.data;

      if (periodDisplay) {
        periodDisplay.innerHTML = `
          <div class="alert alert-info mb-0">
            <i class="bi bi-calendar-check me-2"></i>
            <strong>${period.period_code || "N/A"}</strong>
            <br>
            <small>Target: ${formatNumber(
              period.target_tonnage || 0
            )} tons</small>
          </div>
        `;
      }

      if (periodInput) {
        periodInput.value = period.period_id;
      }
    } else {
      // Tidak ada period aktif atau error
      console.warn("No active period found or error:", response);

      if (periodDisplay) {
        periodDisplay.innerHTML = `
          <div class="alert alert-warning mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            No active period found for selected date. 
            Please check Weekly Periods or create a new period.
          </div>
        `;
      }
      if (periodInput) {
        periodInput.value = "";
      }

      // Tetap coba ambil data equipment dan attendance
    }

    // Update equipment count - tetap dijalankan meski tidak ada period
    const equipmentResponse = await getAvailableEquipmentForDate(date);

    if (equipmentResponse.ok && equipmentResponse.data) {
      if (equipmentCountInput) {
        equipmentCountInput.value = equipmentResponse.data.length;
      }
    } else {
      if (equipmentCountInput) {
        equipmentCountInput.value = 0;
      }
    }

    // Update attendance count (dari summary)
    const summaryResponse = await getDailyReportSummary(date);

    if (summaryResponse.ok && summaryResponse.data) {
      if (attendanceCountInput) {
        attendanceCountInput.value = summaryResponse.data.attendance_count || 0;
      }
    } else {
      if (attendanceCountInput) {
        attendanceCountInput.value = 0;
      }
    }
  } catch (error) {
    console.error("Error updating period and equipment:", error);
    showToast("danger", "Error", "Failed to load period information");

    // Fallback: coba gunakan periodsList yang sudah di-load
    const fallbackPeriod = findPeriodInList(date);
    if (fallbackPeriod && periodDisplay) {
      periodDisplay.innerHTML = `
        <div class="alert alert-info mb-0">
          <i class="bi bi-calendar-check me-2"></i>
          <strong>${fallbackPeriod.period_code}</strong> (from cache)
          <br>
          <small>Target: ${formatNumber(
            fallbackPeriod.target_tonnage
          )} tons</small>
        </div>
      `;
      if (periodInput) {
        periodInput.value = fallbackPeriod.period_id;
      }
    }
  }
}

// Helper function untuk mencari period di periodsList
function findPeriodInList(date) {
  if (!date || periodsList.length === 0) return null;

  const targetDate = new Date(date);

  for (const period of periodsList) {
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);

    // Periksa apakah tanggal target berada di antara start_date dan end_date
    if (targetDate >= startDate && targetDate <= endDate) {
      return period;
    }
  }

  return null;
}

async function checkActivePeriodForDate(date) {
  if (!date) {
    return null;
  }

  try {
    const response = await getActivePeriodForDate(date);

    if (response.ok && response.data) {
      return response.data;
    } else {
      console.warn(
        "No active period found for date:",
        date,
        "Response:",
        response
      );
      return null;
    }
  } catch (error) {
    console.error("Error checking active period:", error);
    return null;
  }
}

async function loadDailyReports() {
  try {
    const tbody = document.getElementById("reports-table-body");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading daily reports...</p>
          </td>
        </tr>
      `;
    }

    const response = await getAllDailyReports();
    if (!response.ok) {
      throw new Error(response.message || "Failed to load daily reports");
    }

    reportsList = response.data || [];

    if (periodsList.length === 0) {
      await loadPeriods();
    }

    await updateStatistics();

    renderReportsTable(reportsList);

    setTimeout(() => {
      initializeChart();
    }, 500);
  } catch (error) {
    console.error("Error loading daily reports:", error);
    showToast("danger", "Error", "Failed to load daily reports data");

    const tbody = document.getElementById("reports-table-body");
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-5">
            <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
            <p class="mt-2 text-danger">Failed to load data</p>
            <button class="btn btn-sm btn-primary mt-2" onclick="loadDailyReports()">
              <i class="bi bi-arrow-clockwise me-1"></i> Try Again
            </button>
          </td>
        </tr>
      `;
    }
  }
}

async function loadPeriods() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const response = await getActivePeriodForDate(today);

    if (response.ok && response.data) {
      periodsList = Array.isArray(response.data)
        ? response.data
        : [response.data];

      periodsList.forEach((period, index) => {
        console.log(`Period ${index + 1}:`, {
          period_code: period.period_code,
          start_date: period.start_date,
          end_date: period.end_date,
          target_tonnage: period.target_tonnage,
        });
      });
    } else {
      console.error("Failed to load periods:", response);
    }
  } catch (error) {
    console.error("Error loading periods:", error);
  }
}

async function updateStatistics() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const sortedReports = [...reportsList].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    const latestReport = sortedReports.length > 0 ? sortedReports[0] : null;

    const todayReport = reportsList.find((r) => {
      if (!r.date) return false;
      const reportDate = new Date(r.date).toISOString().split("T")[0];
      return reportDate === today;
    });

    let todayPeriod = null;
    const activePeriodResponse = await checkActivePeriodForDate(today);
    if (activePeriodResponse) {
      todayPeriod = activePeriodResponse;
    }

    const todayTonnage = todayReport
      ? parseFloat(todayReport.daily_tonnage) || 0
      : 0;
    document.getElementById("today-tonnage").textContent = `${formatNumber(
      todayTonnage
    )} tons`;

    const todayTarget = todayPeriod
      ? parseFloat(todayPeriod.target_tonnage) || 0
      : 0;
    const targetElement = document.getElementById("today-target");
    if (targetElement) {
      targetElement.textContent = `${formatNumber(todayTarget)} tons`;
    }

    const progressBar = document.getElementById("tonnage-progress");
    if (progressBar) {
      if (todayTarget > 0) {
        const progressPercent = Math.min(
          (todayTonnage / todayTarget) * 100,
          100
        );
        progressBar.style.width = `${progressPercent}%`;
        progressBar.textContent = `${Math.round(progressPercent)}%`;
      } else {
        progressBar.style.width = "0%";
        progressBar.textContent = "0%";
      }
    }

    let activeEmployees = 0;
    try {
      const employeesResponse = await getAllEmployees();
      if (employeesResponse.ok && employeesResponse.data) {
        activeEmployees = employeesResponse.data.filter(
          (emp) => emp.status === "active"
        ).length;
      } else {
        console.warn("Failed to fetch employees data, using fallback");
        activeEmployees = todayReport
          ? parseInt(todayReport.total_employees_present) || 0
          : 0;
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      activeEmployees = todayReport
        ? parseInt(todayReport.total_employees_present) || 0
        : 0;
    }
    document.getElementById("active-employees").textContent = activeEmployees;

    let readyEquipment = 0;
    try {
      const equipmentResponse = await getAllEquipments();
      if (equipmentResponse.ok && equipmentResponse.data) {
        readyEquipment = equipmentResponse.data.filter(
          (eq) => eq.default_status === "ready"
        ).length;
      } else {
        console.warn("Failed to fetch equipment data, using fallback");
        readyEquipment = todayReport
          ? parseInt(todayReport.total_equipment_ready) || 0
          : 0;
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      readyEquipment = todayReport
        ? parseInt(todayReport.total_equipment_ready) || 0
        : 0;
    }
    document.getElementById("ready-equipment").textContent = readyEquipment;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let monthlyTotal = 0;

    reportsList.forEach((report) => {
      if (!report.date) return;

      const reportDate = new Date(report.date);
      if (
        reportDate.getMonth() + 1 === currentMonth &&
        reportDate.getFullYear() === currentYear
      ) {
        monthlyTotal += parseFloat(report.daily_tonnage) || 0;
      }
    });

    document.getElementById("monthly-total").textContent = `${formatNumber(
      monthlyTotal
    )} tons`;

    if (latestReport) {
      const latestTonnage = parseFloat(latestReport.daily_tonnage) || 0;
      const latestTarget = latestReport.target_tonnage
        ? parseFloat(latestReport.target_tonnage)
        : 0;
      const achievement = calculateAchievement(latestTonnage, latestTarget);

      document.getElementById("summary-tonnage").textContent = `${formatNumber(
        latestTonnage
      )} tons`;
      document.getElementById(
        "summary-achievement"
      ).textContent = `${achievement}%`;
      document.getElementById("summary-attendance").textContent = `${
        latestReport.total_employees_present || 0
      } employees`;
      document.getElementById("summary-equipment").textContent = `${
        latestReport.total_equipment_ready || 0
      } units`;
    } else {
      document.getElementById("summary-tonnage").textContent = "0 tons";
      document.getElementById("summary-achievement").textContent = "0%";
      document.getElementById("summary-attendance").textContent = "0 employees";
      document.getElementById("summary-equipment").textContent = "0 units";
    }
  } catch (error) {
    console.error("Error updating statistics:", error);
  }
}

function initializeChart() {
  const canvas = document.getElementById("productionChart");
  if (!canvas) return;

  if (productionChart) {
    productionChart.destroy();
  }

  const last7Days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(formatLocalDate(d));
  }

  const labels = last7Days.map((dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d)
      .toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
      })
      .replace(".", "");
  });

  const tonnageData = last7Days.map((date) => {
    const report = reportsList.find((r) => {
      if (!r.date) return false;

      if (/^\d{4}-\d{2}-\d{2}$/.test(r.date)) {
        return r.date === date;
      }

      return formatLocalDate(new Date(r.date)) === date;
    });

    return report ? Number(report.daily_tonnage) || 0 : 0;
  });

  if (!tonnageData.some((v) => v > 0)) {
    canvas.parentElement.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-bar-chart fs-1 text-muted"></i>
        <p class="mt-2 text-muted">
          No production data available for the last 7 days
        </p>
      </div>
    `;
    return;
  }

  productionChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Daily Tonnage (tons)",
          data: tonnageData,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.15)",
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: "#4caf50",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index",
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          backgroundColor: "rgba(0,0,0,0.8)",
          padding: 10,
          callbacks: {
            title(ctx) {
              const index = ctx[0].dataIndex;
              return `Date: ${formatDate(last7Days[index])}`;
            },
            label(ctx) {
              return `Tonnage: ${formatNumber(ctx.raw)} tons`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: "rgba(0,0,0,0.05)",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Tonnage (tons)",
          },
          ticks: {
            callback: (v) => formatNumber(v),
          },
        },
      },
    },
  });
}

function renderReportsTable(reports) {
  const tbody = document.getElementById("reports-table-body");
  if (!tbody) return;

  if (!reports || reports.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <i class="bi bi-clipboard-data fs-1 text-muted"></i>
          <p class="mt-2 text-muted">No daily reports found</p>
          <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addReportModal">
            Add First Report
          </button>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = reports
    .map((report) => {
      const achievement = calculateAchievement(
        report.daily_tonnage,
        report.target_tonnage
      );
      const achievementClass =
        achievement >= 100
          ? "bg-success"
          : achievement >= 80
          ? "bg-warning"
          : "bg-danger";

      return `
        <tr>
          <td>
            <div class="fw-bold">${formatDate(report.date)}</div>
            <small class="text-muted">${new Date(
              report.date
            ).toLocaleDateString("id-ID", { weekday: "long" })}</small>
          </td>
          <td>
            <span class="badge bg-primary">${report.period_code || "-"}</span>
          </td>
          <td>
            <div class="fw-bold">${formatNumber(
              report.daily_tonnage
            )} tons</div>
            <small class="text-muted">Target: ${formatNumber(
              report.target_tonnage || 0
            )} tons</small>
          </td>
          <td>
            <span class="badge bg-info">${
              report.total_employees_present || 0
            }</span>
          </td>
          <td>
            <span class="badge bg-warning">${
              report.total_equipment_ready || 0
            }</span>
          </td>
          <td>
            <span class="badge ${achievementClass}">
              ${achievement}%
            </span>
          </td>
          <td>
            ${
              report.notes
                ? `
              <div class="text-truncate" style="max-width: 200px;" 
                   title="${report.notes}">
                ${report.notes}
              </div>
            `
                : '<span class="text-muted">-</span>'
            }
          </td>
          <td class="text-end table-actions">
            <button class="btn btn-sm btn-outline-info me-1" onclick="viewReportDetails(${
              report.report_id
            })">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editReport(${
              report.report_id
            })">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${
              report.report_id
            })">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function fetchAttendanceCount(isEdit = false) {
  const dateField = isEdit
    ? document.getElementById("edit_report_date")
    : document.getElementById("report_date");

  if (!dateField.value) {
    showToast("warning", "Warning", "Please select a date first");
    return;
  }

  try {
    const summaryResponse = await getDailyReportSummary(dateField.value);
    if (summaryResponse.ok && summaryResponse.data) {
      const countField = isEdit
        ? document.getElementById("edit_total_employees_present")
        : document.getElementById("total_employees_present");

      countField.value = summaryResponse.data.attendance_count || 0;
      showToast(
        "success",
        "Success",
        `Attendance count updated: ${summaryResponse.data.attendance_count} employees present`
      );
    }
  } catch (error) {
    console.error("Error fetching attendance count:", error);
    showToast("danger", "Error", "Failed to fetch attendance count");
  }
}

async function fetchEquipmentCount(isEdit = false) {
  const dateField = isEdit
    ? document.getElementById("edit_report_date")
    : document.getElementById("report_date");

  if (!dateField.value) {
    showToast("warning", "Warning", "Please select a date first");
    return;
  }

  try {
    const equipmentResponse = await getAvailableEquipmentForDate(
      dateField.value
    );
    if (equipmentResponse.ok && equipmentResponse.data) {
      const countField = isEdit
        ? document.getElementById("edit_total_equipment_ready")
        : document.getElementById("total_equipment_ready");

      countField.value = equipmentResponse.data.length;
      showToast(
        "success",
        "Success",
        `Equipment count updated: ${equipmentResponse.data.length} units ready`
      );
    }
  } catch (error) {
    console.error("Error fetching equipment count:", error);
    showToast("danger", "Error", "Failed to fetch equipment count");
  }
}

async function autoGenerateReport() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const activePeriod = await checkActivePeriodForDate(today);

    if (!activePeriod) {
      showToast(
        "warning",
        "Cannot Generate Report",
        `No active period found for today (${formatDate(
          today
        )}). Please create a weekly period first.`
      );
      return;
    }

    if (
      !confirm(
        `Generate automatic daily report for:\nDate: ${formatDate(
          today
        )}\nPeriod: ${activePeriod.period_code}\nTarget: ${formatNumber(
          activePeriod.target_tonnage
        )} tons\n\nProceed?`
      )
    ) {
      return;
    }

    const result = await generateDailyReport(today);

    showToast("success", "Success", "Daily report generated successfully");

    await loadDailyReports();
  } catch (error) {
    console.error("Error generating report:", error);
    showToast(
      "danger",
      "Error",
      error.message || "Failed to generate daily report"
    );
  }
}

async function addReport() {
  const reportData = {
    date: document.getElementById("report_date").value,
    daily_tonnage: document.getElementById("daily_tonnage").value,
    total_employees_present:
      document.getElementById("total_employees_present").value || 0,
    total_equipment_ready:
      document.getElementById("total_equipment_ready").value || 0,
    notes: document.getElementById("notes").value,
  };

  if (!reportData.date || !reportData.daily_tonnage) {
    showToast("warning", "Validation", "Date and Daily Tonnage are required");
    return false;
  }

  try {
    const response = await createDailyReport(reportData);

    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addReportModal")
    );
    if (addModal) addModal.hide();
    document.getElementById("addReportForm").reset();

    showToast("success", "Success", "Daily report added successfully");

    loadDailyReports();
    return true;
  } catch (error) {
    console.error("Error adding report:", error);
    showToast("danger", "Error", error.message || "Failed to add daily report");
    return false;
  }
}

async function editReport(reportId) {
  try {
    const response = await getDailyReportDetail(reportId);
    if (!response.ok || !response.data) {
      showToast("warning", "Warning", "Daily report not found");
      return;
    }

    const report = response.data;

    document.getElementById("edit_report_id").value = report.report_id;
    document.getElementById("edit_report_date").value =
      report.date.split("T")[0];
    document.getElementById("edit_period_id").value = report.period_id;
    document.getElementById("edit_daily_tonnage").value = report.daily_tonnage;
    document.getElementById("edit_total_employees_present").value =
      report.total_employees_present;
    document.getElementById("edit_total_equipment_ready").value =
      report.total_equipment_ready;
    document.getElementById("edit_notes").value = report.notes || "";

    await updatePeriodAndEquipment(report.date.split("T")[0], true);

    const editModal = new bootstrap.Modal(
      document.getElementById("editReportModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading report for edit:", error);
    showToast("danger", "Error", "Failed to load report data");
  }
}

async function updateReport() {
  const reportId = document.getElementById("edit_report_id").value;
  const reportData = {
    date: document.getElementById("edit_report_date").value,
    daily_tonnage: document.getElementById("edit_daily_tonnage").value,
    total_employees_present:
      document.getElementById("edit_total_employees_present").value || 0,
    total_equipment_ready:
      document.getElementById("edit_total_equipment_ready").value || 0,
    notes: document.getElementById("edit_notes").value,
  };

  try {
    await updateDailyReport(reportId, reportData);

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editReportModal")
    );
    if (editModal) editModal.hide();

    showToast("success", "Success", "Daily report updated successfully");

    loadDailyReports();
    return true;
  } catch (error) {
    console.error("Error updating report:", error);
    showToast(
      "danger",
      "Error",
      error.message || "Failed to update daily report"
    );
    return false;
  }
}

async function deleteReport(reportId) {
  if (
    !confirm(
      "Are you sure you want to delete this daily report? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteDailyReport(reportId);

    showToast("success", "Success", "Daily report deleted successfully");

    loadDailyReports();
  } catch (error) {
    console.error("Error deleting report:", error);
    showToast(
      "danger",
      "Error",
      error.message || "Failed to delete daily report"
    );
  }
}

async function viewReportDetails(reportId) {
  try {
    const response = await getDailyReportDetail(reportId);
    if (!response.ok || !response.data) {
      showToast("warning", "Warning", "Daily report not found");
      return;
    }

    const report = response.data;
    const period = periodsList.find((p) => p.period_id === report.period_id);
    const achievement = calculateAchievement(
      report.daily_tonnage,
      period?.target_tonnage || 0
    );

    document.getElementById("detail-date").textContent = formatDate(
      report.date
    );
    document.getElementById("detail-period").textContent =
      report.period_code || "-";
    document.getElementById("detail-tonnage").textContent = `${formatNumber(
      report.daily_tonnage
    )} tons`;
    document.getElementById(
      "detail-achievement"
    ).textContent = `${achievement}%`;
    document.getElementById(
      "detail-employees"
    ).textContent = `${report.total_employees_present} employees`;
    document.getElementById(
      "detail-equipment"
    ).textContent = `${report.total_equipment_ready} units`;
    document.getElementById("detail-notes").textContent =
      report.notes || "No notes available.";

    const viewModal = new bootstrap.Modal(
      document.getElementById("viewDetailsModal")
    );
    viewModal.show();
  } catch (error) {
    console.error("Error loading report details:", error);
    showToast("danger", "Error", "Failed to load report details");
  }
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("auth_token");
    sessionStorage.clear();
    window.location.href = "../auth/login.html";
  }
}

function initializePage() {
  loadPeriods().then(() => {
    // Kemudian load reports
    loadDailyReports();

    // Update period untuk tanggal hari ini
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("report_date");
    const filterInput = document.getElementById("date-filter");

    if (dateInput) {
      dateInput.value = today;
      setTimeout(() => updatePeriodAndEquipment(today, false), 1000);
    }

    if (filterInput) filterInput.value = today;
  });

  setInterval(updateTime, 1000);
  updateTime();

  document
    .getElementById("btn-save-report")
    ?.addEventListener("click", addReport);
  document
    .getElementById("btn-update-report")
    ?.addEventListener("click", updateReport);
  document.getElementById("logout-btn")?.addEventListener("click", logout);
  document
    .getElementById("refresh-btn")
    ?.addEventListener("click", loadDailyReports);
  document
    .getElementById("auto-generate-btn")
    ?.addEventListener("click", autoGenerateReport);
  document
    .getElementById("update-summary-btn")
    ?.addEventListener("click", () => {
      updateStatistics();
      showToast("info", "Info", "Summary updated successfully");
    });

  document
    .getElementById("addReportForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      addReport();
    });

  document
    .getElementById("editReportForm")
    ?.addEventListener("submit", function (e) {
      e.preventDefault();
      updateReport();
    });

  document
    .getElementById("date-filter")
    ?.addEventListener("change", function () {
      const selectedDate = this.value;
      if (!selectedDate) {
        renderReportsTable(reportsList);
        return;
      }

      const filtered = reportsList.filter(
        (report) => report.date === selectedDate
      );
      renderReportsTable(filtered);
    });

  document
    .getElementById("addReportModal")
    ?.addEventListener("shown.bs.modal", function () {
      document.getElementById("report_date").focus();
    });

  document
    .getElementById("report_date")
    ?.addEventListener("change", function () {
      updatePeriodAndEquipment(this.value, false);
    });

  document
    .getElementById("edit_report_date")
    ?.addEventListener("change", function () {
      updatePeriodAndEquipment(this.value, true);
    });

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      const addModalBtn = document.querySelector(
        '[data-bs-target="#addReportModal"]'
      );
      if (addModalBtn) addModalBtn.click();
    }

    if (e.key === "F5") {
      e.preventDefault();
      loadDailyReports();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

window.editReport = editReport;
window.deleteReport = deleteReport;
window.viewReportDetails = viewReportDetails;
window.fetchAttendanceCount = fetchAttendanceCount;
window.fetchEquipmentCount = fetchEquipmentCount;
window.autoGenerateReport = autoGenerateReport;

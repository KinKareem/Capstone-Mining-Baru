import {
  getAllDailyReports,
  createDailyReport,
  updateDailyReport,
  deleteDailyReport,
  getDailyReportDetail,
  getDailyReportStats,
  getDailyReportSummary,
  generateDailyReport,
  getWeeklyPeriods,
  getAvailableEquipmentForDate,
  getActivePeriodForDate,
  getCurrentPeriodInfo,
  getAllEmployees,
  getAllEquipments,
} from "../../utils/api.js";

let reportsList = [];
let periodsList = [];
let productionChart = null;

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num || 0);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "-";
  }
}

// Format date range
function formatDateRange(dateString) {
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
    console.error("Error formatting date range:", dateString, error);
    return "-";
  }
}

// Kalkulasi persentase achievement
function calculateAchievement(actual, target) {
  if (!target || target === 0) return 0;
  return Math.round((actual / target) * 100);
}

// toast notification
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

// Update current time
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
    // Get active period for the date
    const activePeriod = await getActivePeriodForDate(date);
    
    if (activePeriod.ok && activePeriod.data) {
      const period = activePeriod.data;

      
      if (periodDisplay) {
        periodDisplay.innerHTML = `
          <div class="alert alert-info mb-0">
            <i class="bi bi-calendar-check me-2"></i>
            <strong>${period.period_code || "N/A"}</strong>
            <br>
            <small>Target: ${formatNumber(period.target_tonnage || 0)} tons</small>
          </div>
        `;
      }
      
      if (periodInput) {
        periodInput.value = period.period_id;
      }
    } else {
      if (periodDisplay) {
        periodDisplay.innerHTML = `
          <div class="alert alert-warning mb-0">
            <i class="bi bi-exclamation-triangle me-2"></i>
            No active period found for selected date. 
            Please check Weekly Periods or create a new period.
          </div>
        `;
      }
      if (periodInput) periodInput.value = '';
      
      // Set equipment count to 0 if no period
      if (equipmentCountInput) {
        equipmentCountInput.value = 0;
      }
      if (attendanceCountInput) {
        attendanceCountInput.value = 0;
      }
      return;
    }

    // Update equipment count
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
  }
}

// Load daily reports data
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

    // Load periods if not loaded
    if (periodsList.length === 0) {
      await loadPeriods();
    }

    // Update stats and summary
    await updateStatistics();

    // Render table
    renderReportsTable(reportsList);
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

// Load periods for dropdown
async function loadPeriods() {
  try {
    const response = await getWeeklyPeriods();
    if (response.ok && response.data) {
      periodsList = response.data;
      populatePeriodsDropdown();
    }
  } catch (error) {
    console.error("Error loading periods:", error);
  }
}

function populatePeriodsDropdown() {
  const addDropdown = document.getElementById("period_id");
  const editDropdown = document.getElementById("edit_period_id");

  if (addDropdown) {
    addDropdown.innerHTML = '<option value="">Select Period</option>';
    periodsList.forEach((period) => {
      const option = document.createElement("option");
      option.value = period.period_id;
      option.textContent = period.period_code;
      addDropdown.appendChild(option);
    });
  }

  if (editDropdown) {
    editDropdown.innerHTML = '<option value="">Select Period</option>';
    periodsList.forEach((period) => {
      const option = document.createElement("option");
      option.value = period.period_id;
      option.textContent = period.period_code;
      editDropdown.appendChild(option);
    });
  }
}

// Update statistics
async function updateStatistics() {
  try {
    // Get stats
    const statsResponse = await getDailyReportStats();
    if (statsResponse.ok && statsResponse.data) {
      const stats = statsResponse.data;

      // Get current period info
      const periodResponse = await getCurrentPeriodInfo();
      if (periodResponse.ok && periodResponse.data) {
        const periodInfo = periodResponse.data;
        
        // Update period info in stats card
        if (periodInfo.period) {
          const periodElement = document.getElementById("period-info");
          if (periodElement) {
            periodElement.innerHTML = `
              <small class="opacity-75">
                Period: ${periodInfo.period.period_code} | 
                Target: ${formatNumber(periodInfo.period.target_tonnage)} tons
              </small>
            `;
          }
        }
      } else {
        document.getElementById("today-tonnage").textContent = "0 tons";
        document.getElementById("active-employees").textContent = "0";
        document.getElementById("ready-equipment").textContent = "0";
        document.getElementById("tonnage-progress").style.width = "0%";
        document.getElementById("today-target").textContent = "0 tons";
      }

      document.getElementById("monthly-total").textContent = `${formatNumber(
        stats.monthly_tonnage
      )} tons`;
    }

    // Update summary
    await updateDailySummary();
  } catch (error) {
    console.error("Error updating statistics:", error);
  }
}

// Update daily summary
async function updateDailySummary() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const summaryResponse = await getDailyReportSummary(today);
    if (summaryResponse.ok && summaryResponse.data) {
      const summary = summaryResponse.data;

      // Find today's period
      const todayPeriod = periodsList.find((p) => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        const todayDate = new Date(today);
        return todayDate >= start && todayDate <= end;
      });

      if (todayPeriod) {
        const achievement = calculateAchievement(
          summary.total_tonnage,
          todayPeriod.target_tonnage
        );
        document.getElementById(
          "summary-tonnage"
        ).textContent = `${formatNumber(summary.total_tonnage)} tons`;
        document.getElementById(
          "summary-achievement"
        ).textContent = `${achievement}%`;
      }

      document.getElementById(
        "summary-attendance"
      ).textContent = `${summary.attendance_count} employees`;
      document.getElementById(
        "summary-equipment"
      ).textContent = `${summary.equipment_count} units`;
    }
  } catch (error) {
    console.error("Error updating daily summary:", error);
  }
}

// Render reports table
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
                        ).toLocaleDateString("id-ID")}</small>
                    </td>
                    <td>
                        <span class="badge bg-primary">${
                          report.period_code || "-"
                        }</span>
                    </td>
                    <td>
                        <div class="fw-bold">${formatNumber(
                          report.daily_tonnage
                        )} tons</div>
                        <small class="text-muted">Target: ${formatNumber(
                          report.target_tonnage
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

// Initialize production chart
function initializeChart() {
  const ctx = document.getElementById("productionChart");
  if (!ctx) return;

  // Destroy existing chart
  if (productionChart) {
    productionChart.destroy();
  }

  // Get last 7 days data
  const last7Days = [...Array(7)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    })
    .reverse();

  // Prepare data
  const labels = last7Days.map((date) => {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
  });

  const tonnageData = last7Days.map((date) => {
    const report = reportsList.find((r) => r.date === date);
    return report ? report.daily_tonnage : 0;
  });

  productionChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Daily Tonnage (tons)",
          data: tonnageData,
          borderColor: "#4caf50",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${formatNumber(
                context.raw
              )} tons`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return formatNumber(value);
            },
          },
        },
      },
    },
  });
}

// Fetch attendance count for selected date
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

// Fetch equipment count for selected date
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

// Auto-generate today's report
async function autoGenerateReport() {
  const today = new Date().toISOString().split("T")[0];

  if (!confirm(`Generate automatic daily report for today (${today})?`)) {
    return;
  }

  try {
    const result = await generateDailyReport(today);
    showToast("success", "Success", "Daily report generated successfully");
    loadDailyReports();
  } catch (error) {
    console.error("Error generating report:", error);
    showToast(
      "danger",
      "Error",
      error.message || "Failed to generate daily report"
    );
  }
}

// Add new report
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

  // Validation date
  if (!reportData.date || !reportData.daily_tonnage) {
    showToast("warning", "Validation", "Date and Daily Tonnage are required");
    return false;
  }

  try {
    const response = await createDailyReport(reportData);

    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addReportModal")
    );
    if (addModal) addModal.hide();
    document.getElementById("addReportForm").reset();

    showToast("success", "Success", "Daily report added successfully");

    // Reload data
    loadDailyReports();
    return true;
  } catch (error) {
    console.error("Error adding report:", error);
    showToast("danger", "Error", error.message || "Failed to add daily report");
    return false;
  }
}

// Edit report
async function editReport(reportId) {
  try {
    const response = await getDailyReportDetail(reportId);
    if (!response.ok || !response.data) {
      showToast("warning", "Warning", "Daily report not found");
      return;
    }

    const report = response.data;

    // Fill form with report data
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

    // Show modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editReportModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading report for edit:", error);
    showToast("danger", "Error", "Failed to load report data");
  }
}

// Update report
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

    // Close modal
    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editReportModal")
    );
    if (editModal) editModal.hide();

    showToast("success", "Success", "Daily report updated successfully");

    // Reload data
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

// Delete report
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

    // Reload data
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

// View report details
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

    // Fill details
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

    // Show modal
    const viewModal = new bootstrap.Modal(
      document.getElementById("viewDetailsModal")
    );
    viewModal.show();
  } catch (error) {
    console.error("Error loading report details:", error);
    showToast("danger", "Error", "Failed to load report details");
  }
}

// Export reports
function exportReports(format) {
  if (reportsList.length === 0) {
    showToast("warning", "Warning", "No reports to export");
    return;
  }

  if (format === "csv") {
    exportToCSV();
  } else {
    showToast("info", "Info", "PDF export feature coming soon!");
  }
}

function exportToCSV() {
  const headers = [
    "Date",
    "Period",
    "Tonnage",
    "Employees",
    "Equipment",
    "Achievement",
    "Notes",
  ];
  const rows = reportsList.map((report) => {
    const period = periodsList.find((p) => p.period_id === report.period_id);
    const achievement = calculateAchievement(
      report.daily_tonnage,
      period?.target_tonnage || 0
    );

    return [
      report.date,
      report.period_code,
      report.daily_tonnage,
      report.total_employees_present,
      report.total_equipment_ready,
      `${achievement}%`,
      report.notes || "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daily_reports_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();

  showToast("success", "Export", "CSV file downloaded");
}

function printReports() {
  window.print();
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("auth_token");
    sessionStorage.clear();
    window.location.href = "login.html";
  }
}

// Initialize the page
function initializePage() {
  loadDailyReports();

  setInterval(updateTime, 1000);
  updateTime();

  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("report_date");
  const filterInput = document.getElementById("date-filter");

  if (dateInput) {
    dateInput.value = today;
    setTimeout(() => updatePeriodAndEquipment(today, false), 500);
  }

  if (filterInput) filterInput.value = today;

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
    ?.addEventListener("click", updateDailySummary);

  // Form submit handlers
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

  // Date filter change
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

  // Modal show events
  document
    .getElementById("addReportModal")
    ?.addEventListener("shown.bs.modal", function () {
      document.getElementById("report_date").focus();
    });

  // Add event listener untuk perubahan tanggal di form add
  document
    .getElementById("report_date")
    ?.addEventListener("change", function () {
      updatePeriodAndEquipment(this.value, false);
    });

  // Add event listener untuk perubahan tanggal di form edit
  document
    .getElementById("edit_report_date")
    ?.addEventListener("change", function () {
      updatePeriodAndEquipment(this.value, true);
    });

  // Initialize chart after data loads
  setTimeout(initializeChart, 1000);

  // Keyboard shortcuts
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

document.getElementById("report_date")?.addEventListener("change", function () {
  updatePeriodAndEquipment(this.value, false);
});

document
  .getElementById("edit_report_date")
  ?.addEventListener("change", function () {
    updatePeriodAndEquipment(this.value, true);
  });

// Initialize when DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}


// Make functions available globally
window.editReport = editReport;
window.deleteReport = deleteReport;
window.viewReportDetails = viewReportDetails;
window.fetchAttendanceCount = fetchAttendanceCount;
window.fetchEquipmentCount = fetchEquipmentCount;
window.exportReports = exportReports;
window.printReports = printReports;

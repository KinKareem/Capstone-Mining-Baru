import { getDailyAttendance, updateAttendance } from "../../utils/api.js";

let attendanceData = [];
let currentDate = null;

// Initialize date pickers
function initializeDatePickers() {
  const dateSelector = document.getElementById("date-selector");
  if (dateSelector) {
    const today = new Date().toISOString().split("T")[0];
    dateSelector.value = today;
    currentDate = today;

    dateSelector.addEventListener("change", function () {
      currentDate = this.value;
      loadDailyAttendance();
    });
  }
}

// toast notification
function showToast(type, title, message) {
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

  toast._element.addEventListener("hidden.bs.toast", function () {
    this.remove();
  });
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

// Get status badge class
function getStatusBadgeClass(status) {
  switch (status) {
    case "present":
      return "badge bg-success";
    case "sick":
      return "badge bg-warning";
    case "permission":
      return "badge bg-info";
    case "absent":
      return "badge bg-danger";
    case "leave":
      return "badge bg-secondary";
    default:
      return "badge bg-secondary";
  }
}

// Get status display text
function getStatusText(status) {
  switch (status) {
    case "present":
      return "Hadir";
    case "sick":
      return "Sakit";
    case "permission":
      return "Izin";
    case "absent":
      return "Absen";
    case "leave":
      return "Cuti";
    default:
      return status;
  }
}

// Escape HTML untuk mencegah XSS
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Load daily attendance
async function loadDailyAttendance() {
  if (!currentDate) {
    const today = new Date().toISOString().split("T")[0];
    currentDate = today;
    document.getElementById("date-selector").value = today;
  }

  try {
    showLoading(true);

    const response = await getDailyAttendance(currentDate);

    // Jika response berisi error
    if (response.message && response.message.includes("Error")) {
      throw new Error(response.message);
    }

    const data = response.data;
    attendanceData = data.attendance || [];

    updateAttendanceStats(data);
    renderAttendanceTable();

    showLoading(false);
  } catch (error) {
    console.error("Error loading daily attendance:", error);
    showToast(
      "danger",
      "Error",
      error.message || "Failed to load attendance data"
    );
    showLoading(false, true);
  }
}

// Show loading state
function showLoading(isLoading, isError = false) {
  const tbody = document.getElementById("recorded-attendance-body");

  if (!tbody) return;

  if (isLoading) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading attendance data...</p>
        </td>
      </tr>
    `;
  } else if (isError) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5">
          <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
          <p class="mt-2 text-danger">Failed to load data</p>
          <button class="btn btn-sm btn-primary mt-2" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
          </button>
        </td>
      </tr>
    `;
  }
}

// Update attendance statistics
function updateAttendanceStats(data) {
  const summary = data.summary || [];
  const totalScheduled = data.total_scheduled || 0;

  let presentCount = 0;
  let totalCount = 0;

  summary.forEach((item) => {
    totalCount += item.count || 0;
    if (item.attendance_status === "present") {
      presentCount = item.count || 0;
    }
  });

  // Update UI elements
  const totalEmployeesEl = document.getElementById("total-employees");
  const presentCountEl = document.getElementById("present-count");
  const scheduledCountEl = document.getElementById("scheduled-count");
  const attendanceRateEl = document.getElementById("attendance-rate");

  if (totalEmployeesEl) totalEmployeesEl.textContent = totalScheduled;
  if (presentCountEl) presentCountEl.textContent = presentCount;
  if (scheduledCountEl) scheduledCountEl.textContent = totalScheduled;

  // Calculate attendance rate
  const attendanceRate =
    totalScheduled > 0 ? Math.round((presentCount / totalScheduled) * 100) : 0;
  if (attendanceRateEl) attendanceRateEl.textContent = `${attendanceRate}%`;
}

// Render attendance table
function renderAttendanceTable() {
  const tbody = document.getElementById("recorded-attendance-body");
  if (!tbody) return;

  if (attendanceData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-people text-muted fs-1"></i>
          <p class="mt-2 text-muted">No scheduled employees for this date</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = attendanceData
    .map((item) => {
      const statusClass = getStatusBadgeClass(item.attendance_status);
      const statusText = getStatusText(item.attendance_status);
      const isEdited = item.is_edited || item.attendance_id !== null;

      // Escape semua teks untuk mencegah XSS
      const name = escapeHtml(item.name || "Unknown");
      const position = escapeHtml(item.position || "-");
      const remarks = escapeHtml(item.remarks || item.schedule_notes || "-");
      const shiftName = escapeHtml(item.shift_name || "");
      const locationName = escapeHtml(item.location_name || "");
      const equipmentCode = escapeHtml(item.equipment_code || "");

      return `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <div class="me-3">
              <i class="bi bi-person-circle fs-4 text-primary"></i>
            </div>
            <div>
              <strong class="d-block">${name}</strong>
              <small class="text-muted">${position}</small>
            </div>
          </div>
        </td>
        <td>${position}</td>
        <td>
          <span class="badge bg-primary">Scheduled</span>
        </td>
        <td>
          <span class="${statusClass}">${statusText}</span>
          ${
            isEdited
              ? '<span class="badge bg-light text-dark border ms-1">Edited</span>'
              : ""
          }
        </td>
        <td>
          <div class="small text-muted">${remarks}</div>
        </td>
        <td>
          <div class="small">
            ${
              shiftName
                ? `<div><i class="bi bi-clock me-1"></i> ${shiftName}</div>`
                : ""
            }
            ${
              locationName
                ? `<div><i class="bi bi-geo-alt me-1"></i> ${locationName}</div>`
                : ""
            }
            ${
              equipmentCode
                ? `<div><i class="bi bi-truck me-1"></i> ${equipmentCode}</div>`
                : ""
            }
          </div>
        </td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary edit-btn" 
                  data-employee-id="${item.employee_id}"
                  data-status="${item.attendance_status}"
                  data-remarks="${escapeHtml(item.remarks || "")}"
                  data-name="${name}">
            <i class="bi bi-pencil"></i> Edit
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  // Add event listeners to edit buttons
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const employeeId = this.getAttribute("data-employee-id");
      const currentStatus = this.getAttribute("data-status");
      const currentRemarks = this.getAttribute("data-remarks");
      const employeeName = this.getAttribute("data-name");

      openEditModal(employeeId, currentStatus, currentRemarks, employeeName);
    });
  });
}

// Open edit modal
function openEditModal(
  employeeId,
  currentStatus,
  currentRemarks,
  employeeName
) {
  const modal = new bootstrap.Modal(document.getElementById("quickEditModal"));

  // Set form values
  document.getElementById("edit_employee_id").value = employeeId;
  document.getElementById("edit_employee_name").value = `${employeeName}`;
  document.getElementById("edit_attendance_status").value = currentStatus;
  document.getElementById("edit_remarks").value = currentRemarks || "";

  modal.show();
}

// Save quick edit
async function saveQuickEdit() {
  const employeeId = document.getElementById("edit_employee_id").value;
  const status = document.getElementById("edit_attendance_status").value;
  const remarks = document.getElementById("edit_remarks").value;

  if (!employeeId || !status) {
    showToast("warning", "Warning", "Please select attendance status");
    return;
  }

  const attendanceData = {
    attendance_status: status,
    remarks: remarks || null,
  };

  try {
    console.log("Sending update:", {
      date: currentDate,
      employeeId,
      attendanceData,
    });

    const result = await updateAttendance(
      currentDate,
      employeeId,
      attendanceData
    );

    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("quickEditModal")
    );
    if (modal) modal.hide();

    showToast(
      "success",
      "Success",
      result.message || "Attendance updated successfully"
    );

    // Reload data
    setTimeout(() => {
      loadDailyAttendance();
    }, 500);
  } catch (error) {
    console.error("Error saving quick edit:", error);
    showToast(
      "danger",
      "Error",
      error.message ||
        "Failed to update attendance. Please check console for details."
    );
  }
}

// Refresh data
function refreshData() {
  loadDailyAttendance();
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("auth_token");
    sessionStorage.clear();
    window.location.href = "../auth/login.html";
  }
}

// Initialize the page
function initializePage() {
  // Initialize date picker
  initializeDatePickers();

  // Set current date if not set
  if (!currentDate) {
    const today = new Date().toISOString().split("T")[0];
    currentDate = today;
  }

  // Load initial data
  loadDailyAttendance();

  // Update time every second
  setInterval(updateTime, 1000);
  updateTime();

  // Event listeners
  document
    .getElementById("refresh-btn")
    ?.addEventListener("click", refreshData);
  document
    .getElementById("btn-save-quick-edit")
    ?.addEventListener("click", saveQuickEdit);
  document.getElementById("logout-btn")?.addEventListener("click", logout);

  // Auto-refresh every 30 seconds (optional)
  setInterval(() => {
    if (currentDate) loadDailyAttendance();
  }, 30000);
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

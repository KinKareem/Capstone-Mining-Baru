// Import functions from utils/api.js
import {
  getWeeklySchedules,
  createWeeklySchedule,
  updateWeeklySchedule,
  deleteWeeklySchedule,
  getWeeklyScheduleDetail,
  getWeeklyScheduleDropdowns,
} from "../../utils/api.js";

let scheduleList = [];
let dropdownData = {};

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format time
function formatTime(timeString) {
  if (!timeString) return "";
  return timeString.substring(0, 5);
}

// Show toast notification
function showToast(type, title, message) {
  // Remove existing toasts
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

// Load schedule data
async function loadScheduleData() {
  try {
    const tbody = document.getElementById("schedule-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading schedule data...</p>
                    </td>
                </tr>
            `;
    }

    const response = await getWeeklySchedules();
    if (!response.ok) {
      throw new Error(response.message || "Failed to load schedules");
    }

    scheduleList = response.data || [];
    updateStats(scheduleList);
    renderScheduleTable(scheduleList);
  } catch (error) {
    console.error("Error loading schedule:", error);
    showToast("danger", "Error", "Failed to load schedule data");

    const tbody = document.getElementById("schedule-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-5">
                        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                        <p class="mt-2 text-danger">Failed to load data</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="loadScheduleData()">
                            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                        </button>
                    </td>
                </tr>
            `;
    }
  }
}

// Load dropdown data
async function loadDropdownData() {
  try {
    const response = await getWeeklyScheduleDropdowns();
    if (!response.ok) {
      throw new Error(response.message || "Failed to load dropdown data");
    }

    dropdownData = response.data || {};

    populateDropdown(
      "period_id",
      dropdownData.periods,
      "period_id",
      "period_code"
    );
    populateDropdown(
      "employee_id",
      dropdownData.employees,
      "employee_id",
      "name"
    );
    populateDropdown(
      "equipment_id",
      dropdownData.equipment,
      "equipment_id",
      "unit_code"
    );
    populateDropdown("shift_id", dropdownData.shifts, "shift_id", "shift_name");
    populateDropdown(
      "location_id",
      dropdownData.locations,
      "location_id",
      "location_name"
    );
  } catch (error) {
    console.error("Error loading dropdowns:", error);
    showToast("warning", "Warning", "Could not load dropdown data");
  }
}

function populateDropdown(elementId, data, valueField, textField) {
  const element = document.getElementById(elementId);
  if (!element || !data) return;

  // Clear existing options except first
  const firstOption = element.options[0];
  element.innerHTML = "";
  if (firstOption) element.appendChild(firstOption);

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueField];
    option.textContent = item[textField];
    element.appendChild(option);
  });
}

// Update statistics
function updateStats(schedules) {
  if (!schedules || schedules.length === 0) {
    document.getElementById("total-schedules").textContent = "0";
    document.getElementById("this-week-count").textContent = "0";
    document.getElementById("active-employees").textContent = "0";
    document.getElementById("equipment-assigned").textContent = "0";
    return;
  }

  // Total schedules
  document.getElementById("total-schedules").textContent = schedules.length;

  // Count schedules for this week
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() + 6));
  const thisWeekCount = schedules.filter((s) => {
    const scheduleDate = new Date(s.date);
    return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
  }).length;
  document.getElementById("this-week-count").textContent = thisWeekCount;

  // Count unique employees
  const uniqueEmployees = [
    ...new Set(schedules.map((s) => s.employee_name).filter(Boolean)),
  ];
  document.getElementById("active-employees").textContent =
    uniqueEmployees.length;

  // Count unique equipment
  const uniqueEquipment = [
    ...new Set(schedules.map((s) => s.unit_code).filter(Boolean)),
  ];
  document.getElementById("equipment-assigned").textContent =
    uniqueEquipment.length;
}

// Render schedule table
function renderScheduleTable(schedules) {
  const tbody = document.getElementById("schedule-table-body");
  if (!tbody) return;

  if (!schedules || schedules.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="bi bi-calendar-week fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">No schedule found</p>
                    <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addScheduleModal">
                        Add First Schedule
                    </button>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = schedules
    .map(
      (schedule) => `
            <tr>
                <td>
                    <div class="fw-bold">${formatDate(schedule.date)}</div>
                    <small class="text-muted">${new Date(
                      schedule.date
                    ).toLocaleDateString("id-ID")}</small>
                </td>
                <td>
                    <span class="badge bg-primary">${
                      schedule.period_code || "-"
                    }</span>
                </td>
                <td>
                    <div class="fw-bold">${schedule.employee_name || "-"}</div>
                    <small class="text-muted">${schedule.position || ""}</small>
                </td>
                <td>
                    <div class="fw-bold">${schedule.unit_code || "-"}</div>
                    <small class="text-muted">${
                      schedule.equipment_type || ""
                    }</small>
                </td>
                <td>
                    <span class="badge badge-shift">
                        ${schedule.shift_name || "-"}
                    </span>
                    ${
                      schedule.shift_start
                        ? `
                        <div class="small">
                            ${formatTime(schedule.shift_start)} - ${formatTime(
                            schedule.shift_end
                          )}
                        </div>
                    `
                        : ""
                    }
                </td>
                <td>
                    <span class="badge badge-location">
                        ${schedule.location_name || "-"}
                    </span>
                    <div class="small text-muted">${
                      schedule.location_type || ""
                    }</div>
                </td>
                <td>
                    ${
                      schedule.notes
                        ? `
                        <div class="text-truncate" style="max-width: 200px;" 
                             title="${schedule.notes}">
                            ${schedule.notes}
                        </div>
                    `
                        : '<span class="text-muted">-</span>'
                    }
                </td>
                <td class="text-end table-actions">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editSchedule(${
                      schedule.schedule_id
                    })">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSchedule(${
                      schedule.schedule_id
                    })">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `
    )
    .join("");
}

// Add new schedule
async function addSchedule() {
  const scheduleData = {
    period_id: document.getElementById("period_id").value,
    date: document.getElementById("date").value,
    employee_id: document.getElementById("employee_id").value,
    equipment_id: document.getElementById("equipment_id").value,
    shift_id: document.getElementById("shift_id").value,
    location_id: document.getElementById("location_id").value,
    notes: document.getElementById("notes").value,
  };

  // Validation
  const requiredFields = [
    "period_id",
    "date",
    "employee_id",
    "equipment_id",
    "shift_id",
    "location_id",
  ];
  const missingFields = requiredFields.filter((field) => !scheduleData[field]);

  if (missingFields.length > 0) {
    showToast("warning", "Validation", "Please fill all required fields");
    return false;
  }

  try {
    await createWeeklySchedule(scheduleData);

    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addScheduleModal")
    );
    if (addModal) {
      addModal.hide();
    }
    document.getElementById("addScheduleForm").reset();

    showToast("success", "Success", "Schedule added successfully");

    // Reload data
    loadScheduleData();
    return true;
  } catch (error) {
    console.error("Error adding schedule:", error);
    showToast("danger", "Error", error.message || "Failed to add schedule");
    return false;
  }
}

// Edit schedule
async function editSchedule(scheduleId) {
  try {
    const response = await getWeeklyScheduleDetail(scheduleId);
    if (!response.ok || !response.data) {
      showToast("warning", "Warning", "Schedule not found");
      return;
    }

    const schedule = response.data;

    // Fill form with schedule data
    document.getElementById("edit_schedule_id").value = schedule.schedule_id;
    document.getElementById("edit_period_id").value = schedule.period_id;
    document.getElementById("edit_date").value = schedule.date.split("T")[0];
    document.getElementById("edit_employee_id").value = schedule.employee_id;
    document.getElementById("edit_equipment_id").value = schedule.equipment_id;
    document.getElementById("edit_shift_id").value = schedule.shift_id;
    document.getElementById("edit_location_id").value = schedule.location_id;
    document.getElementById("edit_notes").value = schedule.notes || "";

    // Populate edit dropdowns
    populateDropdown(
      "edit_period_id",
      dropdownData.periods,
      "period_id",
      "period_code"
    );
    populateDropdown(
      "edit_employee_id",
      dropdownData.employees,
      "employee_id",
      "name"
    );
    populateDropdown(
      "edit_equipment_id",
      dropdownData.equipment,
      "equipment_id",
      "unit_code"
    );
    populateDropdown(
      "edit_shift_id",
      dropdownData.shifts,
      "shift_id",
      "shift_name"
    );
    populateDropdown(
      "edit_location_id",
      dropdownData.locations,
      "location_id",
      "location_name"
    );

    // Set selected values
    document.getElementById("edit_period_id").value = schedule.period_id;
    document.getElementById("edit_employee_id").value = schedule.employee_id;
    document.getElementById("edit_equipment_id").value = schedule.equipment_id;
    document.getElementById("edit_shift_id").value = schedule.shift_id;
    document.getElementById("edit_location_id").value = schedule.location_id;

    // Show modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editScheduleModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading schedule for edit:", error);
    showToast("danger", "Error", "Failed to load schedule data");
  }
}

// Update schedule
async function updateSchedule() {
  const scheduleId = document.getElementById("edit_schedule_id").value;
  const scheduleData = {
    period_id: document.getElementById("edit_period_id").value,
    date: document.getElementById("edit_date").value,
    employee_id: document.getElementById("edit_employee_id").value,
    equipment_id: document.getElementById("edit_equipment_id").value,
    shift_id: document.getElementById("edit_shift_id").value,
    location_id: document.getElementById("edit_location_id").value,
    notes: document.getElementById("edit_notes").value,
  };

  try {
    await updateWeeklySchedule(scheduleId, scheduleData);

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editScheduleModal")
    );
    if (editModal) {
      editModal.hide();
    }

    showToast("success", "Success", "Schedule updated successfully");

    loadScheduleData();
    return true;
  } catch (error) {
    console.error("Error updating schedule:", error);
    showToast("danger", "Error", error.message || "Failed to update schedule");
    return false;
  }
}

// Delete schedule
async function deleteSchedule(scheduleId) {
  if (
    !confirm(
      "Are you sure you want to delete this schedule? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    await deleteWeeklySchedule(scheduleId);

    showToast("success", "Success", "Schedule deleted successfully");

    // Reload data
    loadScheduleData();
  } catch (error) {
    console.error("Error deleting schedule:", error);
    showToast("danger", "Error", error.message || "Failed to delete schedule");
  }
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    // Clear any stored tokens/sessions
    localStorage.removeItem("auth_token");
    sessionStorage.clear();

    window.location.href = "login.html";
  }
}

// Initialize the page
function initializePage() {
  loadScheduleData();

  loadDropdownData();

  setInterval(updateTime, 1000);
  updateTime();

  const saveScheduleBtn = document.getElementById("btn-save-schedule");
  if (saveScheduleBtn) {
    saveScheduleBtn.addEventListener("click", addSchedule);
  }

  const updateScheduleBtn = document.getElementById("btn-update-schedule");
  if (updateScheduleBtn) {
    updateScheduleBtn.addEventListener("click", updateSchedule);
  }

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadScheduleData);
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Add form submit handlers
  const addScheduleForm = document.getElementById("addScheduleForm");
  if (addScheduleForm) {
    addScheduleForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addSchedule();
    });
  }

  const editScheduleForm = document.getElementById("editScheduleForm");
  if (editScheduleForm) {
    editScheduleForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateSchedule();
    });
  }

  // Set default date to today
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }

  // Handle modal show events
  const addModal = document.getElementById("addScheduleModal");
  if (addModal) {
    addModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("period_id").focus();
    });
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl + N to add new schedule
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      const addModalBtn = document.querySelector(
        '[data-bs-target="#addScheduleModal"]'
      );
      if (addModalBtn) {
        addModalBtn.click();
      }
    }

    // F5 to refresh
    if (e.key === "F5") {
      e.preventDefault();
      loadScheduleData();
    }
  });
}

// Initialize when DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;

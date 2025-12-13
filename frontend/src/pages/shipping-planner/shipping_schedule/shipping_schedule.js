import {
  getShippingSchedules,
  getShippingScheduleStats,
  createShippingSchedule,
  updateShippingSchedule,
  deleteShippingSchedule,
} from "../../utils/api.js";

let currentEditingId = null;
let schedulesData = [];

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
  loadSchedules();
  setupEventListeners();

  setupModal();
});

function initializePage() {
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
}

function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString("id-ID", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  document.getElementById("current-time").textContent = timeString;
}

function setupModal() {
  const addModal = document.getElementById("addScheduleModal");
  if (addModal) {
    addModal.addEventListener("hidden.bs.modal", function () {
      resetModal();
    });
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("accessToken");
        window.location.href = "../../login/login.html";
      }
    });
  }

  const saveBtn = document.getElementById("btn-save-schedule");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveSchedule);
  }
}

async function loadSchedules() {
  showLoading(true);

  try {
    const schedulesResponse = await getShippingSchedules();

    if (schedulesResponse.success) {
      schedulesData = schedulesResponse.data;
      renderSchedulesTable(schedulesData);
    } else {
      showMessage(
        "Failed to load schedules: " + schedulesResponse.message,
        "danger"
      );
    }

    const statsResponse = await getShippingScheduleStats();
    if (statsResponse.success) {
      updateStatsCards(statsResponse.data);
    }
  } catch (error) {
    console.error("Error loading schedules:", error);
    showMessage(
      "Error loading shipping schedules. Please try again.",
      "danger"
    );
  } finally {
    showLoading(false);
  }
}

function updateStatsCards(stats) {
  const totalVessels = document.getElementById("total-vessels");
  const monthlyVessels = document.getElementById("monthly-vessels");
  const totalLoad = document.getElementById("total-load");
  const upcomingVessels = document.getElementById("upcoming-vessels");

  if (totalVessels) totalVessels.textContent = stats.total_vessels || 0;
  if (monthlyVessels) monthlyVessels.textContent = stats.monthly_vessels || 0;
  if (totalLoad)
    totalLoad.textContent = (stats.total_load || 0).toLocaleString() + " tons";
  if (upcomingVessels)
    upcomingVessels.textContent = stats.upcoming_vessels || 0;
}

function renderSchedulesTable(schedules) {
  const tbody = document.getElementById("schedule-table-body");
  if (!tbody) return;

  if (schedules.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                    No shipping schedules found
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = schedules
    .map(
      (schedule) => `
        <tr>
            <td class="align-middle">
                <strong>${schedule.vessel_id}</strong>
            </td>
            <td class="align-middle">
                <i class="bi bi-ship me-1"></i> ${schedule.vessel_name}
            </td>
            <td class="align-middle">
                <span class="badge bg-primary">${formatDate(
                  schedule.eta_date
                )}</span>
            </td>
            <td class="align-middle">
                <span class="badge bg-warning">${formatDate(
                  schedule.latest_berthing
                )}</span>
            </td>
            <td class="align-middle">
                <span class="badge bg-success">${parseFloat(
                  schedule.target_load_tons
                ).toLocaleString()} tons</span>
            </td>
            <td class="align-middle">
                ${
                  schedule.shipping_notes
                    ? schedule.shipping_notes.substring(0, 50) + "..."
                    : "-"
                }
            </td>
            <td class="align-middle">
                <small class="text-muted">${formatDateTime(
                  schedule.updated_at
                )}</small>
            </td>
            <td class="text-end align-middle">
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary me-1" onclick="editSchedule('${
                    schedule.vessel_id
                    }')">
                        <i class="bi bi-pencil"></i> Edit
                    </button>

                    <button class="btn btn-outline-danger" onclick="deleteSchedule('${
                    schedule.vessel_id
                    }')">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "-";
  const date = new Date(dateTimeString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showLoading(show) {
  const tbody = document.getElementById("schedule-table-body");
  if (!tbody) return;

  if (show) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading shipping schedules...</p>
                </td>
            </tr>
        `;
  }
}

function showMessage(message, type) {
  const existingAlerts = document.querySelectorAll(".alert");
  existingAlerts.forEach((alert) => alert.remove());

  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
  }

  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}

window.editSchedule = function (vessel_id) {
  const schedule = schedulesData.find((s) => s.vessel_id === vessel_id);
  if (!schedule) {
    showMessage("Schedule not found", "danger");
    return;
  }

  currentEditingId = vessel_id;

  document.getElementById("vessel_id").value = schedule.vessel_id;
  document.getElementById("vessel_name").value = schedule.vessel_name;
  document.getElementById("eta_date").value = schedule.eta_date;
  document.getElementById("latest_berthing").value = schedule.latest_berthing;
  document.getElementById("target_load_tons").value = schedule.target_load_tons;
  document.getElementById("shipping_notes").value =
    schedule.shipping_notes || "";

  const modalTitle = document.querySelector("#addScheduleModal .modal-title");
  if (modalTitle) {
    modalTitle.innerHTML =
      '<i class="bi bi-pencil-square me-2"></i> Edit Shipping Schedule';
  }

  document.getElementById("vessel_id").readOnly = true;

  const modal = new bootstrap.Modal(
    document.getElementById("addScheduleModal")
  );
  modal.show();
};

window.deleteSchedule = async function (vessel_id) {
  if (
    !confirm(
      "Are you sure you want to delete this shipping schedule? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const result = await deleteShippingSchedule(vessel_id);
    if (result.ok) {
      showMessage("Shipping schedule deleted successfully", "success");
      loadSchedules();
    } else {
      showMessage("Failed to delete schedule", "danger");
    }
  } catch (error) {
    console.error("Error deleting schedule:", error);
    showMessage("Error deleting schedule: " + error.message, "danger");
  }
};

async function saveSchedule() {
  const form = document.getElementById("scheduleForm");
  if (!form) {
    showMessage("Form not found", "danger");
    return;
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const scheduleData = {
    vessel_id: document.getElementById("vessel_id").value.trim(),
    vessel_name: document.getElementById("vessel_name").value.trim(),
    eta_date: document.getElementById("eta_date").value,
    latest_berthing: document.getElementById("latest_berthing").value,
    target_load_tons:
      parseInt(document.getElementById("target_load_tons").value) || 0,
    shipping_notes: document.getElementById("shipping_notes").value.trim(),
  };

  if (
    !scheduleData.vessel_id ||
    !scheduleData.vessel_name ||
    !scheduleData.eta_date ||
    !scheduleData.latest_berthing
  ) {
    showMessage("Please fill all required fields", "warning");
    return;
  }

  try {
    let result;
    if (currentEditingId) {
      const { vessel_id, ...updateData } = scheduleData;
      result = await updateShippingSchedule(currentEditingId, updateData);
    } else {
      result = await createShippingSchedule(scheduleData);
    }

    if (result.success) {
      showMessage(result.message, "success");

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addScheduleModal")
      );
      if (modal) {
        modal.hide();
      }

      loadSchedules();
    } else {
      showMessage("Failed to save schedule: " + result.message, "danger");
    }
  } catch (error) {
    console.error("Error saving schedule:", error);
    showMessage("Error saving schedule: " + error.message, "danger");
  }
}

function resetModal() {
  const form = document.getElementById("scheduleForm");
  if (form) {
    form.reset();
  }
  currentEditingId = null;

  const vesselIdField = document.getElementById("vessel_id");
  if (vesselIdField) {
    vesselIdField.readOnly = false;
  }

  const modalTitle = document.querySelector("#addScheduleModal .modal-title");
  if (modalTitle) {
    modalTitle.innerHTML =
      '<i class="bi bi-calendar-plus me-2"></i> Add Shipping Schedule';
  }
}

window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;

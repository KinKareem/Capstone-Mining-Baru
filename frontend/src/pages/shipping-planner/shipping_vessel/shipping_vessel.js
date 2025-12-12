import {
  getShippingVessels,
  getShippingVesselStats,
  getShippingVesselDetail,
  getVesselLoadingDetails,
  getVesselStockpileAllocation,
  createShippingVessel,
  updateShippingVessel,
  deleteShippingVessel,
} from "../../utils/api.js";

let currentEditingId = null;
let vesselsData = [];
let portsData = [];
let progressChart = null;
let statusChart = null;

document.addEventListener("DOMContentLoaded", function () {
  initializePage();
  loadVessels();
  setupEventListeners();
  initializeCharts();
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

function setupEventListeners() {
  document.getElementById("logout-btn").addEventListener("click", function () {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("accessToken");
      window.location.href = "../../login/login.html";
    }
  });

  document
    .getElementById("btn-save-vessel")
    .addEventListener("click", saveVessel);

  document
    .getElementById("search-vessel")
    .addEventListener("input", function (e) {
      filterVessels();
    });

  document
    .getElementById("filter-status")
    .addEventListener("change", function () {
      filterVessels();
    });

  const modal = document.getElementById("addVesselModal");
  if (modal) {
    modal.addEventListener("hidden.bs.modal", resetModal);
  }
}

async function loadVessels() {
  showLoading(true);

  try {
    const vesselsResponse = await getShippingVessels();

    if (vesselsResponse.success) {
      vesselsData = vesselsResponse.data;
      renderVesselsTable(vesselsData);
      updateCharts(vesselsData);

      extractPortsForFilter(vesselsData);
    } else {
      showMessage(
        "Failed to load vessels: " + vesselsResponse.message,
        "danger"
      );
    }

    const statsResponse = await getShippingVesselStats();
    if (statsResponse.success) {
      updateStatsCards(statsResponse.data);
    }
  } catch (error) {
    console.error("Error loading vessels:", error);
    showMessage("Error loading shipping vessels. Please try again.", "danger");
  } finally {
    showLoading(false);
  }
}

function updateStatsCards(stats) {
  document.getElementById("total-vessels").textContent =
    stats.total_vessels || 0;
  document.getElementById("active-vessels").textContent =
    (stats.waiting_vessels || 0) + (stats.loading_vessels || 0);
  document.getElementById("total-capacity").textContent = (
    stats.total_capacity || 0
  ).toLocaleString();
  document.getElementById("avg-loading-time").textContent =
    stats.avg_loading_hours || "0";
}

function renderVesselsTable(vessels) {
  const tbody = document.getElementById("vessel-table-body");

  if (vessels.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-5">
                    <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
                    No vessels found matching your criteria
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = vessels
    .map((vessel) => {
      const iconColor = getStatusColor(vessel.loading_status);

      const ports = vessel.stockpile_names
        ? vessel.stockpile_names
            .split(",")
            .map((p) => p.trim())
            .join(", ")
        : "Not allocated";

      const progress = vessel.progress_percentage || 0;
      const loadedTons = vessel.loaded_tons || 0;

      return `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <strong>${vessel.vessel_name}</strong>
                        <div class="text-muted small">${
                          vessel.shipping_notes
                            ? vessel.shipping_notes.substring(0, 30) + "..."
                            : "No notes"
                        }</div>
                    </div>
                </div>
            </td>
            <td class="align-middle">
                <span class="badge bg-dark">${vessel.vessel_code}</span>
            </td>
            <td class="align-middle">
                <div>
                    <strong>${parseFloat(
                      vessel.target_load_tons
                    ).toLocaleString()}</strong>
                    <div class="progress mt-1" style="height: 6px;">
                        <div class="progress-bar ${getProgressBarColor(
                          progress
                        )}" 
                             style="width: ${Math.min(progress, 100)}%">
                            <span class="visually-hidden">${progress}% loaded</span>
                        </div>
                    </div>
                    <small class="text-muted">${progress}% loaded</small>
                </div>
            </td>
            <td class="align-middle">
                <span class="badge bg-info" title="${ports}">
                    ${
                      ports.length > 20 ? ports.substring(0, 20) + "..." : ports
                    }
                </span>
            </td>
            <td class="align-middle">
                ${getStatusBadge(vessel.loading_status)}
            </td>
            <td class="align-middle">
                <span class="badge bg-primary">${formatDate(
                  vessel.eta_date
                )}</span>
            </td>
            <td class="align-middle">
                <span class="badge bg-warning">${formatDate(
                  vessel.estimated_departure_date
                )}</span>
            </td>
            <td class="align-middle">
                <div class="d-flex align-items-center">
                    <div class="me-2">${progress}%</div>
                    <div class="progress flex-grow-1" style="height: 8px;">
                        <div class="progress-bar ${getProgressBarColor(
                          progress
                        )}" 
                             style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                </div>
            </td>
            <td class="text-end align-middle">
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-sm btn-outline-info" onclick="viewVesselDetails(${
                      vessel.schedule_id
                    })">
                        <i class="bi bi-eye"></i> Details
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="editVessel(${
                      vessel.schedule_id
                    })">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteVessel(${
                      vessel.schedule_id
                    })">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
        `;
    })
    .join("");
}

function getStatusBadge(status) {
  const badges = {
    waiting: { class: "bg-secondary", text: "Waiting", icon: "bi-hourglass" },
    loading: { class: "bg-warning", text: "Loading", icon: "bi-truck" },
    completed: {
      class: "bg-success",
      text: "Completed",
      icon: "bi-check-circle",
    },
    delayed: {
      class: "bg-danger",
      text: "Delayed",
      icon: "bi-exclamation-triangle",
    },
  };

  const badge = badges[status] || {
    class: "bg-secondary",
    text: status,
    icon: "bi-question-circle",
  };
  return `<span class="badge ${badge.class}"><i class="bi ${badge.icon} me-1"></i>${badge.text}</span>`;
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
  const tbody = document.getElementById("vessel-table-body");
  if (!tbody) return;

  if (show) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading vessel data...</p>
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

window.editVessel = function (schedule_id) {
  const vessel = vesselsData.find((v) => v.schedule_id == schedule_id);
  if (!vessel) {
    showMessage("Vessel not found", "danger");
    return;
  }

  currentEditingId = schedule_id;

  document.getElementById("schedule_id").value = vessel.schedule_id;
  document.getElementById("vessel_code").value = vessel.vessel_code;
  document.getElementById("vessel_name").value = vessel.vessel_name;
  document.getElementById("eta_date").value = vessel.eta_date;
  document.getElementById("latest_berthing").value = vessel.latest_berthing;
  document.getElementById("target_load_tons").value = vessel.target_load_tons;
  document.getElementById("loading_status").value = vessel.loading_status;
  document.getElementById("shipping_notes").value = vessel.shipping_notes || "";

  const modalTitle = document.querySelector("#addVesselModal .modal-title");
  modalTitle.innerHTML =
    '<i class="bi bi-pencil-square me-2"></i> Edit Shipping Vessel';

  const modal = new bootstrap.Modal(document.getElementById("addVesselModal"));
  modal.show();
};

window.viewVesselDetails = async function (schedule_id) {
  try {
    const vesselResponse = await getShippingVesselDetail(schedule_id);
    if (!vesselResponse.success) {
      showMessage("Failed to load vessel details", "danger");
      return;
    }

    const vessel = vesselResponse.data;

    document.getElementById("detail-vessel-code").textContent =
      vessel.vessel_code;
    document.getElementById("detail-vessel-name").textContent =
      vessel.vessel_name;
    document.getElementById("detail-target-load").textContent = `${parseFloat(
      vessel.target_load_tons
    ).toLocaleString()} tons`;
    document.getElementById("detail-loading-status").innerHTML = getStatusBadge(
      vessel.loading_status
    );
    document.getElementById("detail-shipping-notes").textContent =
      vessel.shipping_notes || "No notes available";

    const loadingDetailsBody = document.getElementById("loading-details");
    if (vessel.loading_details && vessel.loading_details.length > 0) {
      loadingDetailsBody.innerHTML = vessel.loading_details
        .map(
          (detail) => `
                <tr>
                    <td>${formatDate(detail.date)}</td>
                    <td>${detail.shift_name || "-"}</td>
                    <td><strong>${parseFloat(
                      detail.loaded_tons
                    ).toLocaleString()}</strong></td>
                    <td><span class="badge bg-secondary">${
                      detail.equipment_code || "-"
                    }</span></td>
                </tr>
            `
        )
        .join("");
    } else {
      loadingDetailsBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-muted">
                        No loading details available
                    </td>
                </tr>
            `;
    }

    const stockpileAllocationBody = document.getElementById(
      "stockpile-allocation"
    );
    if (vessel.stockpile_allocation && vessel.stockpile_allocation.length > 0) {
      stockpileAllocationBody.innerHTML = vessel.stockpile_allocation
        .map(
          (allocation) => `
                <tr>
                    <td>${allocation.stockpile_name || "-"}</td>
                    <td><strong>${parseFloat(
                      allocation.allocated_tons
                    ).toLocaleString()}</strong></td>
                    <td>${allocation.quality_cv || "-"}</td>
                    <td>${allocation.quality_tm || "-"}</td>
                </tr>
            `
        )
        .join("");
    } else {
      stockpileAllocationBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-muted">
                        No stockpile allocation available
                    </td>
                </tr>
            `;
    }

    const modal = new bootstrap.Modal(
      document.getElementById("viewDetailsModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error loading vessel details:", error);
    showMessage("Error loading vessel details. Please try again.", "danger");
  }
};

window.deleteVessel = async function (schedule_id) {
  if (
    !confirm(
      "Are you sure you want to delete this shipping vessel? This will also delete all related loading details and stockpile allocations."
    )
  ) {
    return;
  }

  try {
    const result = await deleteShippingVessel(schedule_id);
    if (result.ok) {
      showMessage("Shipping vessel deleted successfully", "success");
      loadVessels();
    } else {
      showMessage("Failed to delete vessel", "danger");
    }
  } catch (error) {
    console.error("Error deleting vessel:", error);
    showMessage("Error deleting vessel: " + error.message, "danger");
  }
};

async function saveVessel() {
  const form = document.getElementById("vesselForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const vesselData = {
    vessel_code: document.getElementById("vessel_code").value.trim(),
    vessel_name: document.getElementById("vessel_name").value.trim(),
    eta_date: document.getElementById("eta_date").value,
    latest_berthing: document.getElementById("latest_berthing").value,
    target_load_tons:
      parseFloat(document.getElementById("target_load_tons").value) || 0,
    loading_status: document.getElementById("loading_status").value,
    shipping_notes: document.getElementById("shipping_notes").value.trim(),
  };

  if (
    !vesselData.vessel_code ||
    !vesselData.vessel_name ||
    !vesselData.eta_date
  ) {
    showMessage("Please fill all required fields", "warning");
    return;
  }

  try {
    let result;
    if (currentEditingId) {
      result = await updateShippingVessel(currentEditingId, vesselData);
    } else {
      result = await createShippingVessel(vesselData);
    }

    if (result.success) {
      showMessage(result.message, "success");

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addVesselModal")
      );
      if (modal) {
        modal.hide();
      }

      loadVessels();
    } else {
      showMessage("Failed to save vessel: " + result.message, "danger");
    }
  } catch (error) {
    console.error("Error saving vessel:", error);
    showMessage("Error saving vessel: " + error.message, "danger");
  }
}

function resetModal() {
  const form = document.getElementById("vesselForm");
  if (form) {
    form.reset();
    form.querySelector("#schedule_id").value = "";
  }
  currentEditingId = null;

  const modalTitle = document.querySelector("#addVesselModal .modal-title");
  if (modalTitle) {
    modalTitle.innerHTML =
      '<i class="bi bi-plus-circle me-2"></i> Add Shipping Vessel';
  }
}

function extractPortsForFilter(vessels) {
  const ports = new Set();
  vessels.forEach((vessel) => {
    if (vessel.stockpile_names) {
      const portList = vessel.stockpile_names.split(",");
      portList.forEach((port) => ports.add(port.trim()));
    }
  });

  portsData = Array.from(ports).sort();
  const filterSelect = document.getElementById("filter-port");
  filterSelect.innerHTML = '<option value="">All Ports</option>';

  portsData.forEach((port) => {
    const option = document.createElement("option");
    option.value = port;
    option.textContent = port;
    filterSelect.appendChild(option);
  });
}


function filterVessels() {
  const searchTerm = document
    .getElementById("search-vessel")
    .value.toLowerCase();
  const statusFilter = document.getElementById("filter-status").value;
  const portFilter = document.getElementById("filter-port").value;

  const filteredVessels = vesselsData.filter((vessel) => {

    const matchesSearch =
      !searchTerm ||
      vessel.vessel_name.toLowerCase().includes(searchTerm) ||
      vessel.vessel_code.toLowerCase().includes(searchTerm);

    const matchesStatus =
      !statusFilter || vessel.loading_status === statusFilter;

    const matchesPort =
      !portFilter ||
      (vessel.stockpile_names &&
        vessel.stockpile_names
          .toLowerCase()
          .includes(portFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesPort;
  });

  renderVesselsTable(filteredVessels);
}

function getStatusColor(status) {
  const colors = {
    waiting: "bg-secondary",
    loading: "bg-warning",
    completed: "bg-success",
    delayed: "bg-danger",
  };
  return colors[status] || "bg-secondary";
}

function getProgressBarColor(percentage) {
  if (percentage >= 100) return "bg-success";
  if (percentage >= 70) return "bg-info";
  if (percentage >= 40) return "bg-primary";
  if (percentage > 0) return "bg-warning";
  return "bg-secondary";
}

function initializeCharts() {
  const progressCtx = document.createElement("canvas");
  progressCtx.id = "progressChart";
  document.getElementById("progress-chart-container").innerHTML = "";
  document.getElementById("progress-chart-container").appendChild(progressCtx);

  const statusCtx = document.createElement("canvas");
  statusCtx.id = "statusChart";
  document.getElementById("status-chart-container").innerHTML = "";
  document.getElementById("status-chart-container").appendChild(statusCtx);
}
function updateCharts(vessels) {
  const vesselNames = vessels.map(
    (v) =>
      v.vessel_name.substring(0, 15) + (v.vessel_name.length > 15 ? "..." : "")
  );
  const progressData = vessels.map((v) => v.progress_percentage || 0);
  const targetLoads = vessels.map((v) => v.target_load_tons || 0);

  if (progressChart) progressChart.destroy();

  progressChart = new Chart(document.getElementById("progressChart"), {
    type: "bar",
    data: {
      labels: vesselNames,
      datasets: [
        {
          label: "Progress %",
          data: progressData,
          backgroundColor: progressData.map((p) => {
            if (p >= 100) return "rgba(75, 192, 192, 0.7)";
            if (p >= 70) return "rgba(54, 162, 235, 0.7)";
            if (p >= 40) return "rgba(153, 102, 255, 0.7)";
            return "rgba(255, 159, 64, 0.7)";
          }),
          borderColor: progressData.map((p) => {
            if (p >= 100) return "rgb(75, 192, 192)";
            if (p >= 70) return "rgb(54, 162, 235)";
            if (p >= 40) return "rgb(153, 102, 255)";
            return "rgb(255, 159, 64)";
          }),
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Target (tons)",
          data: targetLoads,
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          yAxisID: "y1",
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "Progress %",
          },
          min: 0,
          max: 100,
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Target (tons)",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              if (context.datasetIndex === 0) {
                return `Progress: ${context.parsed.y}%`;
              } else {
                return `Target: ${parseFloat(
                  context.parsed.y
                ).toLocaleString()} tons`;
              }
            },
          },
        },
      },
    },
  });

  const statusCounts = {
    waiting: vessels.filter((v) => v.loading_status === "waiting").length,
    loading: vessels.filter((v) => v.loading_status === "loading").length,
    completed: vessels.filter((v) => v.loading_status === "completed").length,
    delayed: vessels.filter((v) => v.loading_status === "delayed").length,
  };

  if (statusChart) statusChart.destroy();

  statusChart = new Chart(document.getElementById("statusChart"), {
    type: "doughnut",
    data: {
      labels: ["Waiting", "Loading", "Completed", "Delayed"],
      datasets: [
        {
          data: [
            statusCounts.waiting,
            statusCounts.loading,
            statusCounts.completed,
            statusCounts.delayed,
          ],
          backgroundColor: [
            "rgba(108, 117, 125, 0.7)",
            "rgba(255, 193, 7, 0.7)",
            "rgba(25, 135, 84, 0.7)",
            "rgba(220, 53, 69, 0.7)",
          ],
          borderColor: [
            "rgb(108, 117, 125)",
            "rgb(255, 193, 7)",
            "rgb(25, 135, 84)",
            "rgb(220, 53, 69)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.parsed / total) * 100);
              return `${context.label}: ${context.parsed} vessels (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

window.viewVesselDetails = async function (schedule_id) {
  try {
    const vesselResponse = await getShippingVesselDetail(schedule_id);
    if (!vesselResponse.success) {
      showMessage("Failed to load vessel details", "danger");
      return;
    }

    const vessel = vesselResponse.data;

    document.getElementById("detail-vessel-name").textContent =
      vessel.vessel_name;
    document.getElementById("detail-vessel-code").textContent =
      vessel.vessel_code;
    document.getElementById("detail-eta").textContent = formatDate(
      vessel.eta_date
    );
    document.getElementById("detail-berthing").textContent = formatDate(
      vessel.latest_berthing
    );
    document.getElementById("detail-target-load").textContent = `${parseFloat(
      vessel.target_load_tons
    ).toLocaleString()} tons`;
    document.getElementById("detail-allocated").textContent = `${parseFloat(
      vessel.allocated_tons || 0
    ).toLocaleString()} tons`;
    document.getElementById("detail-updated").textContent = formatDate(
      vessel.updated_at
    );

    const progress = vessel.progress_percentage || 0;
    const loadedTons = vessel.loaded_tons || 0;
    document.getElementById(
      "detail-progress-percentage"
    ).textContent = `${progress}%`;
    document.getElementById("detail-progress-bar").style.width = `${progress}%`;
    document.getElementById("detail-loaded-tons").textContent = `${parseFloat(
      loadedTons
    ).toLocaleString()} / ${parseFloat(
      vessel.target_load_tons
    ).toLocaleString()} tons`;

    document.getElementById("detail-loading-status-badge").innerHTML =
      getStatusBadge(vessel.loading_status);

    const portContainer = document.getElementById("port-allocation-container");
    if (vessel.stockpile_allocation && vessel.stockpile_allocation.length > 0) {
      portContainer.innerHTML = vessel.stockpile_allocation
        .map((allocation) => {
          const allocationProgress = allocation.loaded_from_port
            ? Math.round(
                (allocation.loaded_from_port / allocation.allocated_tons) * 100
              )
            : 0;

          return `
                <div class="mb-3">
                    <div class="d-flex justify-content-between mb-1">
                        <span><strong>${
                          allocation.stockpile_name || "Unknown Port"
                        }</strong></span>
                        <span>${allocationProgress}%</span>
                    </div>
                    <div class="progress" style="height: 10px;">
                        <div class="progress-bar ${getProgressBarColor(
                          allocationProgress
                        )}" 
                             style="width: ${Math.min(
                               allocationProgress,
                               100
                             )}%"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-1">
                        <small class="text-muted">
                            ${parseFloat(
                              allocation.loaded_from_port || 0
                            ).toLocaleString()} / 
                            ${parseFloat(
                              allocation.allocated_tons
                            ).toLocaleString()} tons
                        </small>
                        <small class="text-muted">
                            CV: ${allocation.quality_cv || "-"} | TM: ${
            allocation.quality_tm || "-"
          }
                        </small>
                    </div>
                </div>
                `;
        })
        .join("");
    } else {
      portContainer.innerHTML = `
                <div class="text-center py-3 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    No port allocation data available
                </div>
            `;
    }

    const loadingSessionsBody = document.getElementById("loading-sessions");
    if (vessel.loading_details && vessel.loading_details.length > 0) {
      loadingSessionsBody.innerHTML = vessel.loading_details
        .map(
          (detail) => `
                <tr>
                    <td>${formatDate(detail.date)}</td>
                    <td><span class="badge bg-secondary">${
                      detail.shift_name || "-"
                    }</span></td>
                    <td><strong>${parseFloat(
                      detail.loaded_tons
                    ).toLocaleString()}</strong></td>
                    <td><span class="badge bg-info">${
                      detail.equipment_code || "-"
                    }</span></td>
                </tr>
            `
        )
        .join("");
    } else {
      loadingSessionsBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center py-3 text-muted">
                        No loading sessions recorded
                    </td>
                </tr>
            `;
    }

    const modal = new bootstrap.Modal(
      document.getElementById("viewDetailsModal")
    );
    modal.show();
  } catch (error) {
    console.error("Error loading vessel details:", error);
    showMessage("Error loading vessel details. Please try again.", "danger");
  }
};

function exportToExcel() {
  showMessage("Export feature is under development", "info");
}

function printVesselReport() {
  window.print();
}
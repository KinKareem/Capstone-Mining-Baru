const API_BASE_URL = "http://localhost:3000/api";
let weeklyPeriods = [];

function formatNumber(num) {
  return new Intl.NumberFormat("id-ID").format(num || 0);
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

// Load weekly periods from API
async function loadWeeklyPeriods() {
  try {
    const tbody = document.getElementById("periods-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading weekly periods...</p>
                    </td>
                </tr>
            `;
    }

    const response = await axios.get(`${API_BASE_URL}/weekly-periods`);
    weeklyPeriods = response.data.data || [];

    // Update stats
    updateStats(weeklyPeriods);

    // Render table
    renderPeriodsTable(weeklyPeriods);
  } catch (error) {
    console.error("Error loading weekly periods:", error);
    showToast("danger", "Error", "Failed to load weekly periods");

    const tbody = document.getElementById("periods-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                        <p class="mt-2 text-danger">Failed to load data</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="loadWeeklyPeriods()">
                            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                        </button>
                    </td>
                </tr>
            `;
    }
  }
}

// Update statistics cards
function updateStats(periods) {
  if (!periods || periods.length === 0) {
    const totalPeriodsEl = document.getElementById("total-periods");
    const activePeriodEl = document.getElementById("active-period");
    const totalTargetEl = document.getElementById("total-target");
    const totalStockpileEl = document.getElementById("total-stockpile");

    if (totalPeriodsEl) totalPeriodsEl.textContent = "0";
    if (activePeriodEl) activePeriodEl.textContent = "-";
    if (totalTargetEl) totalTargetEl.textContent = "0 tons";
    if (totalStockpileEl) totalStockpileEl.textContent = "0 tons";
    return;
  }

  // Total periods
  const totalPeriodsEl = document.getElementById("total-periods");
  if (totalPeriodsEl) {
    totalPeriodsEl.textContent = periods.length;
  }

  // Active period
  const today = new Date().toISOString().split("T")[0];
  const activePeriod =
    periods.find((p) => p.end_date >= today) || periods[periods.length - 1];
  const activePeriodEl = document.getElementById("active-period");
  if (activePeriodEl && activePeriod) {
    activePeriodEl.textContent = activePeriod.period_code;
  }

  // Total production target
  const totalTarget = periods.reduce(
    (sum, p) => sum + (p.target_tonnage || 0),
    0
  );
  const totalTargetEl = document.getElementById("total-target");
  if (totalTargetEl) {
    totalTargetEl.textContent = `${formatNumber(totalTarget)} tons`;
  }

  // Total stockpile target
  const totalStockpile = periods.reduce(
    (sum, p) => sum + (p.stockpile_tons_target || 0),
    0
  );
  const totalStockpileEl = document.getElementById("total-stockpile");
  if (totalStockpileEl) {
    totalStockpileEl.textContent = `${formatNumber(totalStockpile)} tons`;
  }
}

// Render periods table
function renderPeriodsTable(periods) {
  const tbody = document.getElementById("periods-table-body");
  if (!tbody) return;

  if (!periods || periods.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-calendar-x fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">No weekly periods found</p>
                    <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addPeriodModal">
                        Create First Period
                    </button>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = periods
    .map(
      (period) => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-calendar-week me-2 text-primary"></i>
                    <div>
                        <strong>${period.period_code || "-"}</strong>
                        <div class="text-muted small">
                            ID: ${period.period_id}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <span class="d-block">${formatDate(
                      period.start_date
                    )}</span>
                    <span class="text-muted small">to</span>
                    <span class="d-block">${formatDate(period.end_date)}</span>
                </div>
            </td>
            <td>
                <span class="badge bg-warning text-dark">
                    ${formatNumber(period.target_tonnage)} tons
                </span>
            </td>
            <td>
                <span class="badge bg-info">
                    ${formatNumber(period.stockpile_tons_target)} tons
                </span>
            </td>
            <td>
                <span class="small text-muted">
                    ${formatDate(period.created_at)}
                </span>
            </td>
            <td class="text-end table-actions">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editPeriod(${
                  period.period_id
                })">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deletePeriod(${
                  period.period_id
                })">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Add new period
async function addPeriod() {
  const periodData = {
    period_code: document.getElementById("period_code").value,
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value,
    target_tonnage: document.getElementById("target_tonnage").value || 0,
    stockpile_tons_target:
      document.getElementById("stockpile_tons_target").value || 0,
  };

  // Validation
  if (
    !periodData.period_code ||
    !periodData.start_date ||
    !periodData.end_date
  ) {
    showToast("warning", "Validation", "Please fill all required fields");
    return false;
  }

  if (new Date(periodData.end_date) < new Date(periodData.start_date)) {
    showToast("warning", "Validation", "End date must be after start date");
    return false;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/weekly-periods`,
      periodData
    );

    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addPeriodModal")
    );
    if (addModal) {
      addModal.hide();
    }
    document.getElementById("addPeriodForm").reset();

    showToast("success", "Success", "Weekly period created successfully");

    
    loadWeeklyPeriods();
    return true;
  } catch (error) {
    console.error("Error creating period:", error);

    let errorMessage = "Failed to create weekly period";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Edit period
async function editPeriod(periodId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/weekly-periods/${periodId}`
    );
    const period = response.data.data;

    if (!period) {
      showToast("warning", "Warning", "Period not found");
      return;
    }

    // Fill form with period data
    document.getElementById("edit_period_id").value = period.period_id;
    document.getElementById("edit_period_code").value = period.period_code;
    document.getElementById("edit_start_date").value = period.start_date;
    document.getElementById("edit_end_date").value = period.end_date;
    document.getElementById("edit_target_tonnage").value =
      period.target_tonnage || 0;
    document.getElementById("edit_stockpile_tons_target").value =
      period.stockpile_tons_target || 0;

    // Show modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editPeriodModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading period for edit:", error);
    showToast("danger", "Error", "Failed to load period data");
  }
}

// Update period
async function updatePeriod() {
  const periodId = document.getElementById("edit_period_id").value;
  const periodData = {
    period_code: document.getElementById("edit_period_code").value,
    start_date: document.getElementById("edit_start_date").value,
    end_date: document.getElementById("edit_end_date").value,
    target_tonnage: document.getElementById("edit_target_tonnage").value || 0,
    stockpile_tons_target:
      document.getElementById("edit_stockpile_tons_target").value || 0,
  };

  try {
    const response = await axios.put(
      `${API_BASE_URL}/weekly-periods/${periodId}`,
      periodData
    );

    // Close modal
    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editPeriodModal")
    );
    if (editModal) {
      editModal.hide();
    }

    showToast("success", "Success", "Weekly period updated successfully");

    // Reload data
    loadWeeklyPeriods();
    return true;
  } catch (error) {
    console.error("Error updating period:", error);

    let errorMessage = "Failed to update weekly period";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Delete period
async function deletePeriod(periodId) {
  if (
    !confirm(
      "Are you sure you want to delete this weekly period? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/weekly-periods/${periodId}`
    );

    showToast("success", "Success", "Weekly period deleted successfully");

    // Reload data
    loadWeeklyPeriods();
  } catch (error) {
    console.error("Error deleting period:", error);

    let errorMessage = "Failed to delete weekly period";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
  }
}

// Generate next week
async function generateNextWeek() {
  if (!confirm("Generate next weekly period automatically?")) {
    return;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/weekly-periods/generate-next`
    );

    showToast(
      "success",
      "Success",
      "Next weekly period generated successfully"
    );

    loadWeeklyPeriods();
  } catch (error) {
    console.error("Error generating next period:", error);

    let errorMessage = "Failed to generate next period";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
  }
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
  loadWeeklyPeriods();

  setInterval(updateTime, 1000);
  updateTime();

  const today = new Date().toISOString().split("T")[0];
  const startDateInput = document.getElementById("start_date");
  if (startDateInput) {
    startDateInput.value = today;
  }

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 6);
  const endDateInput = document.getElementById("end_date");
  if (endDateInput) {
    endDateInput.value = endDate.toISOString().split("T")[0];
  }

  const savePeriodBtn = document.getElementById("btn-save-period");
  if (savePeriodBtn) {
    savePeriodBtn.addEventListener("click", addPeriod);
  }

  const updatePeriodBtn = document.getElementById("btn-update-period");
  if (updatePeriodBtn) {
    updatePeriodBtn.addEventListener("click", updatePeriod);
  }

  const generateNextBtn = document.getElementById("btn-generate-next");
  if (generateNextBtn) {
    generateNextBtn.addEventListener("click", generateNextWeek);
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const addPeriodForm = document.getElementById("addPeriodForm");
  if (addPeriodForm) {
    addPeriodForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addPeriod();
    });
  }

  const editPeriodForm = document.getElementById("editPeriodForm");
  if (editPeriodForm) {
    editPeriodForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updatePeriod();
    });
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl + N to add new period
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      const addModalBtn = document.querySelector(
        '[data-bs-target="#addPeriodModal"]'
      );
      if (addModalBtn) {
        addModalBtn.click();
      }
    }

    // F5 to refresh
    if (e.key === "F5") {
      e.preventDefault();
      loadWeeklyPeriods();
    }
  });

  // Handle modal show events
  const addModal = document.getElementById("addPeriodModal");
  if (addModal) {
    addModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("period_code").focus();
    });
  }

  const editModal = document.getElementById("editPeriodModal");
  if (editModal) {
    editModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("edit_period_code").focus();
    });
  }
}

// Export functions for debugging
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatNumber,
    formatDate,
    loadWeeklyPeriods,
    addPeriod,
    editPeriod,
    updatePeriod,
    deletePeriod,
    generateNextWeek,
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

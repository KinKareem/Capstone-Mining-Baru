const API_BASE_URL = "http://localhost:3000";
let equipmentList = [];


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

// Load equipment from API
async function loadEquipment() {
  try {
    const tbody = document.getElementById("equipment-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading equipment data...</p>
                    </td>
                </tr>
            `;
    }

    const response = await axios.get(`${API_BASE_URL}/equipments`);
    equipmentList = response.data.data || [];

    updateStats(equipmentList);

    renderEquipmentTable(equipmentList);
  } catch (error) {
    console.error("Error loading equipment:", error);
    showToast("danger", "Error", "Failed to load equipment data");

    const tbody = document.getElementById("equipment-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                        <p class="mt-2 text-danger">Failed to load data</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="loadEquipment()">
                            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                        </button>
                    </td>
                </tr>
            `;
    }
  }
}

// Update statistics cards
function updateStats(equipments) {
  if (!equipments || equipments.length === 0) {
    document.getElementById("total-equipment").textContent = "0";
    document.getElementById("ready-equipment").textContent = "0";
    document.getElementById("maintenance-equipment").textContent = "0";
    document.getElementById("avg-capacity").textContent = "0 tons";
    return;
  }

  // Total equipment
  document.getElementById("total-equipment").textContent = equipments.length;

  // Count by status
  const readyCount = equipments.filter(
    (e) => e.default_status === "ready"
  ).length;
  const maintenanceCount = equipments.filter(
    (e) => e.default_status === "maintenance"
  ).length;

  document.getElementById("ready-equipment").textContent = readyCount;
  document.getElementById("maintenance-equipment").textContent =
    maintenanceCount;

  // Average capacity
  const totalCapacity = equipments.reduce(
    (sum, e) => sum + (e.capacity || 0),
    0
  );
  const avgCapacity = totalCapacity / equipments.length;
  document.getElementById("avg-capacity").textContent = `${formatNumber(
    avgCapacity.toFixed(2)
  )} tons`;
}

// Render equipment table
function renderEquipmentTable(equipments) {
  const tbody = document.getElementById("equipment-table-body");
  if (!tbody) return;

  if (!equipments || equipments.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="bi bi-truck fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">No equipment found</p>
                    <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addEquipmentModal">
                        Add First Equipment
                    </button>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = equipments
    .map(
      (equipment) => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-truck me-2 text-primary"></i>
                    <div>
                        <strong>${equipment.unit_code || "-"}</strong>
                        <div class="text-muted small">
                            ID: ${equipment.equipment_id}
                        </div>
                    </div>
                </div>
            </td>
            <td>${equipment.equipment_type || "-"}</td>
            <td>${equipment.model || "-"}</td>
            <td>
                <span class="badge bg-secondary">
                    ${formatNumber(equipment.capacity || 0)} ${
        equipment.capacity_unit || "tons"
      }
                </span>
            </td>
            <td>
                <span class="status-badge status-${equipment.default_status}">
                    ${equipment.default_status || "-"}
                </span>
            </td>
            <td>
                <span class="small text-muted">
                    ${formatDate(equipment.created_at)}
                </span>
            </td>
            <td class="text-end table-actions">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEquipment(${
                  equipment.equipment_id
                })">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEquipment(${
                  equipment.equipment_id
                })">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join("");
}

// Add new equipment
async function addEquipment() {
  const equipmentData = {
    unit_code: document.getElementById("unit_code").value,
    equipment_type: document.getElementById("equipment_type").value,
    default_status: document.getElementById("default_status").value,
    capacity: document.getElementById("capacity").value || 0,
    capacity_unit: document.getElementById("capacity_unit").value || "tons",
    model: document.getElementById("model").value || "",
  };

  // Validation
  if (
    !equipmentData.unit_code ||
    !equipmentData.equipment_type ||
    !equipmentData.default_status
  ) {
    showToast("warning", "Validation", "Please fill all required fields");
    return false;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/equipments`,
      equipmentData
    );

    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addEquipmentModal")
    );
    if (addModal) {
      addModal.hide();
    }
    document.getElementById("addEquipmentForm").reset();

    // Show success message
    showToast("success", "Success", "Equipment added successfully");

    // Reload data
    loadEquipment();
    return true;
  } catch (error) {
    console.error("Error adding equipment:", error);

    let errorMessage = "Failed to add equipment";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Edit equipment
async function editEquipment(equipmentId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/equipments/${equipmentId}`
    );
    const equipment = response.data.data;

    if (!equipment) {
      showToast("warning", "Warning", "Equipment not found");
      return;
    }

    // Fill form with equipment data
    document.getElementById("edit_equipment_id").value = equipment.equipment_id;
    document.getElementById("edit_unit_code").value = equipment.unit_code;
    document.getElementById("edit_equipment_type").value =
      equipment.equipment_type;
    document.getElementById("edit_default_status").value =
      equipment.default_status;
    document.getElementById("edit_capacity").value = equipment.capacity || 0;
    document.getElementById("edit_capacity_unit").value =
      equipment.capacity_unit || "tons";
    document.getElementById("edit_model").value = equipment.model || "";

    // Show modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editEquipmentModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading equipment for edit:", error);
    showToast("danger", "Error", "Failed to load equipment data");
  }
}

// Update equipment
async function updateEquipment() {
  const equipmentId = document.getElementById("edit_equipment_id").value;
  const equipmentData = {
    unit_code: document.getElementById("edit_unit_code").value,
    equipment_type: document.getElementById("edit_equipment_type").value,
    default_status: document.getElementById("edit_default_status").value,
    capacity: document.getElementById("edit_capacity").value || 0,
    capacity_unit:
      document.getElementById("edit_capacity_unit").value || "tons",
    model: document.getElementById("edit_model").value || "",
  };

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/equipments/${equipmentId}`,
      equipmentData
    );

    console.log(equipmentData)

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editEquipmentModal")
    );
    if (editModal) {
      editModal.hide();
    }

    showToast("success", "Success", "Equipment updated successfully");

    loadEquipment();
    return true;
  } catch (error) {
    console.error("Error updating equipment:", error);

    let errorMessage = "Failed to update equipment";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Delete equipment
async function deleteEquipment(equipmentId) {
  if (
    !confirm(
      "Are you sure you want to delete this equipment? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/equipments/${equipmentId}`
    );

    showToast("success", "Success", "Equipment deleted successfully");

    loadEquipment();
  } catch (error) {
    console.error("Error deleting equipment:", error);

    let errorMessage = "Failed to delete equipment";
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
function initializePage() {
  loadEquipment();

  setInterval(updateTime, 1000);
  updateTime();

  const saveEquipmentBtn = document.getElementById("btn-save-equipment");
  if (saveEquipmentBtn) {
    saveEquipmentBtn.addEventListener("click", addEquipment);
  }

  const updateEquipmentBtn = document.getElementById("btn-update-equipment");
  if (updateEquipmentBtn) {
    updateEquipmentBtn.addEventListener("click", updateEquipment);
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const addEquipmentForm = document.getElementById("addEquipmentForm");
  if (addEquipmentForm) {
    addEquipmentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addEquipment();
    });
  }

  const editEquipmentForm = document.getElementById("editEquipmentForm");
  if (editEquipmentForm) {
    editEquipmentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateEquipment();
    });
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl + N to add new equipment
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      const addModalBtn = document.querySelector(
        '[data-bs-target="#addEquipmentModal"]'
      );
      if (addModalBtn) {
        addModalBtn.click();
      }
    }

    // F5 to refresh
    if (e.key === "F5") {
      e.preventDefault();
      loadEquipment();
    }
  });

  // Handle modal show events
  const addModal = document.getElementById("addEquipmentModal");
  if (addModal) {
    addModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("unit_code").focus();
    });
  }

  const editModal = document.getElementById("editEquipmentModal");
  if (editModal) {
    editModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("edit_unit_code").focus();
    });
  }
}

// Initialize when DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

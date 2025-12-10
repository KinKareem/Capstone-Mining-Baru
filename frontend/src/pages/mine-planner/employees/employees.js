const API_BASE_URL = "http://localhost:3000";
let employeesList = [];

// Format number with thousands separator
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

// Generate avatar color based on name
function getAvatarColor(name) {
  const colors = [
    "avatar-primary",
    "avatar-success",
    "avatar-warning",
    "avatar-danger",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// Get initials from name
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
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

// Load employees from API
async function loadEmployees() {
  try {
    const tbody = document.getElementById("employees-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading employees data...</p>
                    </td>
                </tr>
            `;
    }

    const response = await axios.get(`${API_BASE_URL}/employees`);
    employeesList = response.data.data || [];

    // Load stats
    await loadEmployeeStats();

    // Render table
    renderEmployeesTable(employeesList);
  } catch (error) {
    console.error("Error loading employees:", error);
    showToast("danger", "Error", "Failed to load employees data");

    const tbody = document.getElementById("employees-table-body");
    if (tbody) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                        <p class="mt-2 text-danger">Failed to load data</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="loadEmployees()">
                            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                        </button>
                    </td>
                </tr>
            `;
    }
  }
}

// Load employee statistics
async function loadEmployeeStats() {
  try {
    const response = await axios.get(`${API_BASE_URL}/employees/stats`);
    const stats = response.data.data || { total: 0, active: 0, inactive: 0 };

    // Update stats cards
    document.getElementById("total-employees").textContent = formatNumber(
      stats.total || 0
    );
    document.getElementById("active-employees").textContent = formatNumber(
      stats.active || 0
    );
    document.getElementById("inactive-employees").textContent = formatNumber(
      stats.inactive || 0
    );

    // Count unique positions
    const positions = new Set(
      employeesList.map((emp) => emp.position).filter(Boolean)
    );
    document.getElementById("total-positions").textContent = positions.size;
  } catch (error) {
    console.error("Error loading employee stats:", error);
  }
}

// Filter employees based on search and status
function filterEmployees() {
  const searchTerm = document
    .getElementById("search-employee")
    .value.toLowerCase();
  const statusFilter = document.getElementById("filter-status").value;

  let filtered = employeesList;

  // search filter
  if (searchTerm) {
    filtered = filtered.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.position.toLowerCase().includes(searchTerm) ||
        (emp.competency && emp.competency.toLowerCase().includes(searchTerm))
    );
  }

  // status filter
  if (statusFilter) {
    filtered = filtered.filter((emp) => emp.status === statusFilter);
  }

  renderEmployeesTable(filtered);
}

// Render employees table
function renderEmployeesTable(employees) {
  const tbody = document.getElementById("employees-table-body");
  if (!tbody) return;

  if (!employees || employees.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="bi bi-people fs-1 text-muted"></i>
                    <p class="mt-2 text-muted">No employees found</p>
                    <button class="btn btn-sm btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addEmployeeModal">
                        Add First Employee
                    </button>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = employees
    .map((employee) => {
      const avatarColor = getAvatarColor(employee.name);
      const initials = getInitials(employee.name);

      return `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar ${avatarColor} me-3">
                            ${initials}
                        </div>
                        <div>
                            <strong>${employee.name || "-"}</strong>
                            <div class="text-muted small">
                                ID: ${employee.employee_id}
                            </div>
                        </div>
                    </div>
                </td>
                <td>${employee.position || "-"}</td>
                <td>${employee.competency || "-"}</td>
                <td>
                    <span class="status-badge status-${employee.status}">
                        ${employee.status || "-"}
                    </span>
                </td>
                <td>
                    <span class="small text-muted">
                        ${formatDate(employee.created_at)}
                    </span>
                </td>
                <td class="text-end table-actions">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${
                      employee.employee_id
                    })">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${
                      employee.employee_id
                    })">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    })
    .join("");
}

// Add new employee
async function addEmployee() {
  const employeeData = {
    name: document.getElementById("name").value,
    position: document.getElementById("position").value,
    status: document.getElementById("status").value,
    competency: document.getElementById("competency").value || "",
  };

  // Validation
  if (!employeeData.name || !employeeData.position || !employeeData.status) {
    showToast("warning", "Validation", "Please fill all required fields");
    return false;
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/employees`,
      employeeData
    );

    // Close modal and reset form
    const addModal = bootstrap.Modal.getInstance(
      document.getElementById("addEmployeeModal")
    );
    if (addModal) {
      addModal.hide();
    }
    document.getElementById("addEmployeeForm").reset();

    // Show success message
    showToast("success", "Success", "Employee added successfully");

    // Reload data
    loadEmployees();
    return true;
  } catch (error) {
    console.error("Error adding employee:", error);

    let errorMessage = "Failed to add employee";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Edit employee
async function editEmployee(employeeId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/employees/${employeeId}`);
    const employee = response.data.data;

    if (!employee) {
      showToast("warning", "Warning", "Employee not found");
      return;
    }

    // Fill form with employee data
    document.getElementById("edit_employee_id").value = employee.employee_id;
    document.getElementById("edit_name").value = employee.name;
    document.getElementById("edit_position").value = employee.position;
    document.getElementById("edit_status").value = employee.status;
    document.getElementById("edit_competency").value =
      employee.competency || "";

    // Show modal
    const editModal = new bootstrap.Modal(
      document.getElementById("editEmployeeModal")
    );
    editModal.show();
  } catch (error) {
    console.error("Error loading employee for edit:", error);
    showToast("danger", "Error", "Failed to load employee data");
  }
}

// Update employee
async function updateEmployee() {
  const employeeId = document.getElementById("edit_employee_id").value;
  const employeeData = {
    name: document.getElementById("edit_name").value,
    position: document.getElementById("edit_position").value,
    status: document.getElementById("edit_status").value,
    competency: document.getElementById("edit_competency").value || "",
  };

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/employees/${employeeId}`,
      employeeData
    );

    const editModal = bootstrap.Modal.getInstance(
      document.getElementById("editEmployeeModal")
    );
    if (editModal) {
      editModal.hide();
    }

    showToast("success", "Success", "Employee updated successfully");

    loadEmployees();
    return true;
  } catch (error) {
    console.error("Error updating employee:", error);

    let errorMessage = "Failed to update employee";
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }

    showToast("danger", "Error", errorMessage);
    return false;
  }
}

// Delete employee
async function deleteEmployee(employeeId) {
  if (
    !confirm(
      "Are you sure you want to delete this employee? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/employees/${employeeId}`
    );

    showToast("success", "Success", "Employee deleted successfully");

    loadEmployees();
  } catch (error) {
    console.error("Error deleting employee:", error);

    let errorMessage = "Failed to delete employee";
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
  loadEmployees();

  setInterval(updateTime, 1000);
  updateTime();

  const saveEmployeeBtn = document.getElementById("btn-save-employee");
  if (saveEmployeeBtn) {
    saveEmployeeBtn.addEventListener("click", addEmployee);
  }

  const updateEmployeeBtn = document.getElementById("btn-update-employee");
  if (updateEmployeeBtn) {
    updateEmployeeBtn.addEventListener("click", updateEmployee);
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const addEmployeeForm = document.getElementById("addEmployeeForm");
  if (addEmployeeForm) {
    addEmployeeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      addEmployee();
    });
  }

  const editEmployeeForm = document.getElementById("editEmployeeForm");
  if (editEmployeeForm) {
    editEmployeeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      updateEmployee();
    });
  }

  // Search and filter event listeners
  const searchInput = document.getElementById("search-employee");
  if (searchInput) {
    searchInput.addEventListener("input", filterEmployees);
  }

  const filterSelect = document.getElementById("filter-status");
  if (filterSelect) {
    filterSelect.addEventListener("change", filterEmployees);
  }

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl + N to add new employee
    if (e.ctrlKey && e.key === "n") {
      e.preventDefault();
      const addModalBtn = document.querySelector(
        '[data-bs-target="#addEmployeeModal"]'
      );
      if (addModalBtn) {
        addModalBtn.click();
      }
    }

    // Ctrl + F to focus search
    if (e.ctrlKey && e.key === "f") {
      e.preventDefault();
      const searchInput = document.getElementById("search-employee");
      if (searchInput) {
        searchInput.focus();
      }
    }

    // F5 to refresh
    if (e.key === "F5") {
      e.preventDefault();
      loadEmployees();
    }
  });

  // Handle modal show events
  const addModal = document.getElementById("addEmployeeModal");
  if (addModal) {
    addModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("name").focus();
    });
  }

  const editModal = document.getElementById("editEmployeeModal");
  if (editModal) {
    editModal.addEventListener("shown.bs.modal", function () {
      document.getElementById("edit_name").focus();
    });
  }
}

// Initialize when DOM is fully loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializePage);
} else {
  initializePage();
}

// Persistent Daily Equipment Status Management JavaScript
const API_BASE_URL = "http://localhost:3000/api/daily-equipment-status";
let equipmentList = [];
let currentStatus = [];
let historyData = [];

// Initialize date pickers
function initializeDatePickers() {
    flatpickr(".datepicker", {
        dateFormat: "Y-m-d",
        defaultDate: "today",
        maxDate: "today"
    });
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

// Format time
function formatTime(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// Get status icon
function getStatusIcon(status) {
    switch(status) {
        case 'ready': return 'bi-check-circle text-success';
        case 'breakdown': return 'bi-exclamation-triangle text-danger';
        case 'maintenance': return 'bi-tools text-warning';
        case 'standby': return 'bi-pause-circle text-info';
        default: return 'bi-question-circle text-muted';
    }
}

// Get status color class
function getStatusColorClass(status) {
    switch(status) {
        case 'ready': return 'border-start border-2 border-success';
        case 'breakdown': return 'border-start border-2 border-danger';
        case 'maintenance': return 'border-start border-2 border-warning';
        case 'standby': return 'border-start border-2 border-info';
        default: return 'border-start border-2 border-secondary';
    }
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
        timeElement.textContent = `${timeString}`;
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
    
    const element = document.getElementById("last-update-time");
    if (element) {
        element.textContent = timeString;
    }
}

// Load dropdown data
async function loadDropdownData() {
    try {
        const response = await axios.get(`${API_BASE_URL}/dropdowns`);
        equipmentList = response.data.data.equipment || [];
        
        // Populate equipment dropdown in quick update modal
        const equipmentSelect = document.getElementById("quick_equipment_id");
        if (equipmentSelect && equipmentList.length > 0) {
            equipmentSelect.innerHTML = '<option value="">Select Equipment</option>' +
                equipmentList.map(eq => 
                    `<option value="${eq.equipment_id}">${eq.unit_code} - ${eq.equipment_type}</option>`
                ).join('');
        }
        
    } catch (error) {
        console.error("Error loading dropdown data:", error);
    }
}

// Load current equipment status
async function loadCurrentStatus() {
    try {
        const container = document.getElementById("current-status-container");
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading current status...</p>
                </div>
            `;
        }

        const response = await axios.get(`${API_BASE_URL}/current`);
        currentStatus = response.data.data || [];

        // Update stats
        updateStats(currentStatus);

        // Render current status cards
        renderCurrentStatus(currentStatus);
        
        // Update last update time
        updateLastUpdateTime();
        
    } catch (error) {
        console.error("Error loading current status:", error);
        showToast("danger", "Error", "Failed to load current status");

        const container = document.getElementById("current-status-container");
        if (container) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                    <p class="mt-2 text-danger">Failed to load status</p>
                    <button class="btn btn-sm btn-primary mt-2" onclick="loadCurrentStatus()">
                        <i class="bi bi-arrow-clockwise me-1"></i> Try Again
                    </button>
                </div>
            `;
        }
    }
}

// Update statistics
function updateStats(statuses) {
    if (!statuses || statuses.length === 0) {
        document.getElementById("ready-count").textContent = "0";
        document.getElementById("breakdown-count").textContent = "0";
        document.getElementById("maintenance-count").textContent = "0";
        document.getElementById("total-equipment").textContent = "0";
        return;
    }

    // Count by status
    const readyCount = statuses.filter(s => s.current_status === 'ready').length;
    const breakdownCount = statuses.filter(s => s.current_status === 'breakdown').length;
    const maintenanceCount = statuses.filter(s => s.current_status === 'maintenance').length;
    
    document.getElementById("ready-count").textContent = readyCount;
    document.getElementById("breakdown-count").textContent = breakdownCount;
    document.getElementById("maintenance-count").textContent = maintenanceCount;
    document.getElementById("total-equipment").textContent = statuses.length;

    // Update alert badge
    const alertCount = breakdownCount + maintenanceCount;
    const alertBadge = document.getElementById("alert-count");
    const alertsList = document.getElementById("alerts-list");
    
    if (alertBadge) {
        alertBadge.textContent = alertCount;
    }
    
    if (alertsList) {
        if (alertCount > 0) {
            let alertItems = '';
            statuses.filter(s => s.current_status === 'breakdown' || s.current_status === 'maintenance')
                .forEach(equipment => {
                    const statusText = equipment.current_status === 'breakdown' ? 'Breakdown' : 'Maintenance';
                    alertItems += `
                        <li><a class="dropdown-item text-${equipment.current_status === 'breakdown' ? 'danger' : 'warning'}" href="#">
                            <i class="bi ${getStatusIcon(equipment.current_status).split(' ')[1]} me-2"></i>
                            ${equipment.unit_code} - ${statusText}
                        </a></li>
                    `;
                });
            alertsList.innerHTML = alertItems;
        } else {
            alertsList.innerHTML = '<li><a class="dropdown-item" href="#">No alerts</a></li>';
        }
    }
}

// Render current status
function renderCurrentStatus(statuses) {
    const container = document.getElementById("current-status-container");
    if (!container) return;

    if (!statuses || statuses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-truck text-muted fs-1"></i>
                <p class="mt-2 text-muted">No equipment found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="row g-3">
            ${statuses.map((equipment, index) => `
                <div class="col-xl-3 col-lg-4 col-md-6">
                    <div class="card equipment-card h-100 ${getStatusColorClass(equipment.current_status)}" 
                         onclick="viewEquipmentHistory(${equipment.equipment_id})"
                         data-bs-toggle="tooltip" data-bs-title="Click to view history">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="card-title mb-1">
                                        <i class="bi bi-truck me-2"></i>${equipment.unit_code}
                                    </h6>
                                    <p class="card-subtitle text-muted small mb-0">
                                        ${equipment.equipment_type}
                                        ${equipment.model ? ` · ${equipment.model}` : ''}
                                    </p>
                                </div>
                                <span class="badge bg-secondary">
                                    <i class="bi ${getStatusIcon(equipment.current_status)}"></i>
                                </span>
                            </div>
                            
                            <div class="mt-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <span class="fw-semibold">Status:</span>
                                    <span class="badge ${equipment.current_status === 'ready' ? 'bg-success' : 
                                                         equipment.current_status === 'breakdown' ? 'bg-danger' :
                                                         equipment.current_status === 'maintenance' ? 'bg-warning' : 'bg-info'}">
                                        ${equipment.current_status}
                                    </span>
                                </div>
                                
                                ${equipment.location_name ? `
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="fw-semibold">Location:</span>
                                        <span class="location-badge">${equipment.location_name}</span>
                                    </div>
                                ` : ''}
                                
                                ${equipment.remarks ? `
                                    <div class="mt-2">
                                        <small class="text-muted">Remarks:</small>
                                        <p class="mb-0 small">${equipment.remarks}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="mt-3">
                                    <small class="status-duration">
                                        <i class="bi bi-calendar me-1"></i>
                                        ${equipment.status_duration === 'today' ? 
                                          'Updated today' : 
                                          `Status since ${formatDate(equipment.last_updated)}`}
                                    </small>
                                </div>
                            </div>
                            
                            <div class="mt-3">
                                <button class="btn btn-sm btn-outline-primary w-100" 
                                        onclick="event.stopPropagation(); quickUpdateEquipment(${equipment.equipment_id})">
                                    <i class="bi bi-pencil me-1"></i> Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(container.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Quick update for specific equipment
function quickUpdateEquipment(equipmentId) {
    const equipment = equipmentList.find(e => e.equipment_id == equipmentId);
    if (!equipment) return;

    const equipmentSelect = document.getElementById("quick_equipment_id");
    if (equipmentSelect) {
        equipmentSelect.value = equipmentId;
    }

    const modal = new bootstrap.Modal(document.getElementById("quickUpdateModal"));
    modal.show();
}

// Perform quick update
async function performQuickUpdate() {
    const equipmentId = document.getElementById("quick_equipment_id").value;
    const equipmentStatus = document.getElementById("quick_equipment_status").value;
    const remarks = document.getElementById("quick_remarks").value;

    if (!equipmentId || !equipmentStatus) {
        showToast("warning", "Validation", "Please select equipment and status");
        return;
    }

    try {
        const response = await axios.post(`${API_BASE_URL}/quick-update`, {
            equipment_id: equipmentId,
            equipment_status: equipmentStatus,
            remarks: remarks || null
        });

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById("quickUpdateModal"));
        if (modal) {
            modal.hide();
        }
        document.getElementById("quickUpdateForm").reset();

        // Show success message
        showToast("success", "Success", "Equipment status updated successfully");

        // Reload current status
        loadCurrentStatus();
        
    } catch (error) {
        console.error("Error in quick update:", error);
        showToast("danger", "Error", "Failed to update status");
    }
}

// View equipment history
async function viewEquipmentHistory(equipmentId) {
    try {
        const response = await axios.get(`${API_BASE_URL}/history/${equipmentId}`);
        const history = response.data.data || [];
        
        const equipment = equipmentList.find(e => e.equipment_id == equipmentId);
        const equipmentName = equipment ? `${equipment.unit_code} - ${equipment.equipment_type}` : `Equipment ${equipmentId}`;
        
        const container = document.getElementById("equipment-history-container");
        if (container) {
            if (history.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-clock-history text-muted fs-1"></i>
                        <p class="mt-2 text-muted">No status history found for ${equipmentName}</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <h6 class="mb-3">Status History: ${equipmentName}</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Reported</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${history.map((record, index) => `
                                    <tr>
                                        <td>${formatDate(record.date)}</td>
                                        <td>
                                            <span class="badge ${record.equipment_status === 'ready' ? 'bg-success' : 
                                                               record.equipment_status === 'breakdown' ? 'bg-danger' :
                                                               record.equipment_status === 'maintenance' ? 'bg-warning' : 'bg-info'}">
                                                ${record.equipment_status}
                                            </span>
                                        </td>
                                        <td>${record.remarks || '-'}</td>
                                        <td>${formatTime(record.created_at)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

        const modal = new bootstrap.Modal(document.getElementById("historyModal"));
        modal.show();
        
    } catch (error) {
        console.error("Error loading equipment history:", error);
        showToast("danger", "Error", "Failed to load equipment history");
    }
}

// Load status history
async function loadStatusHistory() {

    const historyTab = document.getElementById("history-tab");
    if (historyTab) {
        historyTab.click();
    }
}

// Apply history filters
async function applyHistoryFilters() {
    const date = document.getElementById("history-date").value;
    const status = document.getElementById("history-status").value;
    const type = document.getElementById("history-type").value;

    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status !== 'all') params.append('status', status);
    if (type !== 'all') params.append('type', type);

    try {
        const tbody = document.getElementById("history-table-body");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2 text-muted">Loading history...</p>
                    </td>
                </tr>
            `;
        }

        const response = await axios.get(`${API_BASE_URL}/history?${params}`);
        historyData = response.data.data || [];

        renderHistoryTable(historyData);
        
    } catch (error) {
        console.error("Error loading status history:", error);
        showToast("danger", "Error", "Failed to load history");
    }
}

// Render history table
function renderHistoryTable(history) {
    const tbody = document.getElementById("history-table-body");
    if (!tbody) return;

    if (!history || history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="bi bi-database-x text-muted fs-1"></i>
                    <p class="mt-2 text-muted">No history records found</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = history.map((record) => `
        <tr>
            <td>${formatDate(record.date)}</td>
            <td>
                <div class="fw-semibold">${record.unit_code}</div>
                <small class="text-muted">${record.model || '-'}</small>
            </td>
            <td>${record.equipment_type}</td>
            <td>
                <span class="badge ${record.equipment_status === 'ready' ? 'bg-success' : 
                                   record.equipment_status === 'breakdown' ? 'bg-danger' :
                                   record.equipment_status === 'maintenance' ? 'bg-warning' : 'bg-info'}">
                    ${record.equipment_status}
                </span>
            </td>
            <td>
                <div class="small" style="max-width: 200px;">
                    ${record.remarks || '-'}
                </div>
            </td>
            <td>
                <small class="text-muted">${formatTime(record.created_at)}</small>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" 
                        onclick="deleteStatusRecord(${record.status_id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Load status for specific date
async function loadStatusForDate() {
    const date = document.getElementById("view-date").value;
    if (!date) {
        showToast("warning", "Validation", "Please select a date");
        return;
    }

    try {
        const container = document.getElementById("date-status-container");
        if (container) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading status for ${formatDate(date)}...</p>
                </div>
            `;
        }

        const response = await axios.get(`${API_BASE_URL}/date?date=${date}`);
        const statuses = response.data.data || [];

        renderDateStatus(statuses, date);
        
    } catch (error) {
        console.error("Error loading status for date:", error);
        showToast("danger", "Error", "Failed to load status for date");
    }
}

// Render status for specific date
function renderDateStatus(statuses, date) {
    const container = document.getElementById("date-status-container");
    if (!container) return;

    if (!statuses || statuses.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-calendar-x text-muted fs-1"></i>
                <p class="mt-2 text-muted">No equipment data found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Showing equipment status as of <strong>${formatDate(date)}</strong>. 
            Statuses shown are the most recent reports on or before this date.
        </div>
        
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Status Info</th>
                        <th>Remarks</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    ${statuses.map((equipment) => `
                        <tr>
                            <td>
                                <div class="fw-semibold">${equipment.unit_code}</div>
                                <small class="text-muted">${equipment.model || '-'}</small>
                            </td>
                            <td>${equipment.equipment_type}</td>
                            <td>
                                <span class="badge ${equipment.status_on_date === 'ready' ? 'bg-success' : 
                                                   equipment.status_on_date === 'breakdown' ? 'bg-danger' :
                                                   equipment.status_on_date === 'maintenance' ? 'bg-warning' : 'bg-info'}">
                                    ${equipment.status_on_date}
                                </span>
                            </td>
                            <td>
                                <small class="text-muted">${equipment.status_info}</small>
                            </td>
                            <td>${equipment.remarks || '-'}</td>
                            <td>${equipment.location_name || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Delete status record
async function deleteStatusRecord(statusId) {
    if (!confirm("Are you sure you want to delete this status record? This will remove it from history but won't affect current status.")) {
        return;
    }

    try {
        await axios.delete(`${API_BASE_URL}/${statusId}`);
        showToast("success", "Success", "Status record deleted successfully");
        
        applyHistoryFilters();
        
    } catch (error) {
        console.error("Error deleting status record:", error);
        showToast("danger", "Error", "Failed to delete record");
    }
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
    initializeDatePickers();
    
    loadDropdownData();
    
    loadCurrentStatus();

    setInterval(updateTime, 1000);
    updateTime();

    setInterval(loadCurrentStatus, 60000);

    // Add event listeners
    const quickUpdateBtn = document.getElementById("btn-quick-update");
    if (quickUpdateBtn) {
        quickUpdateBtn.addEventListener("click", performQuickUpdate);
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Add form submit handlers
    const quickUpdateForm = document.getElementById("quickUpdateForm");
    if (quickUpdateForm) {
        quickUpdateForm.addEventListener("submit", function (e) {
            e.preventDefault();
            performQuickUpdate();
        });
    }

    const today = new Date().toISOString().split('T')[0];
    document.getElementById("view-date").value = today;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage);
} else {
    initializePage();
}
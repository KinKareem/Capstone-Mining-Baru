// Shipping Schedule Management JavaScript

let currentEditingId = null;
let schedulesData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function () {
    loadSchedules();
    setupFormSubmission();
});

// Load all shipping schedules
async function loadSchedules() {
    showLoading(true);
    hideMessages();

    try {
        const response = await fetch('/api/shipping-schedules');
        const result = await response.json();

        if (result.success) {
            schedulesData = result.data;
            renderSchedulesTable(schedulesData);
        } else {
            showError('Failed to load shipping schedules: ' + result.message);
        }
    } catch (error) {
        console.error('Error loading schedules:', error);
        showError('Error loading shipping schedules. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Render schedules table
function renderSchedulesTable(schedules) {
    const tbody = document.getElementById('schedulesTableBody');
    tbody.innerHTML = '';

    if (schedules.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-ship fa-2x" style="margin-bottom: 10px; display: block;"></i>
                    No shipping schedules found. Create your first schedule to get started.
                </td>
            </tr>
        `;
        return;
    }

    schedules.forEach(schedule => {
        const row = createScheduleRow(schedule);
        tbody.appendChild(row);
    });
}

// Create a table row for a schedule
function createScheduleRow(schedule) {
    const row = document.createElement('tr');

    const statusClass = getStatusBadgeClass(schedule.status);
    const formattedDate = formatDate(schedule.departure_date);
    const formattedTime = schedule.departure_time || '-';
    const formattedCreated = formatDateTime(schedule.created_at);

    row.innerHTML = `
        <td>${schedule.id}</td>
        <td>${schedule.vessel_name}</td>
        <td>${formattedDate}</td>
        <td>${formattedTime}</td>
        <td>${schedule.destination_port}</td>
        <td>${schedule.cargo_type}</td>
        <td>${parseFloat(schedule.tonnage).toLocaleString()}</td>
        <td><span class="status-badge ${statusClass}">${schedule.status}</span></td>
        <td>${schedule.notes || '-'}</td>
        <td>${formattedCreated}</td>
        <td class="actions">
            <button class="btn btn-secondary btn-sm" onclick="editSchedule(${schedule.id})" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteSchedule(${schedule.id})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    return row;
}

// Get CSS class for status badge
function getStatusBadgeClass(status) {
    const statusMap = {
        'Scheduled': 'status-scheduled',
        'Loading': 'status-loading',
        'Departed': 'status-departed',
        'Arrived': 'status-arrived',
        'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-scheduled';
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show create form modal
function showCreateForm() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = 'Create New Shipping Schedule';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Save Schedule';
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleModal').style.display = 'block';
}

// Edit existing schedule
function editSchedule(id) {
    const schedule = schedulesData.find(s => s.id === id);
    if (!schedule) return;

    currentEditingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Shipping Schedule';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Schedule';

    // Populate form
    document.getElementById('vesselName').value = schedule.vessel_name;
    document.getElementById('cargoType').value = schedule.cargo_type;
    document.getElementById('departureDate').value = schedule.departure_date;
    document.getElementById('departureTime').value = schedule.departure_time || '';
    document.getElementById('destinationPort').value = schedule.destination_port;
    document.getElementById('tonnage').value = schedule.tonnage;
    document.getElementById('status').value = schedule.status;
    document.getElementById('notes').value = schedule.notes || '';

    document.getElementById('scheduleModal').style.display = 'block';
}

// Close modal
function closeModal() {
    document.getElementById('scheduleModal').style.display = 'none';
    document.getElementById('scheduleForm').reset();
    currentEditingId = null;
}

// Setup form submission
function setupFormSubmission() {
    document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(this);
        const scheduleData = {
            vessel_name: formData.get('vessel_name'),
            cargo_type: formData.get('cargo_type'),
            departure_date: formData.get('departure_date'),
            departure_time: formData.get('departure_time') || null,
            destination_port: formData.get('destination_port'),
            tonnage: parseFloat(formData.get('tonnage')),
            status: formData.get('status'),
            notes: formData.get('notes') || null
        };

        try {
            let response;
            if (currentEditingId) {
                // Update existing schedule
                response = await fetch(`/api/shipping-schedules/${currentEditingId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scheduleData)
                });
            } else {
                // Create new schedule
                response = await fetch('/api/shipping-schedules', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scheduleData)
                });
            }

            const result = await response.json();

            if (result.success) {
                showSuccess(result.message);
                closeModal();
                loadSchedules(); // Reload the table
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            showError('Error saving schedule. Please try again.');
        }
    });
}

// Delete schedule
async function deleteSchedule(id) {
    if (!confirm('Are you sure you want to delete this shipping schedule? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/shipping-schedules/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(result.message);
            loadSchedules(); // Reload the table
        } else {
            showError(result.message);
        }
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showError('Error deleting schedule. Please try again.');
    }
}

// Utility functions for UI feedback
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

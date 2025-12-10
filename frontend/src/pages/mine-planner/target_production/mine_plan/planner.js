// =========================
// ROLE & ACCESS CONTROL
// =========================

function getUserRole() {
    try {
        const authUser = localStorage.getItem("authUser");
        if (authUser) {
            const userData = JSON.parse(authUser);

            // Gunakan role_id dan mapping ke role string
            const roleMap = {
                1: "shipper_plan",
                2: "mining_plan"
            };

            return roleMap[userData.role_id] || "mining_plan";
        }
    } catch (error) {
        console.error("Error getting user role:", error);
    }

    return "mining_plan"; // default
}


const USER_ROLE = getUserRole();

// Hak akses per kolom
const FIELD_ACCESS = {
    rainfall_mm: ["shipper_plan", "mining_plan"],
    road_condition: ["mining_plan"],
    max_wave_m: ["shipper_plan"],
    effective_working_hours: ["mining_plan"]
};

// =========================
// API endpoint
// =========================
const API_WEATHER_BASE = "http://localhost:3000/planner/weather";

let tempEditData = {};
let currentWeather = {};
let currentDate = "";

// =========================
// Mapping ke kartu
// =========================
function mapWeatherToCards(data) {
    return [
        {
            category: "Weather",
            label: "Rainfall Forecast (Weekly)",
            value: data.rainfall_mm,
            unit: "mm",
            field: "rainfall_mm"
        },
        {
            category: "Weather",
            label: "Road Condition (Rain Impact)",
            value: data.road_condition,
            unit: "",
            field: "road_condition"
        },
        {
            category: "Weather",
            label: "Max Wave Height",
            value: data.max_wave_m,
            unit: "m",
            field: "max_wave_m"
        },
        {
            category: "Weather",
            label: "Effective Working Hours",
            value: data.effective_working_hours,
            unit: "hours",
            field: "effective_working_hours"
        }
    ];
}

// =========================
// GET /planner/weather
// =========================
async function fetchWeatherData() {
    try {
        const res = await fetch(API_WEATHER_BASE);
        const json = await res.json();

        currentWeather = json.data?.[0] || {};

        currentDate = currentWeather.date;
        return currentWeather;

    } catch (err) {
        console.error("Fetch error:", err);
        return {};
    }
}

// =========================
// PATCH /planner/weather/:date
// =========================
async function saveChanges() {
    try {
        const date = currentDate;

        const endpoint = `${API_WEATHER_BASE}/${date}`;

        console.log("PATCH to:", endpoint, tempEditData);

        const res = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tempEditData)
        });

        if (!res.ok) {
            const err = await res.json();
            alert("❌ Gagal menyimpan: " + err.message);
            return;
        }

        alert("✅ Perubahan berhasil disimpan!");
        tempEditData = {};

    } catch (err) {
        console.error("Save error:", err);
    }
}

// =========================
// RENDER KARTU
// =========================
function renderCards(cards) {
    const wrapper = document.getElementById("card-wrapper");
    wrapper.innerHTML = "";

    cards.forEach(card => {
        const isEditable = FIELD_ACCESS[card.field]?.includes(USER_ROLE);
        const editableClass = isEditable ? "" : "disabled-input";
        const badgeText = isEditable ? "Editable" : "Locked";
        const badgeClass = isEditable ? "editable-tag" : "locked-tag";

        wrapper.innerHTML += `
            <div class="card">
                <div class="card-header">
                    <span>${card.category}</span>
                    <span class="${badgeClass}">${badgeText}</span>
                </div>

                <div class="label">${card.label}</div>

                <input 
                    type="text"
                    ${isEditable ? "" : "disabled"}
                    value="${card.value ?? ''}" 
                    data-field="${card.field}"
                    class="edit-input ${editableClass}"
                />

                <div class="unit-text">${card.unit}</div>
            </div>
        `;
    });

    // hanya input editable yg punya event listener
    document.querySelectorAll(".edit-input").forEach(input => {
        if (!input.disabled) {
            input.addEventListener("input", e => {
                const field = e.target.dataset.field;
                tempEditData[field] = e.target.value;
            });
        }
    });
}

// =========================
// RENDER TOMBOL SAVE
// =========================
function renderSaveButton() {
    document.getElementById("save-btn-wrapper").innerHTML = `
        <button id="save-btn" class="save-button">Save Changes</button>
    `;

    document.getElementById("save-btn").addEventListener("click", saveChanges);
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async () => {
    const weather = await fetchWeatherData();
    const cards = mapWeatherToCards(weather);
    renderCards(cards);
    renderSaveButton();
});

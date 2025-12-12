import { BASE_URL } from "../../../../pages/utils/config.js";
const N8N_TRIGGER =
  "https://pojer26018.app.n8n.cloud/webhook-test/recommendation";
const N8N_SELECTED =
  "https://pojer26018.app.n8n.cloud/webhook-test/selectedcard";

// 🔄 SHOW MODAL
function showModal() {
  const modal = new bootstrap.Modal(document.getElementById("loadingModal"));
  modal.show();
}

function hideModal() {
  const modalEl = document.getElementById("loadingModal");
  const modal = bootstrap.Modal.getInstance(modalEl);
  modal.hide();
}

// 🔄 Refresh page
function refreshPage() {
  location.reload();
}

async function triggerRecommendation() {
  showModal();

  document.getElementById("modal-title").innerText = "Processing...";
  document.getElementById("modal-body").innerHTML = `
        <div class="spinner-border text-primary"></div>
        <p class="mt-3">AI Agent sedang memproses data...</p>
    `;
  document.getElementById("modal-ok-btn").classList.add("d-none");

  try {
    const res = await fetch(N8N_TRIGGER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: "", rejection_note: "" }),
    });

    const start = Date.now();
    document.getElementById("modal-title").innerText = "Processing...";
    document.getElementById("modal-body").innerHTML = `
      <div class="spinner-border text-primary"></div>
      <p class="mt-3">Menunggu rekomendasi AI...</p>
    `;
    while (true) {
      try {
        const r = await fetch(API_RECOMMENDATION, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const arr = Array.isArray(j.scenarios) ? j.scenarios : [];
          if (arr.length) {
            document.getElementById("modal-title").innerText = "Success!";
            document.getElementById("modal-body").innerHTML = `
              <p>Rekomendasi AI tersedia.</p>
            `;
            document.getElementById("modal-ok-btn").classList.remove("d-none");
            break;
          }
        }
      } catch { }
      await sleep(2000);
      if (Date.now() - start > 300000) {
        document.getElementById("modal-title").innerText = "Timeout";
        document.getElementById("modal-body").innerHTML = `
          <p class="text-warning">Belum ada rekomendasi setelah menunggu lama. Coba cek kembali nanti.</p>
        `;
        document.getElementById("modal-ok-btn").classList.remove("d-none");
        break;
      }
    }
  } catch (err) {
    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-body").innerHTML = `
            <p class="text-danger">Gagal memicu AI Agent!</p>
            <p>Periksa koneksi atau server N8N.</p>
        `;
    document.getElementById("modal-ok-btn").classList.remove("d-none");
  }
}

// =======================
// LOAD RECOMMENDATIONS
// =======================
const API_RECOMMENDATION = `${BASE_URL}/ai_recommendation/ai_recommendation`;
const API_OPT_LOGS = `${BASE_URL}/shipping-dashboard/optimization-logs`;
const API_SELECTED = `${BASE_URL}/shipping-dashboard/selected-scenario`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadRecommendation() {
  const container = document.getElementById("recommendation-container");
  container.innerHTML = `<div class="text-center text-muted">Loading...</div>`;

  try {
    const res = await fetch(API_RECOMMENDATION);
    const json = await res.json();

    const scenarios = json.scenarios || [];
    const finalReasoning = json.final_reasoning || null;

    if (scenarios.length === 0) {
      container.innerHTML = `
                <div class="alert alert-warning">Tidak ada data skenario dari AI.</div>
            `;
      return;
    }

    // Hanya bagian scenarioCards yang dimodifikasi, sisanya tetap sama seperti kode original

    const scenarioCards = scenarios
      .map(
        (scn) => `
      <div class="col-md-4">
        <div class="card mb-3 shadow-sm h-100 scenario-card" data-scenario-id="${scn.id}">
          <div class="card-body">
            <h4>
              Scenario ${scn.id}: ${scn.name}
              ${scn.ai_recommended
            ? '<span class="badge bg-warning text-dark ms-2">AI Recommended</span>'
            : ""
          }
            </h4>
            <p><strong>Focus:</strong> ${scn.focus}</p>
            <p><strong>Feasibility:</strong> ${scn.feasibility_score}</p>
            <p><strong>Strategy Summary:</strong> ${scn.strategy_summary}</p>

            <h5>Streng:</h5>
            <ul>${scn.key_pros.map((p) => `<li>${p}</li>`).join("")}</ul>

            <h5>Weakness:</h5>
            <ul>${scn.key_cons.map((c) => `<li>${c}</li>`).join("")}</ul>

            <p><strong>Estimated Production:</strong> ${scn.estimated_production_tons} tons</p>
            
            <!-- INFORMASI TAMBAHAN YANG DITAMBAHKAN -->
            <p><strong>Comparison to User Draft:</strong> ${scn.comparison_to_user_draft}</p>
            
            <div class="alert alert-info mt-2">
              <strong>Financial Implication:</strong><br>
              <small>${scn.financial_implication}</small>
            </div>

            ${scn.role_specific_plan ? `
              <hr>
              <h5 class="mt-3">Role Specific Plans:</h5>
              
              ${scn.role_specific_plan.mine_planner ? `
                <div class="mb-3">
                  <h6 class="text-primary">⛏️ Mine Planner:</h6>
                  <p class="mb-1"><strong>Main Objective:</strong><br>
                    <small>${scn.role_specific_plan.mine_planner.main_objective}</small>
                  </p>
                  <p class="mb-1"><strong>Pit Focus:</strong><br>
                    <small>${scn.role_specific_plan.mine_planner.pit_focus}</small>
                  </p>
                  <p class="mb-1"><strong>Fleet Instruction:</strong><br>
                    <small>${scn.role_specific_plan.mine_planner.fleet_instruction}</small>
                  </p>
                </div>
              ` : ''}
              
              ${scn.role_specific_plan.shipping_planner ? `
                <div class="mb-3">
                  <h6 class="text-success">🚢 Shipping Planner:</h6>
                  <p class="mb-1"><strong>Main Objective:</strong><br>
                    <small>${scn.role_specific_plan.shipping_planner.main_objective}</small>
                  </p>
                  <p class="mb-1"><strong>Berthing Instruction:</strong><br>
                    <small>${scn.role_specific_plan.shipping_planner.berthing_instruction}</small>
                  </p>
                  ${scn.role_specific_plan.shipping_planner.risk_warning ? `
                    <div class="alert alert-warning mt-2 mb-0">
                      <strong>⚠️ Risk Warning:</strong><br>
                      <small>${scn.role_specific_plan.shipping_planner.risk_warning}</small>
                    </div>
                  ` : ''}
                </div>
              ` : ''}
            ` : ''}
          </div>
        </div>
      </div>
    `
      )
      .join("");

    let finalReasonCard = finalReasoning
      ? `
            <div class="col-12 mt-4">
                <div class="card border-primary shadow-sm">
                    <div class="card-body">
                        <h3 class="text-primary">🔍 Final AI Recommendation Summary</h3>
                        <p><strong>Explanation:</strong></p>
                        <p>${finalReasoning.explanation}</p>
                        <p><strong>Trigger Factor:</strong> ${finalReasoning.trigger_factor
      }</p>
                        <p><strong>Selected Scenario:</strong> ${finalReasoning.selected_scenario
      }</p>

                        <h5>Immediate Action Items:</h5>
                        <ul>${finalReasoning.immediate_action_items
        .map((i) => `<li>${i}</li>`)
        .join("")}</ul>
                    </div>
                </div>
            </div>
        `
      : "";

    container.innerHTML = `
            <h2>AI Optimization Scenarios</h2>
            <div class="row">${scenarioCards}</div>
            ${finalReasonCard}
        `;

    enableScenarioSelection();
  } catch (err) {
    container.innerHTML = `
            <div class="alert alert-danger">
                Gagal mengambil data recommendation dari database.
            </div>
        `;
  }
}
loadRecommendation();

async function loadRejectionStatus() {
  const tbody = document.querySelector("#rejectionStatusTable tbody");
  if (!tbody) return;
  try {
    const res = await fetch(API_OPT_LOGS);
    const json = await res.json();
    const rows = Array.isArray(json.data) ? json.data : [];
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-muted">Tidak ada status.</td></tr>`;
      document.getElementById("rejection-banner").innerHTML = "";
      return;
    }
    const mapId = (raw) => {
      try {
        if (typeof raw === "number") return raw;
        if (typeof raw === "string") {
          const s = raw.trim();
          if (s.startsWith("{") || s.startsWith("[")) {
            const o = JSON.parse(s);
            if (o && typeof o === "object") return o.id ?? null;
            return null;
          }
          const n = Number(s);
          return Number.isNaN(n) ? null : n;
        }
        if (raw && typeof raw === "object") return raw.id ?? null;
      } catch { }
      return null;
    };
    const getScenarioName = (row) => {
      try {
        const payload =
          typeof row.scenarios_json === "string"
            ? JSON.parse(row.scenarios_json)
            : row.scenarios_json;
        const list = Array.isArray(payload?.scenarios) ? payload.scenarios : [];
        const id = mapId(row.selected_scenario_id);
        const found = list.find((s) => Number(s.id) === Number(id));
        return found?.name ?? id ?? "-";
      } catch {
        const id = mapId(row.selected_scenario_id);
        return id ?? "-";
      }
    };
    const fmtStep = (row) => {
      const note = String(row.rejection_note ?? "").trim();
      const current = String(row.current_step ?? "").trim();
      if (current === "COMPLETED") return "APPROVED";
      if (note) return "REJECTED";
      if (current) return current;
      const id = mapId(row.selected_scenario_id);
      if (id != null) return row.status ?? "SELECTED";
      return row.status ?? "DRAFT";
    };
    const toRow = (r) => {
      const waktu = r.created_at ?? "-";
      const step = fmtStep(r);
      const scenario = getScenarioName(r);
      const alasan = (r.rejection_note ?? "").toString();
      return `<tr><td>${waktu}</td><td>${step}</td><td>${scenario}</td><td>${alasan || ""
        }</td></tr>`;
    };
    tbody.innerHTML =
      rows.map(toRow).join("") ||
      `<tr><td colspan="4" class="text-muted">Tidak ada status.</td></tr>`;
    const latest = rows[rows.length - 1];
    const bannerEl = document.getElementById("rejection-banner");
    if (bannerEl) {
      const note = String(latest?.rejection_note ?? "").trim();
      if (note) {
        bannerEl.innerHTML = `<div class="alert alert-danger">Scenario terakhir ditolak. Alasan: ${note}</div>`;
      } else {
        const id = mapId(latest?.selected_scenario_id);
        const status = latest?.status ?? "";
        if (id != null && status === "FINAL_APPROVAL") {
          bannerEl.innerHTML = `<div class="alert alert-success">Scenario ${id} disetujui.</div>`;
        } else if (id != null) {
          bannerEl.innerHTML = `<div class="alert alert-info">Scenario ${id} telah dipilih.</div>`;
        } else {
          bannerEl.innerHTML = "";
        }
      }
    }
  } catch {
    const tbody2 = document.querySelector("#rejectionStatusTable tbody");
    if (tbody2)
      tbody2.innerHTML = `<tr><td colspan="4" class="text-danger">Gagal memuat status.</td></tr>`;
  }
}
loadRejectionStatus();

// Expose functions for inline HTML handlers
window.triggerRecommendation = triggerRecommendation;
window.refreshPage = refreshPage;

// Scenario selection
let selectedScenarioId = null;

function enableScenarioSelection() {
  const cards = document.querySelectorAll(".scenario-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => {
        c.classList.remove("selected-card");

        const oldBadge = c.querySelector(".selected-badge");
        if (oldBadge) oldBadge.remove();
      });

      card.classList.add("selected-card");

      const badge = document.createElement("span");
      badge.classList.add("badge", "bg-success", "selected-badge");
      badge.style.position = "absolute";
      badge.innerText = "Selected ✓";

      card.appendChild(badge);

      selectedScenarioId = parseInt(card.dataset.scenarioId);
      document.getElementById("submit-selected-btn").classList.remove("d-none");
      document.getElementById("reject-btn").classList.remove("d-none");
    });
  });
}

// Send Selected Scenario
async function submitSelectedScenario() {
  if (!selectedScenarioId) return alert("Pilih salah satu scenario dulu!");

  showModal();
  document.getElementById("modal-title").innerText = "Processing...";
  document.getElementById("modal-body").innerHTML = `
        <div class="spinner-border text-primary"></div>
        <p class="mt-3">Mengirim scenario terpilih ke AI Agent...</p>
    `;
  document.getElementById("modal-ok-btn").classList.add("d-none");

  try {
    const res = await fetch(N8N_SELECTED, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: "",
        selected_scenario_id: selectedScenarioId,
      }),
    });

    const start = Date.now();
    document.getElementById("modal-title").innerText = "Processing...";
    document.getElementById("modal-body").innerHTML = `
      <div class="spinner-border text-primary"></div>
      <p class="mt-3">Menunggu penyimpanan scenario terpilih...</p>
    `;
    while (true) {
      try {
        const r = await fetch(API_SELECTED, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const d = j.data || {};
          const scn = d.scenario || null;
          if (scn && Number(scn.id) === Number(selectedScenarioId)) {
            document.getElementById("modal-title").innerText = "Success!";
            document.getElementById("modal-body").innerHTML = `
              <p>Scenario <strong>${selectedScenarioId}</strong> tersimpan.</p>
            `;
            document.getElementById("modal-ok-btn").classList.remove("d-none");
            break;
          }
        }
      } catch { }
      await sleep(2000);
      if (Date.now() - start > 300000) {
        document.getElementById("modal-title").innerText = "Timeout";
        document.getElementById("modal-body").innerHTML = `
          <p class="text-warning">Belum terdeteksi penyimpanan scenario. Coba cek kembali nanti.</p>
        `;
        document.getElementById("modal-ok-btn").classList.remove("d-none");
        break;
      }
    }
  } catch (err) {
    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-body").innerHTML = `
            <p class="text-danger">Gagal mengirim scenario ke AI Agent.</p>
        `;
    document.getElementById("modal-ok-btn").classList.remove("d-none");
  }
}

document
  .getElementById("submit-selected-btn")
  .addEventListener("click", submitSelectedScenario);

// Rejection Logic
document.getElementById("reject-btn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("rejectionModal"));
  modal.show();
});

async function submitRejection() {
  const note = document.getElementById("rejection-note").value.trim();

  if (!note) return alert("Tulis alasan penolakan terlebih dahulu!");

  showModal();

  document.getElementById("modal-title").innerText = "Processing Rejection...";
  document.getElementById("modal-body").innerHTML = `
        <div class="spinner-border text-danger"></div>
        <p class="">Mengirim alasan penolakan ke AI Agent...</p>
    `;
  document.getElementById("modal-ok-btn").classList.add("d-none");

  try {
    const res = await fetch(N8N_TRIGGER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan_id: "",
        rejection_note: note,
      }),
    });

    const start = Date.now();
    document.getElementById("modal-title").innerText = "Processing...";
    document.getElementById("modal-body").innerHTML = `
      <div class="spinner-border text-danger"></div>
      <p class="mt-3">Menunggu penolakan tercatat...</p>
    `;
    while (true) {
      try {
        const r = await fetch(API_SELECTED, { cache: "no-store" });
        if (r.ok) {
          const j = await r.json();
          const d = j.data || {};
          const scn = d.scenario || null;
          if (!scn) {
            document.getElementById("modal-title").innerText = "Rejected!";
            document.getElementById("modal-body").innerHTML = `
              <p>Penolakan tercatat. Scenario dihapus.</p>
            `;
            document.getElementById("modal-ok-btn").classList.remove("d-none");
            break;
          }
        }
      } catch { }
      await sleep(2000);
      if (Date.now() - start > 300000) {
        document.getElementById("modal-title").innerText = "Timeout";
        document.getElementById("modal-body").innerHTML = `
          <p class="text-warning">Penolakan belum terdeteksi. Coba cek kembali nanti.</p>
        `;
        document.getElementById("modal-ok-btn").classList.remove("d-none");
        break;
      }
    }
  } catch (err) {
    console.error(err);

    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-body").innerHTML = `
            <p class="text-danger">Gagal mengirim rejection note!</p>
        `;
    document.getElementById("modal-ok-btn").classList.remove("d-none");
  }
}

document
  .getElementById("submit-rejection-btn")
  .addEventListener("click", submitRejection);

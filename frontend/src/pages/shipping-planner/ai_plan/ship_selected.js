import { BASE_URL } from "../../utils/config.js";

const SUMMARY_URL = `${BASE_URL}/ai_summary/ai_summary`;
const SELECTED_SCENARIO_URL = `${BASE_URL}/shipping-dashboard/selected-scenario`;
const N8N_TRIGGER =
  "https://pojer26018.app.n8n.cloud/webhook-test/recommendation";
const N8N_APPROVAL =
  "https://pojer26018.app.n8n.cloud/webhook-test/approval";
const LOGS_URL = `${BASE_URL}/shipping-dashboard/optimization-logs`;

// === Inject CSS langsung dari JS ===
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    #ship-summary {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 24px;
      border: 1px solid #e6e6e6;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      font-family: 'Inter', sans-serif;
    }

    #ship-summary h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    #ship-summary h3 {
      font-size: 1.15rem;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 700;
      color: #d9534f;
    }

    #ship-summary p {
      margin-bottom: 12px;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    #ship-summary strong {
      font-weight: 600;
    }

    #ship-summary ul {
      padding-left: 18px;
    }

    #ship-summary ul li {
      margin-bottom: 6px;
      font-size: 0.92rem;
    }

    /* Alert styling */
    #ship-summary ul li strong {
      color: #333;
    }
  </style>
  `
);

async function loadSummary() {
  const box = document.getElementById("ship-summary");
  try {
    const res = await fetch(SUMMARY_URL);
    const json = await res.json();
    const data = json.data || json; // controller ai_summary mengembalikan {data}
    const fmt = (n) => (n ?? 0).toLocaleString("id-ID");
    box.innerHTML = `
      <h2 class="fw-bold mb-2">AI Situation Analysis</h2>
      <p>${data?.situation_summary ?? "Tidak ada summary"}</p>

      <div class="mt-2">
        <strong>Baseline Target:</strong> ${fmt(
      data?.suggested_baseline_target
    )} tons <br>
        <strong>Current Stockpile:</strong> ${fmt(
      data?.current_stockpile_tons
    )} tons <br>
        <strong>Source:</strong> ${data?.data_source ?? "-"}
      </div>

      <div class="mt-3">
        <h3>⚠️ Alerts</h3>
        <ul class="mb-0">
          <li><strong>Weather:</strong> ${data?.alerts?.weather_alert ?? "-"
      }</li>
          <li><strong>Shipping:</strong> ${data?.alerts?.shipping_alert ?? "-"
      }</li>
          <li><strong>Fleet:</strong> ${data?.alerts?.fleet_alert ?? "-"}</li>
        </ul>
      </div>
    `;
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">Gagal memuat summary</div>`;
  }
}

async function loadSelectedScenario() {
  const box = document.getElementById("selected-scenario");
  try {
    const res = await fetch(SELECTED_SCENARIO_URL);
    const json = await res.json();
    const d = json.data || {};
    const scn = d.scenario;
    if (!scn) {
      box.innerHTML = `<div class="alert alert-warning">Belum ada scenario terpilih. Silakan minta Mining Planner untuk submit recommendation.</div>`;
      return;
    }
    const pros = Array.isArray(scn.key_pros)
      ? scn.key_pros.map((p) => `<li>${p}</li>`).join("")
      : "";
    const cons = Array.isArray(scn.key_cons)
      ? scn.key_cons.map((p) => `<li>${p}</li>`).join("")
      : "";
    // Determine status badge from logs (current_step)
    let statusBadge = "";
    try {
      const lr = await fetch(LOGS_URL);
      const lj = await lr.json();
      const rows = Array.isArray(lj.data) ? lj.data : [];
      const latest = rows[rows.length - 1] || null;
      const step = String(latest?.current_step ?? "").trim();
      if (step === "COMPLETED") statusBadge = `<span class="badge bg-success mb-2">Approved</span>`;
      else if (step === "FINAL_APPROVAL") statusBadge = `<span class="badge bg-primary mb-2">Final Approval</span>`;
    } catch { }

    const badge = scn.ai_recommended
      ? `<span class="badge bg-warning text-dark mb-2">AI Recommended</span>`
      : "";
    box.innerHTML = `
  <div class="card p-4 scenario-card shadow-sm">
    
    <div class="d-flex justify-content-between align-items-start mb-2">
      <h3 class="mb-0">${scn.name}</h3>
      ${badge}
    </div>

    ${statusBadge}

    <hr>

    <div class="row mb-2">
      <div class="col-md-6">
        <p><strong>Focus:</strong><br><small>${scn.focus}</small></p>
      </div>
      <div class="col-md-6">
        <p><strong>Feasibility Score:</strong><br>
          <span class="badge bg-primary">${scn.feasibility_score}</span>
        </p>
      </div>
    </div>

    <div class="mb-3">
      <strong>Strategy Summary:</strong>
      <p class="mb-1">${scn.strategy_summary}</p>
    </div>

    <div class="row mb-3">
      <div class="col-md-6">
        <div class="fw-bold mb-1 text-success">Strengths:</div>
        <ul class="mb-0">${pros}</ul>
      </div>
      <div class="col-md-6">
        <div class="fw-bold mb-1 text-danger">Weaknesses:</div>
        <ul class="mb-0">${cons}</ul>
      </div>
    </div>

    <div class="mb-2">
      <strong>Estimated Production:</strong>
      <span class="badge bg-success ms-2">
        ${scn.estimated_production_tons} tons
      </span>
    </div>

    ${scn.comparison_to_user_draft
        ? `
        <div class="alert alert-secondary mt-3">
          <strong>Comparison to User Draft:</strong><br>
          <small>${scn.comparison_to_user_draft}</small>
        </div>
      `
        : ""
      }

    ${scn.financial_implication
        ? `
        <div class="alert alert-info mt-2">
          <strong>Financial Implication:</strong><br>
          <small>${scn.financial_implication}</small>
        </div>
      `
        : ""
      }

${scn.role_specific_plan
        ? `
    <hr>
    <h5 class="mt-3 mb-3">Role Specific Plans</h5>

    <div class="row g-3">

      <!-- MINE PLANNER (KIRI) -->
      ${scn.role_specific_plan.mine_planner
          ? `
          <div class="col-md-6">
            <div class="card h-100 border-start border-primary border-4">
              <div class="card-body">
                <h6 class="text-primary mb-2">⛏️ Mine Planner</h6>

                <p class="mb-2">
                  <strong>Main Objective:</strong><br>
                  <small>${scn.role_specific_plan.mine_planner.main_objective}</small>
                </p>

                <p class="mb-2">
                  <strong>Pit Focus:</strong><br>
                  <small>${scn.role_specific_plan.mine_planner.pit_focus}</small>
                </p>

                <p class="mb-0">
                  <strong>Fleet Instruction:</strong><br>
                  <small>${scn.role_specific_plan.mine_planner.fleet_instruction}</small>
                </p>
              </div>
            </div>
          </div>
        `
          : ""
        }

      <!-- SHIPPING PLANNER (KANAN) -->
      ${scn.role_specific_plan.shipping_planner
          ? `
          <div class="col-md-6">
            <div class="card h-100 border-start border-success border-4">
              <div class="card-body">
                <h6 class="text-success mb-2">🚢 Shipping Planner</h6>

                <p class="mb-2">
                  <strong>Main Objective:</strong><br>
                  <small>${scn.role_specific_plan.shipping_planner.main_objective}</small>
                </p>

                <p class="mb-2">
                  <strong>Berthing Instruction:</strong><br>
                  <small>${scn.role_specific_plan.shipping_planner.berthing_instruction}</small>
                </p>

                ${scn.role_specific_plan.shipping_planner.risk_warning
            ? `
                    <div class="alert alert-warning mt-2 mb-0 py-2">
                      <strong>⚠️ Risk Warning:</strong><br>
                      <small>${scn.role_specific_plan.shipping_planner.risk_warning}</small>
                    </div>
                  `
            : ""
          }
              </div>
            </div>
          </div>
        `
          : ""
        }

    </div>
  `
        : ""
      }


  </div>
`;
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">Gagal memuat scenario terpilih</div>`;
  }
}

document.getElementById("rejectBtn")?.addEventListener("click", () => {
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
    <p class="mt-3">Mengirim alasan penolakan ke AI Agent...</p>
  `;
  document.getElementById("modal-ok-btn").classList.add("d-none");
  try {
    const res = await fetch(N8N_TRIGGER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: "", rejection_note: note }),
    });
    const text = await res.text();
    let ok = res.ok;
    if (text && text.length) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) ok = json[0]?.success === true || res.ok;
        else if (typeof json === "object" && json !== null)
          ok = json.success === true || res.ok;
      } catch { }
    }
    if (ok) {
      document.getElementById("modal-title").innerText = "Rejected!";
      document.getElementById("modal-body").innerHTML = `
        <p>Rejection note berhasil dikirim ke AI Agent.</p>
        <p>Scenario terpilih telah dihapus. Gunakan tombol <strong>Refresh Scenario</strong> ketika Mining mengirim pembaruan.</p>
      `;
      document.getElementById("modal-ok-btn").classList.remove("d-none");
      const box = document.getElementById("selected-scenario");
      box.innerHTML = `<div class="alert alert-info">Scenario dihapus. Menunggu pembaruan dari Mining...</div>`;
    } else {
      document.getElementById("modal-title").innerText = "Error!";
      document.getElementById("modal-body").innerHTML = `
        <p class="text-danger">Gagal mengirim rejection note!</p>
        <p>Status: ${res.status}</p>
        <pre class="mt-2">${text || ""}</pre>
      `;
      document.getElementById("modal-ok-btn").classList.remove("d-none");
    }
  } catch (e) {
    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-body").innerHTML = `
      <p class="text-danger">Gagal mengirim rejection note!</p>
    `;
    document.getElementById("modal-ok-btn").classList.remove("d-none");
  }
}

document
  .getElementById("submit-rejection-btn")
  ?.addEventListener("click", submitRejection);
document.getElementById("modal-ok-btn")?.addEventListener("click", hideModal);

document
  .getElementById("refreshScenarioBtn")
  ?.addEventListener("click", async () => {
    const box = document.getElementById("selected-scenario");
    box.innerHTML = `<div class="text-muted">Memuat scenario terpilih...</div>`;
    await loadSelectedScenario();
  });

// Approve handler
document.getElementById("approveBtn")?.addEventListener("click", async () => {
  showModal();
  document.getElementById("modal-title").innerText = "Processing Approval...";
  document.getElementById("modal-body").innerHTML = `
    <div class="spinner-border text-success"></div>
    <p class="mt-3">Mengirim approval ke AI Agent...</p>
  `;
  document.getElementById("modal-ok-btn").classList.add("d-none");

  try {
    const res = await fetch(N8N_APPROVAL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: "", current_step: "approve" }),
    });
    const text = await res.text();
    let ok = res.ok;
    if (text && text.length) {
      try {
        const json = JSON.parse(text);
        if (Array.isArray(json)) ok = json[0]?.success === true || res.ok;
        else if (typeof json === "object" && json !== null)
          ok = json.success === true || res.ok;
      } catch { }
    }
    if (ok) {
      document.getElementById("modal-title").innerText = "Approved!";
      document.getElementById("modal-body").innerHTML = `
        <p>Scenario telah di-approve dan ditandai Completed.</p>
      `;
      document.getElementById("modal-ok-btn").classList.remove("d-none");
      await loadSelectedScenario();
    } else {
      document.getElementById("modal-title").innerText = "Error!";
      document.getElementById("modal-body").innerHTML = `
        <p class="text-danger">Gagal mengirim approval!</p>
        <pre class="mt-2">${text || ""}</pre>
      `;
      document.getElementById("modal-ok-btn").classList.remove("d-none");
    }
  } catch (e) {
    document.getElementById("modal-title").innerText = "Error!";
    document.getElementById("modal-body").innerHTML = `
      <p class="text-danger">Gagal mengirim approval!</p>
    `;
    document.getElementById("modal-ok-btn").classList.remove("d-none");
  }
});

loadSummary();
loadSelectedScenario();
function showModal() {
  const modal = new bootstrap.Modal(document.getElementById("loadingModal"));
  modal.show();
}

function hideModal() {
  const el = document.getElementById("loadingModal");
  const modal = bootstrap.Modal.getInstance(el);
  modal?.hide();
}

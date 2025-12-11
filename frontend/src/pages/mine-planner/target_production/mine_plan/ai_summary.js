import { BASE_URL } from "../../../../pages/utils/config.js";
const API_SUMMARY = `${BASE_URL}/ai_summary/ai_summary`;

// === Inject CSS langsung dari JS ===
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    #summary-container {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px 24px;
      border: 1px solid #e6e6e6;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      font-family: 'Inter', sans-serif;
    }

    #summary-container h2 {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    #summary-container h3 {
      font-size: 1.15rem;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 700;
      color: #d9534f;
    }

    #summary-container p {
      margin-bottom: 12px;
      line-height: 1.5;
      font-size: 0.95rem;
    }

    #summary-container strong {
      font-weight: 600;
    }

    #summary-container ul {
      padding-left: 18px;
    }

    #summary-container ul li {
      margin-bottom: 6px;
      font-size: 0.92rem;
    }

    /* Alert styling */
    #summary-container ul li strong {
      color: #333;
    }
  </style>
  `
);

// === JS UTAMA ===
async function loadSummary() {
  const box = document.getElementById("summary-container");

  try {
    const res = await fetch(API_SUMMARY);
    const json = await res.json();

    const data = json.data;

    if (data) {
      box.innerHTML = `
        <h2>AI Situation Analysis</h2>
        <p>${data.situation_summary}</p>

        <strong>Baseline Target:</strong> ${data.suggested_baseline_target} tons <br>
        <strong>Current Stockpile:</strong> ${data.current_stockpile_tons} tons <br>
        <strong>Source:</strong> ${data.data_source}<br>

        <h3>⚠️ Alerts</h3>
        <ul>
          <li><strong>Weather:</strong> ${data.alerts?.weather_alert}</li>
          <li><strong>Shipping:</strong> ${data.alerts?.shipping_alert}</li>
          <li><strong>Fleet:</strong> ${data.alerts?.fleet_alert}</li>
        </ul>
      `;
      return;
    }

    // NULL fallback
    box.innerHTML = fallbackHTML();

  } catch (err) {
    console.error("Error:", err);
    box.innerHTML = fallbackHTML();
  }
}

function fallbackHTML() {
  return `
    <h2>AI Situation Analysis</h2>
    <p>Market demands null tons. Fleet potential is null tons/day. However, null weather conditions will derate productivity to null tons/day. We project a null against the shipping schedule.</p>

    <strong>Baseline Target:</strong> null tons <br>
    <strong>Current Stockpile:</strong> null tons <br>
    <strong>Source:</strong> null<br>

    <h3>⚠️ Alerts</h3>
    <ul>
      <li><strong>Weather:</strong> null</li>
      <li><strong>Shipping:</strong> null</li>
      <li><strong>Fleet:</strong> null</li>
    </ul>
  `;
}

loadSummary();

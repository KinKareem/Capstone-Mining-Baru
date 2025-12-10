import { BASE_URL } from "../../../../pages/utils/config.js";
const API_SUMMARY = `${BASE_URL}/ai_summary/ai_summary`;

async function loadSummary() {
  const box = document.getElementById("summary-container");

  try {
    const res = await fetch(API_SUMMARY);
    const json = await res.json();

    const data = json.data;
    if (data) {
      box.innerHTML = `
        <h2>🤖 AI Situation Analysis</h2>
        <p>${data.situation_summary}</p>
        <br>
        <strong>Baseline Target:</strong> ${data.suggested_baseline_target} tons <br>
        <strong>Current Stockpile:</strong> ${data.current_stockpile_tons} tons <br>
        <strong>Source:</strong> ${data.data_source}<br><br>
        <h3>⚠️ Alerts</h3>
        <ul>
          <li><strong>Weather:</strong> ${data.alerts?.weather_alert}</li>
          <li><strong>Shipping:</strong> ${data.alerts?.shipping_alert}</li>
          <li><strong>Fleet:</strong> ${data.alerts?.fleet_alert}</li>
        </ul>
      `;
      return;
    }
    box.innerHTML = `
      <h2>🤖 AI Situation Analysis</h2>
      <p>Market demands null tons. Fleet potential is null tons/day. However, null weather conditions will derate productivity to null tons/day. We project a null against the shipping schedule.</p>
      <br>
      <strong>Baseline Target:</strong> null tons <br>
      <strong>Current Stockpile:</strong> null tons <br>
      <strong>Source:</strong> null<br><br>
      <h3>⚠️ Alerts</h3>
      <ul>
        <li><strong>Weather:</strong> null</li>
        <li><strong>Shipping:</strong> null</li>
        <li><strong>Fleet:</strong> null</li>
      </ul>
    `;
  } catch (err) {
    console.error("Error:", err);
    box.innerHTML = `
      <h2>🤖 AI Situation Analysis</h2>
      <p>Market demands null tons. Fleet potential is null tons/day. However, null weather conditions will derate productivity to null tons/day. We project a null against the shipping schedule.</p>
      <br>
      <strong>Baseline Target:</strong> null tons <br>
      <strong>Current Stockpile:</strong> null tons <br>
      <strong>Source:</strong> null<br><br>
      <h3>⚠️ Alerts</h3>
      <ul>
        <li><strong>Weather:</strong> null</li>
        <li><strong>Shipping:</strong> null</li>
        <li><strong>Fleet:</strong> null</li>
      </ul>
    `;
  }
}

loadSummary();

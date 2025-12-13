import "../../../style/login_regis.css";
import { postAuth } from "../../utils/api.js";

const roleParam = new URLSearchParams(window.location.search).get("role");
const roleMap = {
  shipper_planner: 1,
  mining_planner: 2,
};
const roleId = roleMap[roleParam] ?? null;

const updatePageTitle = () => {
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    const roleTitle =
      roleParam === "shipper_planner"
        ? "Shipper Planner"
        : roleParam === "mining_planner"
          ? "Mining Planner"
          : "Planner";
    const roleIcon =
      roleParam === "shipper_planner"
        ? "/assets/Port.png"
        : roleParam === "mining_planner"
          ? "/assets/Oil Pump.png"
          : "";
    pageTitle.innerHTML = `${roleIcon
      ? ``
      : ""
      }<span>Register ${roleTitle}</span>`;
  }
};
updatePageTitle();

function setMessage(el, text, type = "info") {
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
}

const registerForm = document.getElementById("register-form");
const registerMsg = document.getElementById("register-message");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!roleId) {
      setMessage(
        registerMsg,
        "Role tidak valid. Kembali dan pilih role.",
        "error"
      );
      return;
    }

    const formData = new FormData(registerForm);
    const username = formData.get("username")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password");

    if (!username || !email || !password) {
      setMessage(registerMsg, "Semua kolom harus diisi.", "error");
      return;
    }

    try {
      setMessage(registerMsg, "Memproses pendaftaran...", "info");

      // Menggunakan utilitas postAuth
      await postAuth("/register", {
        username,
        email,
        password,
        role_id: roleId,
      });

      setMessage(
        registerMsg,
        "Pendaftaran berhasil! Silakan login.",
        "success"
      );

      setTimeout(() => {
        window.location.href = `/src/pages/auth/login/login.html?role=${encodeURIComponent(roleParam)}`;
      }, 1200);

      registerForm.reset();
    } catch (err) {
      setMessage(registerMsg, err.message, "error");
    }
  });
}

const loginLink = document.getElementById("login-link");
if (loginLink) {
  const roleQuery = roleParam ? `?role=${encodeURIComponent(roleParam)}` : "";
  loginLink.setAttribute(
    "href",
    `/src/pages/auth/login/login.html${roleQuery}`
  );
}

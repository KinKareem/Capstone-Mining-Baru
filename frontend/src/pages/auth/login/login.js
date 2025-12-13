import "../../../style/login_regis.css";
import { postAuth } from "../../utils/api.js";
import { putAccessToken } from "../../utils/auth.js";
import { ROLE_ID_KEY } from "../../utils/config.js";

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
      }<span>Login ${roleTitle}</span>`;
  }
};

// Panggil fungsi update title
updatePageTitle();

function setMessage(el, text, type = "info") {
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
}

const loginForm = document.getElementById("login-form");
const loginMsg = document.getElementById("login-message");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!roleId) {
      setMessage(
        loginMsg,
        "Role tidak valid. Kembali dan pilih role.",
        "error"
      );
      return;
    }

    const formData = new FormData(loginForm);
    const email = formData.get("email")?.trim();
    const password = formData.get("password");

    if (!email || !password) {
      setMessage(loginMsg, "Semua kolom harus diisi.", "error");
      return;
    }

    try {
      setMessage(loginMsg, "Memproses login...", "info");

      const data = await postAuth("/login", {
        email,
        password,
        role_id: roleId,
      });

      const token = data?.token;
      if (token) {
        // Gunakan putAccessToken dari auth.js
        putAccessToken(token);
        localStorage.setItem("authUser", JSON.stringify(data?.user || {}));
        try {
          localStorage.setItem(ROLE_ID_KEY, String(roleId));
        } catch { }

        setMessage(loginMsg, "Login berhasil! Mengalihkan...", "success");

        // Redirect berdasarkan role
        let redirectPath = "/index.html";
        if (roleId === 1) {
          redirectPath =
            "/src/pages/shipping-planner/home/home_shipping_page.html";
        } else if (roleId === 2) {
          redirectPath = "/src/pages/mine-planner/home/home_planner_page.html";
        }

        setTimeout(() => {
          window.location.href = redirectPath;
        }, 1000);
      } else {
        setMessage(loginMsg, "Token tidak diterima dari server.", "error");
      }
    } catch (err) {
      setMessage(loginMsg, err.message, "error");
    }
  });
}

const registerLink = document.getElementById("register-link");
if (registerLink && roleParam) {
  registerLink.href = `/src/pages/auth/register/register.html?role=${roleParam}`;
}

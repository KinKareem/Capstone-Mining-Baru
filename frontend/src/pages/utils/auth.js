import { ACCESS_TOKEN_KEY, ROLE_ID_KEY } from "./config.js";

const getActiveRoute = () => {
  const hash = window.location.hash;
  return hash ? hash.replace("#", "") : window.location.pathname;
};

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error:", error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error:", error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error("removeAccessToken: error:", error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ["/login", "/register"];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    window.location.href = "/index.html";
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    window.location.href = "/src/pages/auth/login/login.html";
    return null;
  }

  return page;
}

export function getLogout() {
  removeAccessToken();
}

export function getUserRoleId() {
  try {
    const stored = localStorage.getItem(ROLE_ID_KEY);
    if (stored && stored !== "null" && stored !== "undefined") {
      return Number(stored);
    }
    const userRaw = localStorage.getItem("authUser");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      const candidate = user?.role_id ?? user?.roleId ?? user?.role;
      if (candidate !== undefined && candidate !== null) {
        const n = Number(candidate);
        if (!Number.isNaN(n)) return n;
      }
    }
    return null;
  } catch (error) {
    console.error("getUserRoleId: error:", error);
    return null;
  }
}

export function ensureRoleAccess(required) {
  const requiredMap = {
    "shipping-planner": 1,
    "mine-planner": 2,
  };
  const requiredId = requiredMap[required];
  const token = getAccessToken();
  if (!token) {
    window.location.href = "/src/pages/auth/login/login.html";
    return null;
  }
  const roleId = getUserRoleId();
  if (!roleId || !requiredId) {
    return required;
  }
  if (roleId !== requiredId) {
    const redirect =
      roleId === 1
        ? "/src/pages/shipping-planner/home/home_shipping_page.html"
        : "/src/pages/mine-planner/home/home_planner_page.html";
    window.location.href = redirect;
    return null;
  }
  return required;
}

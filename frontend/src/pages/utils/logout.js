export function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("authUser");
  window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutButton = document.getElementById("logout-btn");
  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }
});

const user = JSON.parse(
  localStorage.getItem("user")
);

document.getElementById(
  "userEmail"
).textContent =
  user?.email || "";

document
  .getElementById("logoutBtn")
  .addEventListener("click", () => {

    localStorage.clear();

    window.location.href =
      "login.html";
});
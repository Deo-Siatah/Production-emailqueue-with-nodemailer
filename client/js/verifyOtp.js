const form = document.getElementById("otpForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = localStorage.getItem("email");

  const otp = document
    .getElementById("otp")
    .value;

  const response = await fetch(
    "http://localhost:5000/api/auth/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp,
      }),
      credentials: "include",
    }
  );

  const result = await response.json();

  if (response.ok) {

    localStorage.setItem(
      "user",
      JSON.stringify(result.user)
    );

    window.location.href = "home.html";

  } else {
    alert(result.message);
  }
});
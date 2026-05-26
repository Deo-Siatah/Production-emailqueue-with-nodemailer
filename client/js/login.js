const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: form.email.value,
    password: form.password.value,
  };

  const response = await fetch(
    "http://localhost:5000/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    }
  );

  const result = await response.json();

  if (response.ok) {
    localStorage.setItem("email", data.email);
    window.location.href = "verify-otp.html";
  } else {
    alert(result.message);
  }
});
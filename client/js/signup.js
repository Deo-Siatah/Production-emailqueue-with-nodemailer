const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
  };

  const response = await fetch(
    "http://localhost:5000/api/auth/signup",
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
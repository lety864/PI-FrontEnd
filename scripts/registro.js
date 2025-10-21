
document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Evita el envío normal del formulario

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const alertMessage = document.getElementById("alertMessage");

  // Validar número de teléfono (exactamente 10 dígitos)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alertMessage.classList.remove("d-none", "alert-success");
    alertMessage.classList.add("alert-danger");
    alertMessage.textContent = "Ingrese un número de teléfono válido (10 dígitos).";
    return;
  }

  // Validar contraseñas iguales
  if (password !== confirmPassword) {
    alertMessage.classList.remove("d-none", "alert-success");
    alertMessage.classList.add("alert-danger");
    alertMessage.textContent = "Ingrese la contraseña correcta.";
    return;
  }

  // Si todo está correcto, guardar en localStorage
  const userData = {
    nombre: fullname,
    correo: email,
    telefono: phone,
    contraseña: password
  };

  localStorage.setItem("usuarioRegistrado", JSON.stringify(userData));

  // Mostrar mensaje de éxito
  alertMessage.classList.remove("d-none", "alert-danger");
  alertMessage.classList.add("alert-success");
  alertMessage.textContent = "¡Su registro fue exitoso! Redirigiendo...";

  // Redirigir después de 2 segundos
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
});

// Mostrar/ocultar contraseña
document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  eyeIcon.classList.toggle("bi-eye-slash");
});

document.getElementById("toggleConfirmPassword").addEventListener("click", () => {
  const confirmInput = document.getElementById("confirmPassword");
  const eyeIcon = document.getElementById("eyeIconConfirm");
  const type = confirmInput.getAttribute("type") === "password" ? "text" : "password";
  confirmInput.setAttribute("type", type);
  eyeIcon.classList.toggle("bi-eye-slash");
});
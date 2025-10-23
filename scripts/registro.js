document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault();

  // Obtener valores
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const alertMessage = document.getElementById("alertMessage");

  // Limpiar estados anteriores
  clearValidationStates();

  // Validar nombre completo ( solo letras y espacios)
  const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,}$/;
  const nameWords = fullname.split(' ').filter(word => word.length > 0);
  
  if (!nameRegex.test(fullname) || nameWords.length < 2) {
    showError(alertMessage, "Ingrese su nombre completo (nombre y apellido, mínimo 3 caracteres).");
    markFieldInvalid("fullname");
    return;
  }

  // Validar correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(alertMessage, "Ingrese un correo electrónico válido.");
    markFieldInvalid("username");
    return;
  }

  // Validar número de teléfono (exactamente 10 dígitos)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    showError(alertMessage, "Ingrese un número de teléfono válido (10 dígitos).");
    markFieldInvalid("phone");
    return;
  }

  // Validar longitud de contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
    markFieldInvalid("password");
    return;
  }

  // Validar fortaleza de contraseña (mayúscula, minúscula, número)
  const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordStrength.test(password)) {
    showError(alertMessage, "La contraseña debe contener al menos una mayúscula, una minúscula y un número.");
    markFieldInvalid("password");
    return;
  }

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    showError(alertMessage, "Las contraseñas no coinciden.");
    markFieldInvalid("confirmPassword");
    return;
  }

  // Validar que el correo no esté registrado
  const existingUser = localStorage.getItem("usuarioRegistrado");
  if (existingUser) {
    const userData = JSON.parse(existingUser);
    if (userData.correo === email) {
      showError(alertMessage, "Este correo electrónico ya está registrado.");
      markFieldInvalid("username");
      return;
    }
  }

  // Si todas las validaciones pasan, guardar datos
  const newUserData = {
    nombre: fullname,
    correo: email,
    telefono: phone,
    contraseña: password,
    fechaRegistro: new Date().toISOString()
  };

  localStorage.setItem("usuarioRegistrado", JSON.stringify(newUserData));

  // Mostrar mensaje de éxito
  showSuccess(alertMessage, "¡Registro exitoso! Redirigiendo al inicio de sesión...");

  // Limpiar formulario
  document.getElementById("registerForm").reset();

  // Redirigir después de 2 segundos
  setTimeout(() => {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    loginModal.show();
  }, 2000);
});

// Función para mostrar errores
function showError(element, message) {
  element.classList.remove("d-none", "alert-success");
  element.classList.add("alert-danger");
  element.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${message}`;
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    element.classList.add("d-none");
  }, 5000);
}

// Función para mostrar éxito
function showSuccess(element, message) {
  element.classList.remove("d-none", "alert-danger");
  element.classList.add("alert-success");
  element.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
}

// Marcar campo como inválido
function markFieldInvalid(fieldId) {
  const field = document.getElementById(fieldId);
  field.classList.add("is-invalid");
  field.focus();
}

// Limpiar estados de validación
function clearValidationStates() {
  const fields = ["fullname", "username", "phone", "password", "confirmPassword"];
  fields.forEach(fieldId => {
    document.getElementById(fieldId).classList.remove("is-invalid", "is-valid");
  });
}

// Validación en tiempo real
document.getElementById("fullname").addEventListener("blur", function() {
  const value = this.value.trim();
  const nameWords = value.split(' ').filter(word => word.length > 0);
  const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,}$/;
  
  if (value && (!nameRegex.test(value) || nameWords.length < 2)) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (value) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  }
});

document.getElementById("username").addEventListener("blur", function() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (this.value && !emailRegex.test(this.value.trim())) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  }
});

document.getElementById("phone").addEventListener("blur", function() {
  const phoneRegex = /^[0-9]{10}$/;
  if (this.value && !phoneRegex.test(this.value.trim())) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  }
});

document.getElementById("password").addEventListener("input", function() {
  const password = this.value;
  const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  
  if (password.length >= 8 && passwordStrength.test(password)) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else if (password.length > 0) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  }
});

document.getElementById("confirmPassword").addEventListener("input", function() {
  const password = document.getElementById("password").value;
  const confirmPassword = this.value;
  
  if (confirmPassword && confirmPassword === password) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else if (confirmPassword) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  }
});

// Mostrar/ocultar contraseña
document.getElementById("togglePassword").addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  eyeIcon.classList.toggle("bi-eye");
  eyeIcon.classList.toggle("bi-eye-slash");
});

document.getElementById("toggleConfirmPassword").addEventListener("click", () => {
  const confirmInput = document.getElementById("confirmPassword");
  const eyeIcon = document.getElementById("eyeIconConfirm");
  const type = confirmInput.getAttribute("type") === "password" ? "text" : "password";
  confirmInput.setAttribute("type", type);
  eyeIcon.classList.toggle("bi-eye");
  eyeIcon.classList.toggle("bi-eye-slash");
});
// Limpiar formulario y mensajes cuando se abre/cierra el modal
const registerModal = document.getElementById('registerModal');
registerModal.addEventListener('hidden.bs.modal', function () {
  // Limpiar formulario
  document.getElementById("registerForm").reset();
  
  // Limpiar mensaje de alerta
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.classList.add("d-none");
  alertMessage.classList.remove("alert-success", "alert-danger");
  alertMessage.innerHTML = "";
  
  // Limpiar estados de validación
  clearValidationStates();
});

registerModal.addEventListener('show.bs.modal', function () {
  // Limpiar mensaje de alerta al abrir el modal
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.classList.add("d-none");
  alertMessage.classList.remove("alert-success", "alert-danger");
  alertMessage.innerHTML = "";
  
  // Limpiar estados de validación
  clearValidationStates();
});
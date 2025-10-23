// ========================================
// MODELO DE USUARIO
// ========================================
class UsuarioModel {
  constructor(data) {
    this.id = this.generarId();
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.telefono = data.telefono || '';
    this.contraseña = data.contraseña || '';
    this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  // Generar ID único
  generarId() {
    return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Convertir a JSON
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      contraseña: this.contraseña,
      fechaRegistro: this.fechaRegistro,
      activo: this.activo
    };
  }

  // Mostrar en consola con formato
  mostrarEnConsola() {
    console.log('═══════════════════════════════════════════════════');
    console.log('NUEVO USUARIO REGISTRADO');
    console.log('═══════════════════════════════════════════════════');
    console.log('ID:', this.id);
    console.log('Nombre:', this.nombre);
    console.log('Correo:', this.correo);
    console.log('Teléfono:', this.telefono);
    console.log('Contraseña:', '*'.repeat(this.contraseña.length) + ' (oculta por seguridad)');
    console.log('Fecha de Registro:', new Date(this.fechaRegistro).toLocaleString('es-MX'));
    console.log('Estado:', this.activo ? 'Activo' : 'Inactivo');
    console.log('═══════════════════════════════════════════════════');
    console.log('Objeto JSON Completo:');
    console.log(JSON.stringify(this.toJSON(), null, 2));
    console.log('═══════════════════════════════════════════════════');
  }
}

// ========================================
// VALIDACIÓN Y REGISTRO DEL FORMULARIO
// ========================================
document.getElementById("registerForm").addEventListener("submit", function(event) {
  event.preventDefault();

  console.log('Procesando registro...');

  // Obtener valores del formulario
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const alertMessage = document.getElementById("alertMessage");

  // Limpiar estados anteriores
  clearValidationStates();

  // ========== VALIDACIONES ==========

  // 1. Validar nombre completo (solo letras y espacios)
  const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,}$/;
  const nameWords = fullname.split(' ').filter(word => word.length > 0);
  
  if (!nameRegex.test(fullname) || nameWords.length < 2) {
    showError(alertMessage, "Ingrese su nombre completo (nombre y apellido, mínimo 3 caracteres).");
    markFieldInvalid("fullname");
    console.error('Validación fallida: Nombre incompleto');
    return;
  }

  // 2. Validar correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(alertMessage, "Ingrese un correo electrónico válido.");
    markFieldInvalid("username");
    console.error('Validación fallida: Email inválido');
    return;
  }

  // 3. Validar número de teléfono (exactamente 10 dígitos)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    showError(alertMessage, "Ingrese un número de teléfono válido (10 dígitos).");
    markFieldInvalid("phone");
    console.error('Validación fallida: Teléfono inválido');
    return;
  }

  // 4. Validar longitud de contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
    markFieldInvalid("password");
    console.error('Validación fallida: Contraseña muy corta');
    return;
  }

  // 5. Validar fortaleza de contraseña (mayúscula, minúscula, número)
  const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordStrength.test(password)) {
    showError(alertMessage, "La contraseña debe contener al menos una mayúscula, una minúscula y un número.");
    markFieldInvalid("password");
    console.error('Validación fallida: Contraseña débil');
    return;
  }

  // 6. Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    showError(alertMessage, "Las contraseñas no coinciden.");
    markFieldInvalid("confirmPassword");
    console.error('Validación fallida: Contraseñas no coinciden');
    return;
  }

  // 7. Validar que el correo no esté registrado
  const existingUser = localStorage.getItem("usuarioRegistrado");
  if (existingUser) {
    const userData = JSON.parse(existingUser);
    if (userData.correo === email) {
      showError(alertMessage, "Este correo electrónico ya está registrado.");
      markFieldInvalid("username");
      console.error('Validación fallida: Email ya registrado');
      return;
    }
  }

  console.log('Todas las validaciones pasadas');

  // ========== CREAR MODELO DE USUARIO ==========
  const nuevoUsuario = new UsuarioModel({
    nombre: fullname,
    correo: email,
    telefono: phone,
    contraseña: password
  });

  // ========== MOSTRAR EN CONSOLA ==========
  console.log('\n');
  nuevoUsuario.mostrarEnConsola();
  
  // También mostrar como tabla
  console.log('\nVista en Tabla:');
  console.table([{
    'ID': nuevoUsuario.id,
    'Nombre': nuevoUsuario.nombre,
    'Correo': nuevoUsuario.correo,
    'Teléfono': nuevoUsuario.telefono,
    'Fecha': new Date(nuevoUsuario.fechaRegistro).toLocaleString('es-MX'),
    'Estado': nuevoUsuario.activo ? 'Activo' : 'Inactivo'
  }]);

  // Guardar en localStorage
  localStorage.setItem("usuarioRegistrado", JSON.stringify(nuevoUsuario.toJSON()));
  console.log('Usuario guardado en localStorage');

  // Mostrar mensaje de éxito
  showSuccess(alertMessage, "¡Registro exitoso! Redirigiendo a la página principal...");

  // Limpiar formulario
  document.getElementById("registerForm").reset();

  // Redirigir a la página principal después de 2 segundos
  setTimeout(() => {
    console.log('Redirigiendo...');
    window.location.href = "index.html";
  }, 2000);
});

// ========================================
// FUNCIONES AUXILIARES
// ========================================

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
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid", "is-valid");
    }
  });
}

// ========================================
// VALIDACIÓN EN TIEMPO REAL
// ========================================

// Validar nombre completo
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

// Validar correo electrónico
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

// Validar teléfono
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

// Validar contraseña
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

// Validar confirmación de contraseña
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

// ========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ========================================

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

// ========================================
// LIMPIAR MODAL AL CERRAR/ABRIR
// ========================================

const registerModal = document.getElementById('registerModal');

// Limpiar al cerrar
registerModal.addEventListener('hidden.bs.modal', function () {
  console.log('Modal de registro cerrado');
  
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

// Limpiar al abrir
registerModal.addEventListener('show.bs.modal', function () {
  console.log('Modal de registro abierto');
  
  // Limpiar mensaje de alerta
  const alertMessage = document.getElementById("alertMessage");
  alertMessage.classList.add("d-none");
  alertMessage.classList.remove("alert-success", "alert-danger");
  alertMessage.innerHTML = "";
  
  // Limpiar estados de validación
  clearValidationStates();
});

// ========================================
// CONTROLAR VIDEO DEL MODAL
// ========================================

registerModal.addEventListener('shown.bs.modal', function () {
  const video = document.getElementById('registerVideo');
  if (video) {
    video.play().catch(err => console.log('Video autoplay prevented:', err));
  }
});

registerModal.addEventListener('hidden.bs.modal', function () {
  const video = document.getElementById('registerVideo');
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
});

// ========================================
// FUNCIONES DE UTILIDAD PARA CONSOLA
// ========================================

// Ver usuarios registrados
function verUsuariosRegistrados() {
  const usuario = localStorage.getItem("usuarioRegistrado");
  if (usuario) {
    console.log('USUARIO EN LOCALSTORAGE:');
    const usuarioObj = JSON.parse(usuario);
    console.log(usuarioObj);
    console.table([usuarioObj]);
  } else {
    console.log('No hay usuarios registrados');
  }
}

// Limpiar localStorage
function limpiarUsuarios() {
  localStorage.removeItem("usuarioRegistrado");
  console.log('LocalStorage limpiado correctamente');
}

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  console.log('═══════════════════════════════════════════════════');
  console.log('SISTEMA DE REGISTRO CARGADO');
  console.log('═══════════════════════════════════════════════════');
  console.log('Comandos disponibles en consola:');
  console.log('  - verUsuariosRegistrados() - Ver usuarios guardados en localStorage');
  console.log('  - limpiarUsuarios() - Limpiar todos los usuarios de localStorage');
  console.log('═══════════════════════════════════════════════════');
  
  // Mostrar usuario existente si hay
  verUsuariosRegistrados();
});

console.log('Script de registro cargado correctamente');
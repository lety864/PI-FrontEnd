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
    console.log('NUEVO USUARIO REGISTRADO');
    console.log('ID:', this.id);
    console.log('Nombre:', this.nombre);
    console.log('Correo:', this.correo);
    console.log('Teléfono:', this.telefono);
    console.log('Contraseña:', '*'.repeat(this.contraseña.length) + ' (oculta por seguridad)');
    console.log('Fecha de Registro:', new Date(this.fechaRegistro).toLocaleString('es-MX'));
    console.log('Estado:', this.activo ? 'Activo' : 'Inactivo');
    console.log('Objeto JSON Completo:');
    console.log(JSON.stringify(this.toJSON(), null, 2));
  }
}

// ========================================
// VALIDACIÓN Y REGISTRO DEL FORMULARIO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("registerForm");
  
  if (!form) {
    console.error(' Formulario no encontrado');
    return;
  }
  
  form.addEventListener("submit", function(event) {
    event.preventDefault();

    console.log('=== PROCESANDO REGISTRO ===');

  // Obtener valores del formulario
  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("username").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const alertMessage = document.getElementById("alertMessage");

  console.log('Valores del formulario:', {
    fullname: fullname,
    email: email,
    phone: phone,
    password: password ? '***' : '(vacío)',
    confirmPassword: confirmPassword ? '***' : '(vacío)'
  });

  console.log('Elemento alertMessage encontrado:', alertMessage ? 'SÍ' : 'NO');

  // Limpiar estados anteriores
  clearValidationStates();

  // ========== VALIDACIONES ==========

  // 0. Validar que todos los campos estén completos
  if (!fullname || !email || !phone || !password || !confirmPassword) {
    console.log(' CAMPOS VACÍOS DETECTADOS');
    
    // Identificar campos vacíos
    const camposVacios = [];
    if (!fullname) {
      camposVacios.push("Nombre completo");
      markFieldInvalid("fullname");
    }
    if (!email) {
      camposVacios.push("Correo electrónico");
      markFieldInvalid("username");
    }
    if (!phone) {
      camposVacios.push("Teléfono");
      markFieldInvalid("phone");
    }
    if (!password) {
      camposVacios.push("Contraseña");
      markFieldInvalid("password");
    }
    if (!confirmPassword) {
      camposVacios.push("Confirmar contraseña");
      markFieldInvalid("confirmPassword");
    }

    console.log('Campos vacíos:', camposVacios);

    // Mostrar mensaje más detallado
    const mensaje = camposVacios.length === 1 
      ? `Por favor, rellene el campo: ${camposVacios[0]}`
      : `Por favor, rellene todos los campos obligatorios (${camposVacios.length} faltantes)`;
    
    console.log('Mensaje a mostrar:', mensaje);
    console.log('Intentando mostrar error...');
    
    showError(alertMessage, mensaje);
    
    console.log('Clases del alertMessage después de showError:', alertMessage ? alertMessage.className : 'No existe');
    console.log('Display del alertMessage:', alertMessage ? alertMessage.style.display : 'No existe');
    
    // Hacer scroll hacia la alerta para que sea visible
    if (alertMessage) {
      alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    return;
  }

  // 1. Validar nombre completo (solo letras y espacios)
  const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,}$/;
  const nameWords = fullname.split(' ').filter(word => word.length > 0);
  
  if (!nameRegex.test(fullname) || nameWords.length < 2) {
    showError(alertMessage, "Ingrese su nombre completo (nombre y apellido, mínimo 3 caracteres).");
    markFieldInvalid("fullname");
    console.error(' Validación fallida: Nombre incompleto');
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // 2. Validar correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showError(alertMessage, "Ingrese un correo electrónico válido.");
    markFieldInvalid("username");
    console.error(' Validación fallida: Email inválido');
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // 3. Validar número de teléfono (exactamente 10 dígitos)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    showError(alertMessage, "Ingrese un número de teléfono válido (10 dígitos).");
    markFieldInvalid("phone");
    console.error(' Validación fallida: Teléfono inválido');
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // 4. Validar longitud de contraseña (mínimo 8 caracteres)
  if (password.length < 8) {
    showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
    markFieldInvalid("password");
    console.error(' Validación fallida: Contraseña muy corta');
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // 5. Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    showError(alertMessage, "Las contraseñas no coinciden.");
    markFieldInvalid("confirmPassword");
    console.error(' Validación fallida: Contraseñas no coinciden');
    alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  // 6. Validar que el correo no esté registrado
  const existingUser = localStorage.getItem("usuarioRegistrado");
  if (existingUser) {
    const userData = JSON.parse(existingUser);
    if (userData.correo === email) {
      showError(alertMessage, "Este correo electrónico ya está registrado.");
      markFieldInvalid("username");
      console.error('Validación fallida: Email ya registrado');
      alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
  }

  console.log(' Todas las validaciones pasadas');

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
  console.log(' Usuario guardado en localStorage');

  // Mostrar mensaje de éxito
  showSuccess(alertMessage, "¡Registro exitoso! Redirigiendo a la página principal...");

  // Limpiar formulario
  document.getElementById("registerForm").reset();

  // Redirigir a la página principal después de 2 segundos
  setTimeout(() => {
    console.log('→ Redirigiendo...');
    window.location.href = "index.html";
  }, 2000);
  });
});

// ========================================
// FUNCIONES AUXILIARES
// ========================================

// Función para mostrar errores con animación
function showError(element, message) {
  if (!element) return;
  
  element.classList.remove("d-none", "alert-success");
  element.classList.add("alert-danger");
  element.style.display = 'block'; // Asegurar que sea visible
  element.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Error:</strong> ${message}`;
  
  // Auto-ocultar después de 7 segundos
  setTimeout(() => {
    element.classList.add("d-none");
    element.style.display = 'none';
  }, 7000);
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
  if (field) {
    field.classList.add("is-invalid");
    
    // Enfocar el primer campo inválido
    if (!document.querySelector('.is-invalid:focus')) {
      field.focus();
    }
  }
}

// Limpiar estados de validación
function clearValidationStates() {
  const fields = ["fullname", "username", "phone", "password", "confirmPassword"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid", "is-valid");
      // Limpiar mensajes de error personalizados
      const errorMsg = field.parentElement.querySelector('.email-error-msg, .phone-error-msg');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
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
document.getElementById("username").addEventListener("input", function() {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const invalidCharsRegex = /[^a-zA-Z0-9@._-]/;
  
  // Crear o obtener el mensaje de error
  let errorMsg = this.parentElement.querySelector('.email-error-msg');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'email-error-msg text-danger small mt-1';
    errorMsg.style.display = 'none';
    this.parentElement.appendChild(errorMsg);
  }
  
  if (this.value && invalidCharsRegex.test(this.value)) {
    errorMsg.textContent = '⚠️ El correo solo puede contener letras, números, puntos, guiones y guión bajo';
    errorMsg.style.display = 'block';
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value && !emailRegex.test(this.value.trim())) {
    errorMsg.style.display = 'none';
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value) {
    errorMsg.style.display = 'none';
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else {
    errorMsg.style.display = 'none';
    this.classList.remove("is-invalid", "is-valid");
  }
});

// Validar teléfono
document.getElementById("phone").addEventListener("input", function() {
  const onlyNumbers = /^[0-9]*$/;
  
  // Crear o obtener el mensaje de error
  let errorMsg = this.parentElement.querySelector('.phone-error-msg');
  if (!errorMsg) {
    errorMsg = document.createElement('div');
    errorMsg.className = 'phone-error-msg text-danger small mt-1';
    errorMsg.style.display = 'none';
    this.parentElement.appendChild(errorMsg);
  }
  
  // Limitar la entrada a 10 dígitos
  if (this.value.length > 10) {
    this.value = this.value.substring(0, 10);
  }
  
  if (this.value && !onlyNumbers.test(this.value)) {
    errorMsg.textContent = '⚠️ Solo puede contener números, máximo 10 dígitos';
    errorMsg.style.display = 'block';
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value && this.value.length < 10) {
    errorMsg.textContent = '⚠️ Solo puede contener números, máximo 10 dígitos';
    errorMsg.style.display = 'block';
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else if (this.value && this.value.length === 10) {
    errorMsg.style.display = 'none';
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else {
    errorMsg.style.display = 'none';
    this.classList.remove("is-invalid", "is-valid");
  }
});

// Validar contraseña
document.getElementById("password").addEventListener("input", function() {
  const password = this.value;
  
  if (password.length >= 8) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else if (password.length > 0) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else {
    this.classList.remove("is-invalid", "is-valid");
  }
});

// Validar confirmación de contraseña
document.getElementById("confirmPassword").addEventListener("input", function() {
  const password = document.getElementById("password").value;
  const confirmPassword = this.value;
  
  if (confirmPassword && confirmPassword === password && password.length >= 8) {
    this.classList.add("is-valid");
    this.classList.remove("is-invalid");
  } else if (confirmPassword) {
    this.classList.add("is-invalid");
    this.classList.remove("is-valid");
  } else {
    this.classList.remove("is-invalid", "is-valid");
  }
});

// ========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ========================================

const togglePasswordBtn = document.getElementById("togglePassword");
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener("click", () => {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");
    if (passwordInput && eyeIcon) {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      eyeIcon.classList.toggle("bi-eye");
      eyeIcon.classList.toggle("bi-eye-slash");
    }
  });
}

const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");
if (toggleConfirmPasswordBtn) {
  toggleConfirmPasswordBtn.addEventListener("click", () => {
    const confirmInput = document.getElementById("confirmPassword");
    const eyeIcon = document.getElementById("eyeIconConfirm");
    if (confirmInput && eyeIcon) {
      const type = confirmInput.getAttribute("type") === "password" ? "text" : "password";
      confirmInput.setAttribute("type", type);
      eyeIcon.classList.toggle("bi-eye");
      eyeIcon.classList.toggle("bi-eye-slash");
    }
  });
}

// ========================================
// LIMPIAR MODAL AL CERRAR/ABRIR
// ========================================

const registerModal = document.getElementById('registerModal');

if (registerModal) {
  // Limpiar al cerrar
  registerModal.addEventListener('hidden.bs.modal', function () {
    console.log('→ Modal de registro cerrado');
    
    // Limpiar formulario
    const form = document.getElementById("registerForm");
    if (form) form.reset();
    
    // Limpiar mensaje de alerta
    const alertMessage = document.getElementById("alertMessage");
    if (alertMessage) {
      alertMessage.classList.add("d-none");
      alertMessage.classList.remove("alert-success", "alert-danger");
      alertMessage.innerHTML = "";
    }
    
    // Limpiar estados de validación
    clearValidationStates();
  });

  // Limpiar al abrir
  registerModal.addEventListener('show.bs.modal', function () {
    console.log('→ Modal de registro abierto');
    
    // Limpiar mensaje de alerta
    const alertMessage = document.getElementById("alertMessage");
    if (alertMessage) {
      alertMessage.classList.add("d-none");
      alertMessage.classList.remove("alert-success", "alert-danger");
      alertMessage.innerHTML = "";
    }
    
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
}

// ========================================
// FUNCIONES DE UTILIDAD PARA CONSOLA
// ========================================

// Ver usuarios registrados
window.verUsuariosRegistrados = function() {
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
window.limpiarUsuarios = function() {
  localStorage.removeItem("usuarioRegistrado");
  console.log('LocalStorage limpiado correctamente');
}

// ========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================

window.addEventListener('DOMContentLoaded', () => {
  console.log('✓ SISTEMA DE REGISTRO CARGADO');
  console.log('Comandos disponibles en consola:');
  console.log('  - verUsuariosRegistrados() - Ver usuarios guardados en localStorage');
  console.log('  - limpiarUsuarios() - Limpiar todos los usuarios de localStorage');
  
  // Mostrar usuario existente si hay
  const usuario = localStorage.getItem("usuarioRegistrado");
  if (usuario) {
    verUsuariosRegistrados();
  }
});

console.log('✓ Script de registro cargado correctamente');
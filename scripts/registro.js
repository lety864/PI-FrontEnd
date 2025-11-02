// ========================================
// MODELO DE USUARIO
// ========================================
class UsuarioModel {
  constructor(data) {
    this.id = data.id || this.generarId();
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.telefono = data.telefono || '';
    this.contraseña = data.contraseña || '';
    this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  generarId() {
    return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

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

  mostrarEnConsola() {
    console.log('==========================================');
    console.log('NUEVO USUARIO REGISTRADO');
    console.log('==========================================');
    console.log('ID:', this.id);
    console.log('Nombre:', this.nombre);
    console.log('Correo:', this.correo);
    console.log('Teléfono:', this.telefono);
    console.log('Contraseña:', '*'.repeat(this.contraseña.length) + ' (oculta por seguridad)');
    console.log('Fecha de Registro:', new Date(this.fechaRegistro).toLocaleString('es-MX'));
    console.log('Estado:', this.activo ? 'Activo' : 'Inactivo');
    console.log('==========================================');
    console.log('Objeto JSON Completo:');
    console.log(JSON.stringify(this.toJSON(), null, 2));
    console.log('==========================================');
  }
}

// ========================================
// GESTIÓN DE USUARIOS EN LOCALSTORAGE
// ========================================
function obtenerUsuarios() {
  try {
    const usuarios = localStorage.getItem("usuarios");
    return usuarios ? JSON.parse(usuarios) : [];
  } catch (e) {
    console.error('Error al obtener usuarios:', e);
    return [];
  }
}

function guardarUsuarios(usuarios) {
  try {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    return true;
  } catch (e) {
    console.error('Error al guardar usuarios:', e);
    return false;
  }
}

function agregarUsuario(usuario) {
  const usuarios = obtenerUsuarios();
  usuarios.push(usuario);
  const guardado = guardarUsuarios(usuarios);
  if (guardado) {
    console.log(`\n✓ Usuario agregado exitosamente`);
    console.log(`✓ Total de usuarios: ${usuarios.length}`);
  }
  return guardado;
}

function correoYaRegistrado(correo) {
  const usuarios = obtenerUsuarios();
  return usuarios.some(usuario => usuario.correo === correo);
}

// ========================================
// VALIDACIÓN Y REGISTRO DEL FORMULARIO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✓ Sistema de registro inicializado');
  
  const form = document.getElementById("registerForm");
  
  if (!form) {
    console.warn(' Formulario "registerForm" no encontrado en el DOM');
    return;
  }
  
  console.log('✓ Formulario encontrado y listo');
  
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    console.log('==========================================');
    console.log('PROCESANDO REGISTRO DE USUARIO');
    console.log('==========================================');

    const fullname = document.getElementById("fullname")?.value.trim() || '';
    const email = document.getElementById("username")?.value.trim() || '';
    const phone = document.getElementById("phone")?.value.trim() || '';
    const password = document.getElementById("password")?.value.trim() || '';
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim() || '';
    const alertMessage = document.getElementById("alertMessage");

    console.log('Datos del formulario:', {
      fullname: fullname || '(vacío)',
      email: email || '(vacío)',
      phone: phone || '(vacío)',
      password: password ? '***' : '(vacío)',
      confirmPassword: confirmPassword ? '***' : '(vacío)'
    });

    clearValidationStates();

    // Validar campos vacíos
    if (!fullname || !email || !phone || !password || !confirmPassword) {
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

      const mensaje = camposVacios.length === 1 
        ? `Por favor, rellene el campo: ${camposVacios[0]}`
        : `Por favor, rellene todos los campos obligatorios (${camposVacios.length} faltantes)`;
      
      console.log(' Validación fallida: Campos vacíos');
      showError(alertMessage, mensaje);
      if (alertMessage) {
        alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Validar nombre completo
    const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]{3,}$/;
    const nameWords = fullname.split(' ').filter(word => word.length > 0);
    
    if (!nameRegex.test(fullname) || nameWords.length < 2) {
      console.log(' Validación fallida: Nombre incompleto');
      showError(alertMessage, "Ingrese su nombre completo (nombre y apellido, mínimo 3 caracteres).");
      markFieldInvalid("fullname");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(' Validación fallida: Email inválido');
      showError(alertMessage, "Ingrese un correo electrónico válido.");
      markFieldInvalid("username");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar número de teléfono
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      console.log('Validación fallida: Teléfono inválido');
      showError(alertMessage, "Ingrese un número de teléfono válido (10 dígitos).");
      markFieldInvalid("phone");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      console.log('Validación fallida: Contraseña muy corta');
      showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
      markFieldInvalid("password");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      console.log(' Validación fallida: Las contraseñas no coinciden');
      showError(alertMessage, "Las contraseñas no coinciden.");
      markFieldInvalid("confirmPassword");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar que el correo no esté registrado
    if (correoYaRegistrado(email)) {
      console.log(' Validación fallida: Email ya registrado');
      showError(alertMessage, "Este correo electrónico ya está registrado.");
      markFieldInvalid("username");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    console.log('✓ Todas las validaciones pasaron correctamente');

    // Crear usuario
    const nuevoUsuario = new UsuarioModel({
      nombre: fullname,
      correo: email,
      telefono: phone,
      contraseña: password
    });

    // Mostrar en consola ANTES de guardar
    console.log('\n');
    console.log('==========================================');
    console.log(' NUEVO USUARIO REGISTRADO');
    console.log('==========================================');
    console.log('ID:', nuevoUsuario.id);
    console.log('Nombre:', nuevoUsuario.nombre);
    console.log('Correo:', nuevoUsuario.correo);
    console.log('Teléfono:', nuevoUsuario.telefono);
    console.log('Contraseña:', '*'.repeat(nuevoUsuario.contraseña.length));
    console.log('Fecha:', new Date(nuevoUsuario.fechaRegistro).toLocaleString('es-MX'));
    console.log('Estado:', nuevoUsuario.activo ? 'Activo ✓' : 'Inactivo');
    console.log('==========================================');
    
    console.log('\n OBJETO JSON DEL NUEVO USUARIO:');
    const usuarioJSON = nuevoUsuario.toJSON();
    console.log(JSON.stringify(usuarioJSON, null, 2));
    console.dir(usuarioJSON);
    
    console.log('\n TABLA DEL NUEVO USUARIO:');
    console.table([usuarioJSON]);

    // Guardar usuario
    const guardado = agregarUsuario(usuarioJSON);
    
    // Mostrar TODOS los usuarios después de agregar
    if (guardado) {
      const todosLosUsuarios = obtenerUsuarios();
      console.log('\n');
      console.log('==========================================');
      console.log('TODOS LOS USUARIOS EN LOCALSTORAGE');
      console.log('==========================================');
      console.log('Total de usuarios registrados:', todosLosUsuarios.length);
      console.log('\n ARRAY COMPLETO (JSON):');
      console.log(JSON.stringify(todosLosUsuarios, null, 2));
      console.log('\n ARRAY COMPLETO (OBJETO):');
      console.dir(todosLosUsuarios);
      console.log('\n TABLA DE TODOS LOS USUARIOS:');
      console.table(todosLosUsuarios);
      console.log('==========================================');
      console.log('\n');
    }

    if (guardado) {
      // Mostrar mensaje de éxito
      const totalUsuarios = obtenerUsuarios().length;
      console.log(`✓ Usuario guardado en localStorage correctamente`);
      console.log(`✓ Total de usuarios registrados: ${totalUsuarios}`);
      
      showSuccess(alertMessage, `¡Registro exitoso!. Redirigiendo a la página principal...`);

      // Limpiar formulario
      form.reset();

      // Redirigir
      setTimeout(() => {
        console.log('→ Redirigiendo a index.html...');
        window.location.href = "index.html";
      }, 2000);
    } else {
      console.log('❌ Error al guardar en localStorage');
      showError(alertMessage, "Error al guardar el usuario. Por favor, intente nuevamente.");
    }
  });
});

// ========================================
// FUNCIONES AUXILIARES
// ========================================
function showError(element, message) {
  if (!element) {
    console.warn(' Elemento "alertMessage" no encontrado');
    return;
  }
  
  element.classList.remove("d-none", "alert-success");
  element.classList.add("alert-danger");
  element.style.display = 'block';
  element.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Error:</strong> ${message}`;
  
  setTimeout(() => {
    element.classList.add("d-none");
    element.style.display = 'none';
  }, 7000);
}

function showSuccess(element, message) {
  if (!element) {
    console.warn(' Elemento "alertMessage" no encontrado');
    return;
  }
  
  element.classList.remove("d-none", "alert-danger");
  element.classList.add("alert-success");
  element.style.display = 'block';
  element.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
  
  console.log('✓ Mensaje de éxito mostrado:', message);
}

function markFieldInvalid(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add("is-invalid");
    if (!document.querySelector('.is-invalid:focus')) {
      field.focus();
    }
  }
}

function clearValidationStates() {
  const fields = ["fullname", "username", "phone", "password", "confirmPassword"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid", "is-valid");
      const errorMsg = field.parentElement?.querySelector('.email-error-msg, .phone-error-msg');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
    }
  });
}

// ========================================
// VALIDACIÓN EN TIEMPO REAL
// ========================================
function initValidacionTiempoReal() {
  const fullnameField = document.getElementById("fullname");
  const usernameField = document.getElementById("username");
  const phoneField = document.getElementById("phone");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirmPassword");

  if (fullnameField) {
    fullnameField.addEventListener("blur", function() {
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
  }

  if (usernameField) {
    usernameField.addEventListener("input", function() {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const invalidCharsRegex = /[^a-zA-Z0-9@._-]/;
      
      let errorMsg = this.parentElement?.querySelector('.email-error-msg');
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'email-error-msg text-danger small mt-1';
        errorMsg.style.display = 'none';
        this.parentElement?.appendChild(errorMsg);
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
  }

  if (phoneField) {
    phoneField.addEventListener("input", function() {
      const onlyNumbers = /^[0-9]*$/;
      
      let errorMsg = this.parentElement?.querySelector('.phone-error-msg');
      if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'phone-error-msg text-danger small mt-1';
        errorMsg.style.display = 'none';
        this.parentElement?.appendChild(errorMsg);
      }
      
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
  }

  if (passwordField) {
    passwordField.addEventListener("input", function() {
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
  }

  if (confirmPasswordField && passwordField) {
    confirmPasswordField.addEventListener("input", function() {
      const password = passwordField.value;
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
  }
}

// ========================================
// MOSTRAR/OCULTAR CONTRASEÑA
// ========================================
function initTogglePassword() {
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
}

// ========================================
// LIMPIAR MODAL AL CERRAR/ABRIR
// ========================================
function initModalHandlers() {
  const registerModal = document.getElementById('registerModal');

  if (registerModal) {
    registerModal.addEventListener('hidden.bs.modal', function () {
      const form = document.getElementById("registerForm");
      if (form) form.reset();
      
      const alertMessage = document.getElementById("alertMessage");
      if (alertMessage) {
        alertMessage.classList.add("d-none");
        alertMessage.classList.remove("alert-success", "alert-danger");
        alertMessage.innerHTML = "";
      }
      
      clearValidationStates();
    });

    registerModal.addEventListener('show.bs.modal', function () {
      const alertMessage = document.getElementById("alertMessage");
      if (alertMessage) {
        alertMessage.classList.add("d-none");
        alertMessage.classList.remove("alert-success", "alert-danger");
        alertMessage.innerHTML = "";
      }
      
      clearValidationStates();
    });

    registerModal.addEventListener('shown.bs.modal', function () {
      const video = document.getElementById('registerVideo');
      if (video) {
        video.play().catch(() => {});
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
}

// ========================================
// FUNCIONES DE UTILIDAD PARA CONSOLA
// ========================================
window.verUsuariosRegistrados = function() {
  const usuarios = obtenerUsuarios();
  console.log('\n');
  console.log('==========================================');
  console.log(' LISTADO COMPLETO DE USUARIOS');
  console.log('==========================================');
  console.log('Total de usuarios registrados:', usuarios.length);
  
  if (usuarios.length > 0) {
    console.log('\n ARRAY COMPLETO (JSON):');
    console.log(JSON.stringify(usuarios, null, 2));
    
    console.log('\n ARRAY COMPLETO (OBJETO):');
    console.dir(usuarios);
    
    console.log('\n DETALLE DE CADA USUARIO:');
    usuarios.forEach((usuario, index) => {
      console.log(`\n--- Usuario #${index + 1} ---`);
      console.log('ID:', usuario.id);
      console.log('Nombre:', usuario.nombre);
      console.log('Correo:', usuario.correo);
      console.log('Teléfono:', usuario.telefono);
      console.log('Fecha Registro:', new Date(usuario.fechaRegistro).toLocaleString('es-MX'));
      console.log('Estado:', usuario.activo ? 'Activo ✓' : 'Inactivo ✗');
    });
    
    console.log('\n TABLA DE USUARIOS:');
    console.table(usuarios);
  } else {
    console.log(' No hay usuarios registrados');
  }
  console.log('==========================================');
  console.log('\n');
}

window.buscarUsuarioPorCorreo = function(correo) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (usuario) {
    console.log('✓ Usuario encontrado:');
    console.log(usuario);
    console.table([usuario]);
  } else {
    console.log(` No se encontró ningún usuario con el correo: ${correo}`);
  }
}

window.limpiarUsuarios = function() {
  localStorage.removeItem("usuarios");
  console.log('✓ Todos los usuarios han sido eliminados del localStorage');
}

window.contarUsuarios = function() {
  const usuarios = obtenerUsuarios();
  console.log(` Total de usuarios registrados: ${usuarios.length}`);
  return usuarios.length;
}

// ========================================
// INICIALIZACIÓN
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  const usuarios = obtenerUsuarios();
  
  if (usuarios.length > 0) {
    console.log('Usuarios registrados:', usuarios.length);
    console.table(usuarios);
  }
  
  initValidacionTiempoReal();
  initTogglePassword();
  initModalHandlers();
});
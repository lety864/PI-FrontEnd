// ========================================
// CONFIGURACIÓN DE LA URL BASE DE LA API
// ========================================
const API_BASE_URL = '/api'; // URL base para todas las peticiones

// ========================================
// MODELO Y GESTIÓN LOCALSTORAGE (Se mantiene como pediste)
// ========================================

// MODELO DE USUARIO
class UsuarioModel {
  constructor(data) {
    this.id = data.id || this.generarId();
    this.nombre = data.nombre || '';
    this.correo = data.correo || '';
    this.telefono = data.telefono || '';
    this.contraseña = data.contraseña || '';
    this.rol = data.rol || 'cliente';
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
      rol: this.rol,
      fechaRegistro: this.fechaRegistro,
      activo: this.activo
    };
  }
}

// GESTION DE USUARIOS EN LOCALSTORAGE
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
  // NOTA: Esta función ya no es usada por el formulario de registro,
  // pero se mantiene por si otra parte del código la necesita.
  const usuarios = obtenerUsuarios();
  usuarios.push(usuario);
  const guardado = guardarUsuarios(usuarios);
  if (guardado) {
    console.log('Usuario agregado exitosamente (localStorage)');
  }
  return guardado;
}

function correoYaRegistrado(correo) {
  // NOTA: Esta función ya no es usada por el formulario de registro.
  // La validación de correo duplicado ahora la hace el backend.
  const usuarios = obtenerUsuarios();
  return usuarios.some(usuario => usuario.correo === correo);
}

// CREAR USUARIO ADMINISTRADOR POR DEFECTO
function crearAdminPorDefecto() {
  const usuarios = obtenerUsuarios();
  const adminExiste = usuarios.some(u => u.rol === 'admin');
  
  if (!adminExiste) {
    const adminPorDefecto = {
      id: 'ADMIN_' + Date.now(),
      nombre: 'Administrador',
      correo: 'admin@muebleria.com',
      telefono: '7221234567',
      contraseña: 'admin123',
      rol: 'admin',
      fechaRegistro: new Date().toISOString(),
      activo: true
    };
    
    usuarios.push(adminPorDefecto);
    guardarUsuarios(usuarios);
    
    console.log('Usuario administrador creado (localStorage)');
  }
}

// ==================================================================
// === LÓGICA DE SUBMIT CON API ===
// ==================================================================

document.addEventListener('DOMContentLoaded', function() {
  console.log('✓ Sistema de registro (API) inicializado');
  console.log('✓ API_BASE_URL configurada:', API_BASE_URL);
  
  // Sigue llamando a la función de admin de localStorage, como en el original
  crearAdminPorDefecto(); 
  
  const form = document.getElementById("registerForm");
  
  if (!form) {
    console.warn(' Formulario "registerForm" no encontrado en el DOM');
    return;
  }
  
  console.log('✓ Formulario encontrado y listo');
  
  // Se convierte la función en "async" para poder usar "await"
  form.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    console.log('==========================================');
    console.log('PROCESANDO REGISTRO DE USUARIO (API)');
    console.log('==========================================');

    // Leer "nombre" y "apellidos" del HTML
    const nombre = document.getElementById("nombre")?.value.trim() || '';
    const apellidos = document.getElementById("apellidos")?.value.trim() || '';
    const email = document.getElementById("username")?.value.trim() || '';
    const phone = document.getElementById("phone")?.value.trim() || '';
    const password = document.getElementById("password")?.value.trim() || '';
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim() || '';
    const alertMessage = document.getElementById("alertMessage");

    clearValidationStates();

    // 1. VALIDACIÓN DEL LADO DEL CLIENTE (Se mantiene igual)
    if (!nombre || !apellidos || !email || !phone || !password || !confirmPassword) {
      const camposVacios = [];
      if (!nombre) {
        camposVacios.push("Nombre(s)");
        markFieldInvalid("nombre");
      }
      if (!apellidos) {
        camposVacios.push("Apellidos");
        markFieldInvalid("apellidos");
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
      const mensaje = `Por favor, rellene todos los campos obligatorios.`;
      console.log(' Validación fallida: Campos vacíos');
      showError(alertMessage, mensaje);
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    
    // (Otras validaciones de cliente: formato, longitud, etc.)
    if (nombre.length < 2) {
      console.log(' Validación fallida: Nombre muy corto');
      showError(alertMessage, "Ingrese un nombre válido (mínimo 2 caracteres).");
      markFieldInvalid("nombre");
      return;
    }
    if (apellidos.length < 2) {
      console.log(' Validación fallida: Apellidos muy cortos');
      showError(alertMessage, "Ingrese apellidos válidos (mínimo 2 caracteres).");
      markFieldInvalid("apellidos");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(' Validación fallida: Email inválido');
      showError(alertMessage, "Ingrese un correo electrónico válido.");
      markFieldInvalid("username");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      console.log('Validación fallida: Teléfono inválido');
      showError(alertMessage, "Ingrese un número de teléfono válido (10 dígitos).");
      markFieldInvalid("phone");
      return;
    }
    if (password.length < 8) {
      console.log('Validación fallida: Contraseña muy corta');
      showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
      markFieldInvalid("password");
      return;
    }
    if (password !== confirmPassword) {
      console.log(' Validación fallida: Las contraseñas no coinciden');
      showError(alertMessage, "Las contraseñas no coinciden.");
      markFieldInvalid("confirmPassword");
      return;
    }
    
    console.log('✓ Todas las validaciones de frontend pasaron');

    // 2. PREPARAR DATOS PARA EL BACKEND (Coincide con UsuarioRequest)
    const usuarioPayload = {
      nombre: nombre,
      apellidos: apellidos,
      correo: email,
      password: password,
      telefono: phone
    };

    console.log('→ Enviando payload al backend:', usuarioPayload);

    // 3. LLAMADA FETCH API AL BACKEND
    try {
      // Este endpoint 'POST /api/auth/register' coincide con tu AuthContoller.java
      console.log(` Haciendo petición a: ${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(usuarioPayload)
      });

      // 4. MANEJAR RESPUESTA DEL BACKEND
      
      // Caso 1: Registro Exitoso (Ej. 201 Created)
      if (response.ok) {
        const nuevoUsuario = await response.json(); // Obtienes el UsuarioResponse
        console.log('✓ Usuario registrado exitosamente en el backend:', nuevoUsuario);
        
        showSuccess(alertMessage, `¡Registro exitoso, ${nuevoUsuario.nombre}! Redirigiendo...`);
        form.reset();

        // Lógica de Redirección: Cerrar modal de registro y abrir login
        setTimeout(() => {
          console.log('→ Cerrando modal de registro y abriendo modal de login...');
          const registerModalElement = document.getElementById('registerModal');
          const registerModal = bootstrap.Modal.getInstance(registerModalElement);
          
          registerModalElement.addEventListener('hidden.bs.modal', function openLoginModal() {
            console.log('→ Modal de registro cerrado, abriendo login...');
            
            const loginModalElement = document.getElementById('loginModal');
            if (loginModalElement) {
              const loginModal = new bootstrap.Modal(loginModalElement);
              loginModal.show();
              
              // Pre-llenar el campo de email en el login
              const loginEmailField = loginModalElement.querySelector('#emailInput');
              if (loginEmailField) {
                loginEmailField.value = email; // Asignar el email que se acaba de registrar
                loginEmailField.classList.add('is-valid');
                console.log('✓ Email pre-llenado en el formulario de login:', email);
              }
            }
            registerModalElement.removeEventListener('hidden.bs.modal', openLoginModal);
          }, { once: true });
          
          if (registerModal) {
            registerModal.hide();
          }
        }, 2000); // Espera 2 seg para que el usuario vea el mensaje

      // Caso 2: Error del servidor (Ej. 409 Conflict si el email ya existe)
      } else {
        let errorMsg = 'Error al registrar el usuario.';
        try {
          // Tu servicio lanza IllegalArgumentException, que Spring 
          // probablemente no convierte a 409 por defecto, pero sí podemos leer el error.
          const errorData = await response.json();
          errorMsg = errorData.message || `Error ${response.status}`; 
        } catch(e) {
          errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        
        if (errorMsg.includes("El correo ya está registrado")) {
          errorMsg = 'Este correo electrónico ya está registrado.';
          markFieldInvalid("username");
        }
        
        console.log(`❌ Error ${response.status}: ${errorMsg}`);
        showError(alertMessage, errorMsg);
      }
      
    // Caso 3: Error de red (Servidor caído)
    } catch (error) {
      console.error('❌ Error de red al intentar registrar:', error);
      showError(alertMessage, 'No se pudo conectar al servidor. Por favor, intente más tarde.');
    }
    
  });
  
  // Se inicializan las demás funciones
  initValidacionTiempoReal();
  initTogglePassword();
  initModalHandlers();
});


// ========================================
// FUNCIONES AUXILIARES DE UI (Sin cambios)
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
  const fields = ["nombre", "apellidos", "username", "phone", "password", "confirmPassword"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid", "is-valid");
      const errorMsg = field.parentElement?.querySelector('.email-error-msg, .phone-error-msg, .text-danger.small');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
    }
  });
}

// ========================================
// VALIDACIÓN EN TIEMPO REAL (Sin cambios)
// ========================================
function initValidacionTiempoReal() {
  const nombreField = document.getElementById("nombre");
  const apellidosField = document.getElementById("apellidos");
  const usernameField = document.getElementById("username");
  const phoneField = document.getElementById("phone");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirmPassword");

  // Validación para Nombre
  if (nombreField) {
    nombreField.addEventListener("blur", function() {
      const value = this.value.trim();
      if (value && value.length < 2) {
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      } else if (value) {
        this.classList.add("is-valid");
        this.classList.remove("is-invalid");
      }
    });
  }

  // Validación para Apellidos
  if (apellidosField) {
    apellidosField.addEventListener("blur", function() {
      const value = this.value.trim();
      if (value && value.length < 2) {
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
        errorMsg.textContent = 'El correo solo puede contener letras, numeros, puntos, guiones y guion bajo';
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
        errorMsg.textContent = 'Solo puede contener numeros, maximo 10 digitos';
        errorMsg.style.display = 'block';
        this.classList.add("is-invalid");
        this.classList.remove("is-valid");
      } else if (this.value && this.value.length < 10) {
        errorMsg.textContent = 'Debe contener exactamente 10 digitos';
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
// MOSTRAR/OCULTAR CONTRASEÑA (Sin cambios)
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
// LIMPIAR MODAL AL CERRAR/ABRIR (Sin cambios)
// ========================================
function initModalHandlers() {
  const registerModal = document.getElementById('registerModal');

  if (registerModal) {
    registerModal.addEventListener('hidden.bs.modal', function () {
      const form = document.getElementById("registerForm");
      if (form) form.reset();
      
      form.querySelectorAll('.mb-3').forEach(grupo => {
        grupo.style.display = '';
      });
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.style.display = '';
      
      const alertMessage = document.getElementById("alertMessage");
      if (alertMessage) {
        alertMessage.classList.add("d-none");
        alertMessage.classList.remove("alert-success", "alert-danger");
        alertMessage.innerHTML = "";
      }
      
      clearValidationStates();
      
      const video = document.getElementById('registerVideo');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
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
// FUNCIONES DE UTILIDAD PARA CONSOLA (Sin cambios)
// ========================================
window.verUsuariosRegistrados = function() {
  console.warn("Esta función ahora solo muestra usuarios en localStorage, no en la base de datos.");
  const usuarios = obtenerUsuarios();
  console.log('Total de usuarios (localStorage):', usuarios.length);
  if (usuarios.length > 0) {
    console.table(usuarios);
  }
}

window.buscarUsuarioPorCorreo = function(correo) {
  console.warn("Esta función ahora solo busca en localStorage, no en la base de datos.");
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (usuario) {
    console.log('✓ Usuario encontrado (localStorage):');
    console.table([usuario]);
  } else {
    console.log(` No se encontró ningún usuario con el correo: ${correo} (en localStorage)`);
  }
}

window.limpiarUsuarios = function() {
  localStorage.removeItem("usuarios");
  console.log('✓ Todos los usuarios han sido eliminados del localStorage');
}

window.contarUsuarios = function() {
  const usuarios = obtenerUsuarios();
  console.log(` Total de usuarios registrados (localStorage): ${usuarios.length}`);
  return usuarios.length;
}


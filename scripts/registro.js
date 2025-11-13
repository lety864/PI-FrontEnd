// ========================================
// VALIDACIÓN Y REGISTRO DEL FORMULARIO (API)
// ========================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✓ Sistema de registro (API) inicializado');
  
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

    console.log('Datos del formulario:', {
      nombre: nombre || '(vacío)',
      apellidos: apellidos || '(vacío)',
      email: email || '(vacío)',
      phone: phone || '(vacío)',
      password: password ? '***' : '(vacío)',
      confirmPassword: confirmPassword ? '***' : '(vacío)'
    });

    clearValidationStates();

    // Validar campos vacíos
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
      if (alertMessage) {
        alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // Validar nombre (simple)
    if (nombre.length < 2) {
      console.log(' Validación fallida: Nombre muy corto');
      showError(alertMessage, "Ingrese un nombre válido (mínimo 2 caracteres).");
      markFieldInvalid("nombre");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar apellidos (simple)
    if (apellidos.length < 2) {
      console.log(' Validación fallida: Apellidos muy cortos');
      showError(alertMessage, "Ingrese apellidos válidos (mínimo 2 caracteres).");
      markFieldInvalid("apellidos");
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

    // La validación de correo duplicado ahora la hará el backend
    console.log('✓ Todas las validaciones de frontend pasaron');

    // Crear el payload JSON para enviar al backend
    // Este objeto debe coincidir con tu DTO `UsuarioRequest.java`
    const usuarioPayload = {
      nombre: nombre,
      apellidos: apellidos,
      correo: email,
      password: password,
      telefono: phone
    };

    console.log('→ Enviando payload al backend:', usuarioPayload);
    const URL_BASE = '/api/auth';

    // LLAMADA FETCH API
    try {
      // Usamos 'await' para esperar la respuesta del servidor
      // Esta es la URL de tu AuthContoller
      const response = await fetch(`${URL_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(usuarioPayload)
      });

      // Caso 1: Registro Exitoso (Ej. 201 Created o 200 OK)
      if (response.ok) {
        const nuevoUsuario = await response.json(); // Obtienes el UsuarioResponse
        console.log('✓ Usuario registrado exitosamente en el backend:', nuevoUsuario);
        
        showSuccess(alertMessage, `¡Registro exitoso, ${nuevoUsuario.nombre}! Redirigiendo...`);
        form.reset();

        // Redirigir después de 2 segundos
        setTimeout(() => {
          console.log('→ Redirigiendo a index.html...');
           window.location.href = "index.html"; 
        }, 2000);

      // Caso 2: Error del servidor (Ej. 409 Conflict si el email ya existe)
      } else {
        let errorMsg = 'Error al registrar el usuario.';
        
        try {
            // Intentamos leer el mensaje de error que envía el backend
            const errorData = await response.json();
            errorMsg = errorData.message || `Error ${response.status}`; 
        } catch(e) {
            // Si el backend no envía JSON, usamos el texto de estado
            errorMsg = `Error ${response.status}: ${response.statusText}`;
        }
        
        // Error común: Correo duplicado (409 Conflict)
        if (response.status === 409) {
          errorMsg = 'Este correo electrónico ya está registrado.';
          markFieldInvalid("username");
        }
        
        console.log(`❌ Error ${response.status}: ${errorMsg}`);
        showError(alertMessage, errorMsg);
      }
      
    // Caso 3: Error de red (El servidor no responde o está caído)
    } catch (error) {
      console.error('❌ Error de red al intentar registrar:', error);
      showError(alertMessage, 'No se pudo conectar al servidor. Por favor, intente más tarde.');
    }
    
  });
});

// ========================================
// FUNCIONES AUXILIARES DE UI
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
  
  // No se oculta automáticamente para que el usuario pueda leerlo
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
    // Solo enfocar si no hay otro campo inválido ya enfocado
    if (!document.querySelector('.is-invalid:focus')) {
      field.focus();
    }
  }
}

function clearValidationStates() {
  // Corregido para incluir nombre y apellidos
  const fields = ["nombre", "apellidos", "username", "phone", "password", "confirmPassword"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.remove("is-invalid", "is-valid");
      // Limpiar mensajes de error específicos (si existen)
      const errorMsg = field.parentElement?.querySelector('.email-error-msg, .phone-error-msg, .text-danger.small');
      if (errorMsg) {
        errorMsg.style.display = 'none';
      }
    }
  });
}

// ========================================
// VALIDACIÓN EN TIEMPO REAL (Corregida)
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
        this.classList.remove("is-valid");
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
  }
}

// ========================================
// INICIALIZACIÓN
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando validaciones y manejadores de modal...');
  
  initValidacionTiempoReal();
  initTogglePassword();
  initModalHandlers();
});
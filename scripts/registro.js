// SISTEMA DE REGISTRO DE USUARIOS

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
  const usuarios = obtenerUsuarios();
  usuarios.push(usuario);
  const guardado = guardarUsuarios(usuarios);
  if (guardado) {
    console.log('Usuario agregado exitosamente');
    console.log('Total de usuarios:', usuarios.length);
  }
  return guardado;
}

function correoYaRegistrado(correo) {
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
    
    console.log('Usuario administrador creado');
    console.log('Email: admin@muebleria.com');
    console.log('Contraseña: admin123');
  }
}

// VALIDACION Y REGISTRO DEL FORMULARIO
document.addEventListener('DOMContentLoaded', function() {
  console.log('Sistema de registro inicializado');
  
  crearAdminPorDefecto();
  initValidacionTiempoReal();
  initTogglePassword();
  initModalHandlers();
  
  const form = document.getElementById("registerForm");
  
  if (!form) {
    console.warn('Formulario "registerForm" no encontrado en el DOM');
    return;
  }
  
  console.log('Formulario encontrado y listo');
  
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    console.log('Procesando registro de usuario');

    const fullname = document.getElementById("fullname")?.value.trim() || '';
    const email = document.getElementById("username")?.value.trim() || '';
    const phone = document.getElementById("phone")?.value.trim() || '';
    const password = document.getElementById("password")?.value.trim() || '';
    const confirmPassword = document.getElementById("confirmPassword")?.value.trim() || '';
    const alertMessage = document.getElementById("alertMessage");

    clearValidationStates();

    // Validar campos vacios
    if (!fullname || !email || !phone || !password || !confirmPassword) {
      const camposVacios = [];
      if (!fullname) {
        camposVacios.push("Nombre completo");
        markFieldInvalid("fullname");
      }
      if (!email) {
        camposVacios.push("Correo electronico");
        markFieldInvalid("username");
      }
      if (!phone) {
        camposVacios.push("Telefono");
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
        ? 'Por favor, rellene el campo: ' + camposVacios[0]
        : 'Por favor, rellene todos los campos obligatorios (' + camposVacios.length + ' faltantes)';
      
      console.log('Validacion fallida: Campos vacios');
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
      console.log('Validacion fallida: Nombre incompleto');
      showError(alertMessage, "Ingrese su nombre completo (nombre y apellido, minimo 3 caracteres).");
      markFieldInvalid("fullname");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar correo electronico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validacion fallida: Email invalido');
      showError(alertMessage, "Ingrese un correo electronico valido.");
      markFieldInvalid("username");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar numero de telefono
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      console.log('Validacion fallida: Telefono invalido');
      showError(alertMessage, "Ingrese un numero de telefono valido (10 digitos).");
      markFieldInvalid("phone");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      console.log('Validacion fallida: Contraseña muy corta');
      showError(alertMessage, "La contraseña debe tener al menos 8 caracteres.");
      markFieldInvalid("password");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      console.log('Validacion fallida: Las contraseñas no coinciden');
      showError(alertMessage, "Las contraseñas no coinciden.");
      markFieldInvalid("confirmPassword");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    // Validar que el correo no este registrado
    if (correoYaRegistrado(email)) {
      console.log('Validacion fallida: Email ya registrado');
      showError(alertMessage, "Este correo electronico ya esta registrado.");
      markFieldInvalid("username");
      if (alertMessage) alertMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }

    console.log('Todas las validaciones pasaron correctamente');

    // CREAR USUARIO CON ROL DE CLIENTE
    const nuevoUsuario = new UsuarioModel({
      nombre: fullname,
      correo: email,
      telefono: phone,
      contraseña: password,
      rol: 'cliente'
    });

    // Mostrar en consola
    console.log('NUEVO USUARIO REGISTRADO');
    const usuarioJSON = nuevoUsuario.toJSON();
    console.log('Datos del usuario:');
    console.table([usuarioJSON]);

    // Guardar usuario
    const guardado = agregarUsuario(usuarioJSON);
    
    // Mostrar TODOS los usuarios despues de agregar
    if (guardado) {
      const todosLosUsuarios = obtenerUsuarios();
      console.log('TODOS LOS USUARIOS EN LOCALSTORAGE');
      console.log('Total de usuarios registrados:', todosLosUsuarios.length);
      
      const admins = todosLosUsuarios.filter(u => u.rol === 'admin').length;
      const clientes = todosLosUsuarios.filter(u => u.rol === 'cliente').length;
      console.log('Administradores:', admins);
      console.log('Clientes:', clientes);
      
      console.log('Lista completa de usuarios:');
      console.table(todosLosUsuarios);
    }

    if (guardado) {
      const totalUsuarios = obtenerUsuarios().length;
      console.log('Usuario guardado en localStorage correctamente');
      console.log('Total de usuarios registrados:', totalUsuarios);
      
      const nombreUsuario = fullname.split(' ')[0];
      showSuccess(alertMessage, 'Registro exitoso, ' + nombreUsuario + '! Redirigiendo al inicio de sesion...');

      // Ocultar campos del formulario
      form.querySelectorAll('.mb-3').forEach(grupo => {
        grupo.style.display = 'none';
      });
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.style.display = 'none';

      // Redirigir al modal de login
      setTimeout(() => {
        const registerModal = document.getElementById('registerModal');
        const loginModal = document.getElementById('loginModal');
        
        if (registerModal && loginModal && typeof bootstrap !== 'undefined') {
          const modalInstance = bootstrap.Modal.getInstance(registerModal) || new bootstrap.Modal(registerModal);
          modalInstance.hide();
          
          setTimeout(() => {
            const loginModalInstance = new bootstrap.Modal(loginModal);
            loginModalInstance.show();
          }, 500);
        }
      }, 2000);
    } else {
      console.log('Error al guardar en localStorage');
      showError(alertMessage, "Error al guardar el usuario. Por favor, intente nuevamente.");
    }
  });
});

// FUNCIONES AUXILIARES
function showError(element, message) {
  if (!element) {
    console.warn('Elemento "alertMessage" no encontrado');
    return;
  }
  
  element.classList.remove("d-none", "alert-success");
  element.classList.add("alert-danger");
  element.style.display = 'block';
  element.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Error:</strong> ' + message;
  
  setTimeout(() => {
    element.classList.add("d-none");
    element.style.display = 'none';
  }, 7000);
}

function showSuccess(element, message) {
  if (!element) {
    console.warn('Elemento "alertMessage" no encontrado');
    return;
  }
  
  element.classList.remove("d-none", "alert-danger");
  element.classList.add("alert-success");
  element.style.display = 'block';
  element.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>' + message;
  
  console.log('Mensaje de exito mostrado:', message);
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

// VALIDACION EN TIEMPO REAL
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

// MOSTRAR/OCULTAR CONTRASEÑA
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

// LIMPIAR MODAL AL CERRAR/ABRIR
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

// FUNCIONES DE UTILIDAD PARA CONSOLA
window.verUsuariosRegistrados = function() {
  const usuarios = obtenerUsuarios();
  console.log('LISTADO COMPLETO DE USUARIOS');
  console.log('Total de usuarios registrados:', usuarios.length);
  
  const admins = usuarios.filter(u => u.rol === 'admin');
  const clientes = usuarios.filter(u => u.rol === 'cliente');
  console.log('Administradores:', admins.length);
  console.log('Clientes:', clientes.length);
  
  if (usuarios.length > 0) {
    console.log('Lista de usuarios:');
    console.table(usuarios);
  } else {
    console.log('No hay usuarios registrados');
  }
}

window.buscarUsuarioPorCorreo = function(correo) {
  const usuarios = obtenerUsuarios();
  const usuario = usuarios.find(u => u.correo === correo);
  if (usuario) {
    console.log('Usuario encontrado:');
    console.table([usuario]);
  } else {
    console.log('No se encontro ningun usuario con el correo:', correo);
  }
}

window.limpiarUsuarios = function() {
  localStorage.removeItem("usuarios");
  console.log('Todos los usuarios han sido eliminados del localStorage');
}

window.contarUsuarios = function() {
  const usuarios = obtenerUsuarios();
  const admins = usuarios.filter(u => u.rol === 'admin').length;
  const clientes = usuarios.filter(u => u.rol === 'cliente').length;
  
  console.log('Total de usuarios registrados:', usuarios.length);
  console.log('Administradores:', admins);
  console.log('Clientes:', clientes);
  
  return usuarios.length;
}

window.crearUsuarioAdmin = function(nombre, correo, contraseña) {
  if (!nombre || !correo || !contraseña) {
    console.error('Error: Debes proporcionar nombre, correo y contraseña');
    console.log('Uso: crearUsuarioAdmin("Nombre Completo", "email@ejemplo.com", "contraseña123")');
    return;
  }
  
  if (correoYaRegistrado(correo)) {
    console.error('Error: Este correo ya esta registrado');
    return;
  }
  
  const nuevoAdmin = {
    id: 'ADMIN_' + Date.now(),
    nombre: nombre,
    correo: correo,
    telefono: '0000000000',
    contraseña: contraseña,
    rol: 'admin',
    fechaRegistro: new Date().toISOString(),
    activo: true
  };
  
  const usuarios = obtenerUsuarios();
  usuarios.push(nuevoAdmin);
  
  if (guardarUsuarios(usuarios)) {
    console.log('ADMINISTRADOR CREADO EXITOSAMENTE');
    console.table([nuevoAdmin]);
  } else {
    console.error('Error al guardar el administrador');
  }
}

window.verAdministradores = function() {
  const usuarios = obtenerUsuarios();
  const admins = usuarios.filter(u => u.rol === 'admin');
  
  console.log('ADMINISTRADORES DEL SISTEMA');
  console.log('Total de administradores:', admins.length);
  
  if (admins.length > 0) {
    console.table(admins);
  } else {
    console.log('No hay administradores registrados');
  }
}

window.verClientes = function() {
  const usuarios = obtenerUsuarios();
  const clientes = usuarios.filter(u => u.rol === 'cliente' || !u.rol);
  
  console.log('CLIENTES REGISTRADOS');
  console.log('Total de clientes:', clientes.length);
  
  if (clientes.length > 0) {
    console.table(clientes);
  } else {
    console.log('No hay clientes registrados');
  }
}
// SISTEMA DE LOGIN - CON ROLES (ADMINISTRADOR/CLIENTE)

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de login con roles inicializado');

    // ELEMENTOS DEL DOM
    const loginModal = document.getElementById('loginModal');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = loginModal?.querySelector('button.btn-primary');
    const loginForm = loginModal?.querySelector('form');

    // Validacion de elementos criticos
    if (!loginModal || !emailInput || !passwordInput || !loginButton) {
        console.error('Error: Elementos del login no encontrados. Verifica los IDs en el HTML.');
        return;
    }

    // BOTON DE MOSTRAR/OCULTAR CONTRASENA
    const togglePasswordButton = document.getElementById('toggleLoginPassword');
    
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    }

    // FUNCIONES PARA MANEJAR USUARIOS
    function obtenerUsuarios() {
        try {
            const usuarios = localStorage.getItem("usuarios");
            return usuarios ? JSON.parse(usuarios) : [];
        } catch (e) {
            console.error('Error al obtener usuarios:', e);
            return [];
        }
    }

    function buscarUsuarioPorCorreo(correo) {
        const usuarios = obtenerUsuarios();
        return usuarios.find(usuario => usuario.correo === correo);
    }

    // CREAR USUARIO ADMINISTRADOR POR DEFECTO (si no existe)
    function crearAdminPorDefecto() {
        const usuarios = obtenerUsuarios();
        const adminExiste = usuarios.some(u => u.rol === 'admin');
        
        if (!adminExiste) {
            const adminPorDefecto = {
                id: 'admin-001',
                nombre: 'Administrador',
                correo: 'admin@muebleria.com',
                telefono: '7221234567',
                contraseña: 'admin123',
                rol: 'admin',
                fechaRegistro: new Date().toISOString()
            };
            
            usuarios.push(adminPorDefecto);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            console.log('Usuario administrador creado por defecto');
            console.log('Email: admin@muebleria.com');
            console.log('Contraseña: admin123');
        }
    }

    crearAdminPorDefecto();

    // CORRECCION: Eliminar aria-hidden de modales
    function corregirAccesibilidadModales() {
        const modales = document.querySelectorAll('.modal[aria-hidden="true"]');
        modales.forEach(modal => {
            if (modal.hasAttribute('tabindex')) {
                modal.removeAttribute('aria-hidden');
            }
        });
    }

    corregirAccesibilidadModales();

    // CREACION DE ELEMENTO DE ALERTA
    function crearAlertaLogin() {
        let alertMessage = document.getElementById('loginAlertMessage');

        if (!alertMessage && loginForm) {
            alertMessage = document.createElement('div');
            alertMessage.id = 'loginAlertMessage';
            alertMessage.className = 'alert d-none';
            alertMessage.setAttribute('role', 'alert');
            
            const primerElemento = loginForm.querySelector('.mb-3');
            if (primerElemento) {
                loginForm.insertBefore(alertMessage, primerElemento);
            }
        }
        return alertMessage;
    }

    // FUNCIONES DE UTILIDAD
    function limpiarCamposLogin() {
        emailInput.value = '';
        passwordInput.value = '';
        clearLoginValidationStates();
        
        emailInput.style.display = '';
        passwordInput.parentElement.style.display = '';
        const loginBtn = loginModal?.querySelector('button.btn-primary');
        if (loginBtn) loginBtn.style.display = '';
        
        const alertMessage = document.getElementById('loginAlertMessage');
        if (alertMessage) {
            alertMessage.classList.add('d-none');
            alertMessage.classList.remove('alert-success', 'alert-danger');
            alertMessage.innerHTML = '';
        }
    }

    function showLoginError(element, message) {
        if (!element) return;
        element.classList.remove('d-none', 'alert-success');
        element.classList.add('alert-danger');
        element.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i>' + message;
        setTimeout(() => element.classList.add('d-none'), 5000);
    }

    function showLoginSuccess(element, message) {
        if (!element) return;
        element.classList.remove('d-none', 'alert-danger');
        element.classList.add('alert-success');
        element.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>' + message;
    }

    function markLoginFieldInvalid(id) {
        const field = document.getElementById(id);
        if (field) {
            field.classList.add('is-invalid');
            field.focus();
        }
    }

    function clearLoginValidationStates() {
        [emailInput, passwordInput].forEach(field => {
            if (field) {
                field.classList.remove('is-invalid', 'is-valid');
            }
        });
        
        const parentDiv = passwordInput.parentElement;
        const feedback = parentDiv?.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.style.display = 'none';
        }
    }

    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // DETERMINAR RUTA DE REDIRECCION SEGUN ROL Y UBICACION
    function obtenerRutaSegunRol(rol) {
        const currentPath = window.location.pathname;
        const estamosEnRaiz = currentPath === '/' || currentPath.endsWith('index.html') || currentPath.endsWith('/');
        
        if (rol === 'admin') {
            return estamosEnRaiz ? 'paginas/admin.html' : 'admin.html';
        } else {
            return estamosEnRaiz ? 'index.html' : '../index.html';
        }
    }

    // EVENTO: PROCESO DE LOGIN
  // ==========================================================
// EVENTO: PROCESO DE LOGIN (Modificado para API con boolean)
// ==========================================================
loginButton.addEventListener('click', async (event) => {
    event.preventDefault();
    console.log('Procesando inicio de sesion (API - boolean)...');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const alertMessage = crearAlertaLogin();

    clearLoginValidationStates();

    // Validacion: campos vacios
    if (!email || !password) {
        showLoginError(alertMessage, 'Por favor, complete todos los campos.');
        if (!email) markLoginFieldInvalid('emailInput');
        if (!password) markLoginFieldInvalid('passwordInput');
        return;
    }

    // Validacion: formato de email
    if (!validarEmail(email)) {
        showLoginError(alertMessage, 'Ingrese un correo electronico valido.');
        markLoginFieldInvalid('emailInput');
        return;
    }

    // 1. Crear el Payload para el backend
    const loginPayload = {
        correo: email,
        password: password
    };

    console.log('Enviando payload de login:', loginPayload);

    try {
        // --- LLAMADA 1: VALIDAR CREDENCIALES ---
        console.log('Llamada 1: Validando credenciales en /api/auth/login...');
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginPayload)
        });

        // Si la respuesta NO es OK (ej. 404, 500)
        // Esto captura el "IllegalArgumentException" (correo no encontrado)
        if (!loginResponse.ok) {
            console.log('Llamada 1 Fallida: El correo no existe o error del servidor.');
            throw new Error("Credenciales incorrectas"); // Lanzamos un error
        }

        // Si la respuesta es OK (200), leemos el cuerpo (que es "true" o "false")
        const esValido = await loginResponse.text();

        // Si el backend devuelve "true" (contraseña correcta)
        if (esValido === "true") {
            console.log('Llamada 1 Exitosa: Contraseña correcta.');
            
            // --- LLAMADA 2: OBTENER DATOS DEL USUARIO ---
            console.log('Llamada 2: Buscando datos del usuario en /api/users/by-email...');
            const userResponse = await fetch(`http://localhost:8080/api/users/by-email?correo=${email}`);
            
            if (!userResponse.ok) {
                // Esto no debería pasar si el login fue OK, pero es una protección
                throw new Error("No se pudieron cargar los datos del usuario después del login.");
            }

            const usuario = await userResponse.json(); // Este es el UsuarioResponse
            
            // --- LÓGICA DE ÉXITO (Igual que antes) ---
            console.log('Llamada 2 Exitosa. Bienvenido:', usuario.nombre);
            localStorage.setItem('sesionActiva', JSON.stringify(usuario));

            const nombreUsuario = usuario.nombre.split(' ')[0];
            
            emailInput.style.display = 'none';
            passwordInput.parentElement.style.display = 'none';
            loginButton.style.display = 'none';
            
            showLoginSuccess(alertMessage, '¡Bienvenido, ' + nombreUsuario + '!');

            // Usamos la info de la Llamada 2 para redirigir
            const rutaDestino = obtenerRutaSegunRol(usuario.rol.nombreRol);
            console.log('Redirigiendo a:', rutaDestino);

            setTimeout(() => {
                const modalInstance = bootstrap.Modal.getInstance(loginModal);
                if (modalInstance) modalInstance.hide();
                setTimeout(() => { window.location.href = rutaDestino; }, 500);
            }, 2000);

        } else {
            // Si el backend devuelve "false" (contraseña incorrecta)
            console.log('Llamada 1 Fallida: Contraseña incorrecta.');
            throw new Error("Credenciales incorrectas");
        }

    } catch (error) {
        // Captura errores de red Y los errores que lanzamos (Credenciales incorrectas)
        console.error('Error en el proceso de login:', error.message);
        showLoginError(alertMessage, 'Correo o contraseña incorrectos.');
        markLoginFieldInvalid('emailInput');
        markLoginFieldInvalid('passwordInput');
    }
});

    // VALIDACION EN TIEMPO REAL
    emailInput.addEventListener('input', function () {
        const email = this.value.trim();
        
        if (email && validarEmail(email)) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
        } else if (email) {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
        } else {
            this.classList.remove('is-invalid', 'is-valid');
        }
    });

    passwordInput.addEventListener('input', function () {
        const password = this.value;
        const parentDiv = this.parentElement;
        const feedback = parentDiv.nextElementSibling;
        
        if (password.length >= 8) {
            this.classList.add('is-valid');
            this.classList.remove('is-invalid');
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'none';
            }
        } else if (password.length > 0) {
            this.classList.add('is-invalid');
            this.classList.remove('is-valid');
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = 'La contraseña debe tener 8 caracteres como minimo.';
                feedback.style.display = 'block';
            }
        } else {
            this.classList.remove('is-invalid', 'is-valid');
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'none';
            }
        }
    });

    // EVENTOS DEL MODAL
    loginModal.addEventListener('hidden.bs.modal', () => {
        console.log('Modal de login cerrado');
        limpiarCamposLogin();

        const video = document.getElementById('loginVideo');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    });

    loginModal.addEventListener('shown.bs.modal', () => {
        console.log('Modal de login abierto');
        limpiarCamposLogin();
        
        const video = document.getElementById('loginVideo');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }

        setTimeout(() => {
            emailInput.focus();
        }, 300);
    });

    // OBSERVADOR: Corregir aria-hidden dinamicamente
    const observer = new MutationObserver(() => {
        corregirAccesibilidadModales();
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'class'],
        subtree: true
    });

    // UTILIDADES DE CONSOLA
    window.verSesionActiva = function () {
        const sesion = localStorage.getItem('sesionActiva');
        if (sesion) {
            try {
                const obj = JSON.parse(sesion);
                console.log('Sesion activa:');
                console.table([obj]);
                return obj;
            } catch (error) {
                console.error('Error al leer sesion:', error);
                return null;
            }
        } else {
            console.log('No hay sesion activa');
            return null;
        }
    };

    window.cerrarSesion = function () {
        localStorage.removeItem('sesionActiva');
        console.log('Sesion cerrada correctamente');
        window.location.reload();
    };

    window.limpiarLogin = function () {
        limpiarCamposLogin();
        console.log('Campos de login limpiados');
    };

    window.verTodosLosUsuarios = function() {
        const usuarios = obtenerUsuarios();
        if (usuarios.length > 0) {
            console.log('Total de usuarios:', usuarios.length);
            console.table(usuarios);
            return usuarios;
        } else {
            console.log('No hay usuarios registrados');
            return [];
        }
    };

    window.crearUsuarioAdmin = function(nombre, correo, contraseña) {
        const usuarios = obtenerUsuarios();
        const nuevoAdmin = {
            id: 'admin-' + Date.now(),
            nombre: nombre,
            correo: correo,
            telefono: '0000000000',
            contraseña: contraseña,
            rol: 'admin',
            fechaRegistro: new Date().toISOString()
        };
        usuarios.push(nuevoAdmin);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        console.log('Administrador creado:');
        console.table([nuevoAdmin]);
        return nuevoAdmin;
    };

    // Mostrar sesion activa al cargar (si existe)
    const sesionActual = localStorage.getItem('sesionActiva');
    if (sesionActual) {
        try {
            const sesionObj = JSON.parse(sesionActual);
            console.log('Sesion activa encontrada');
            console.log('Datos de la sesion:');
            console.table([sesionObj]);
        } catch (error) {
            console.error('Error al leer sesion activa:', error);
        }
    }

    // Mostrar credenciales de admin en consola
    console.log('CREDENCIALES DE ADMINISTRADOR');
    console.log('Email: admin@muebleria.com');
    console.log('Contraseña: admin123');
});
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de login con roles inicializado');

    // ==========================================================
    // I. VARIABLES Y ELEMENTOS DOM
    // ==========================================================

    const loginModal = document.getElementById('loginModal');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = loginModal?.querySelector('button.btn-primary');
    const loginForm = loginModal?.querySelector('form');
    const togglePasswordButton = document.getElementById('toggleLoginPassword');

    // Validacion de elementos criticos
    if (!loginModal || !emailInput || !passwordInput || !loginButton) {
        console.error('Error: Elementos del login no encontrados. Verifica los IDs en el HTML.');
        return;
    }

    // ==========================================================
    // II. FUNCIONES DE UTILIDAD Y ALMACENAMIENTO (Legacy/Fallback)
    // ==========================================================

    /**
     * @deprecated Solo para fines de fallback o testing local.
     */
    function obtenerUsuarios() {
        try {
            const usuarios = localStorage.getItem("usuarios");
            return usuarios ? JSON.parse(usuarios) : [];
        } catch (e) {
            console.error('Error al obtener usuarios:', e);
            return [];
        }
    }

    /**
     * @deprecated Solo para fines de fallback o testing local.
     */
    function crearAdminPorDefecto() {
        const usuarios = obtenerUsuarios();
        const adminExiste = usuarios.some(u => u.rol === 'admin');
        
        if (!adminExiste) {
            const adminPorDefecto = {
                id: 'admin-001',
                nombre: 'Administrador',
                correo: 'admin@muebleria.com',
                telefono: '7221234567',
                // CORRECCIÓN LÓGICA: Esta contraseña es solo texto, no hasheada. 
                // NO se usa en la integración con Spring Security.
                contraseña: 'admin123', 
                rol: 'admin',
                fechaRegistro: new Date().toISOString()
            };
            
            usuarios.push(adminPorDefecto);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            console.log('Usuario administrador de fallback creado por defecto');
        }
    }

    function validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ==========================================================
    // III. FUNCIONES DE INTERFAZ DE USUARIO Y REDIRECCIÓN
    // ==========================================================

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
        // CORRECCIÓN LÓGICA: No ocultar el error de inmediato para credenciales
        // setTimeout(() => element.classList.add('d-none'), 5000); 
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

    /**
     * Determina la ruta de redirección basándose en el rol y la ubicación actual.
     * @param {string} rolIdentifier - El rol devuelto por el backend (ej. "ADMINISTRADOR").
     */
    function obtenerRutaSegunRol(rolIdentifier) {
        const currentPath = window.location.pathname;
        const estamosEnRaiz = currentPath === '/' || currentPath.endsWith('index.html') || currentPath.endsWith('/');

        // CORRECCIÓN LÓGICA: Se asume que el backend devuelve "ADMINISTRADOR"
        const esAdmin = rolIdentifier && rolIdentifier.toUpperCase() === 'ADMINISTRADOR'; 

        if (esAdmin) {
            // Si estamos en la raíz (ej. index.html), la ruta es paginas/admin.html
            // Si estamos ya en una subcarpeta, la ruta es solo admin.html
            return estamosEnRaiz ? 'paginas/admin.html' : 'admin.html';
        } else {
            // Cliente o rol no reconocido
            // Si estamos en la raíz, se queda en index.html
            // Si estamos en una subcarpeta (ej. paginas/login.html), debe volver a ../index.html
            return estamosEnRaiz ? 'index.html' : '../index.html'; 
        }
    }

    function actualizarUIConSesion(sesion) {
        // CORRECCIÓN LÓGICA: Cambié los IDs aquí para que coincidan con la nueva lógica
        const loginButtonNav = document.getElementById('loginButtonNav'); 
        const logoutButtonNav = document.getElementById('logoutButtonNav'); 
        const welcomeText = document.getElementById('welcomeUserText'); 

        if (sesion && sesion.correo) {
            if (loginButtonNav) loginButtonNav.style.display = 'none';
            if (logoutButtonNav) logoutButtonNav.style.display = 'block';
            if (welcomeText) {
                welcomeText.textContent = `Hola, ${sesion.correo.split('@')[0]}`;
                welcomeText.style.display = 'block';
            }
            console.log(`UI actualizada: Sesión para ${sesion.rol} cargada.`);
        } else {
            if (loginButtonNav) loginButtonNav.style.display = 'block';
            if (logoutButtonNav) logoutButtonNav.style.display = 'none';
            if (welcomeText) welcomeText.style.display = 'none';
        }
    }

    function corregirAccesibilidadModales() {
        const modales = document.querySelectorAll('.modal[aria-hidden="true"]');
        modales.forEach(modal => {
            if (modal.hasAttribute('tabindex')) {
                modal.removeAttribute('aria-hidden');
            }
        });
    }

    // ==========================================================
    // IV. LÓGICA DE PERSISTENCIA Y JWT
    // ==========================================================

    function verificarYActualizarSesion() {
        const sesionActual = localStorage.getItem('sesionActiva');
        const tokenActual = localStorage.getItem('token'); // Se cambia 'token' por 'jwtToken'
        
        if (sesionActual && tokenActual) {
            try {
                const sesionObj = JSON.parse(sesionActual);
                
                // CORRECCIÓN LÓGICA: Se recomienda usar 'token' o 'jwtToken', no ambos.
                // Asumo que el token es el valor JWT y sesionActiva es el objeto {correo, rol, token}.
                // La variable original era `tokenActual = localStorage.getItem('token')`. Se deja 'token'
                // para evitar romper otras partes del código.

                // Aquí se podría añadir la verificación de expiración del token...

                actualizarUIConSesion(sesionObj);
                
            } catch (error) {
                console.error('Error al leer sesión activa. Limpiando datos.', error);
                localStorage.removeItem('sesionActiva');
                localStorage.removeItem('token');
            }
        }
    }

    // ==========================================================
    // V. EVENTOS Y EJECUCIÓN
    // ==========================================================
    
    // Lógica de compatibilidad de usuarios (Local Storage)
    crearAdminPorDefecto(); 
    
    // Inicializar UI con la sesión existente
    verificarYActualizarSesion();


    // ----------------------------------------------------------
    // EVENTO: PROCESO DE LOGIN
    // ----------------------------------------------------------
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('Procesando inicio de sesion (JWT)...');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const alertMessage = crearAlertaLogin();

        clearLoginValidationStates();

        if (!email || !password) {
            showLoginError(alertMessage, 'Por favor, complete todos los campos.');
            if (!email) markLoginFieldInvalid('emailInput');
            if (!password) markLoginFieldInvalid('passwordInput');
            return;
        }

        if (!validarEmail(email)) {
            showLoginError(alertMessage, 'Ingrese un correo electronico valido.');
            markLoginFieldInvalid('emailInput');
            return;
        }

        const loginPayload = {
            correo: email,
            password: password
        };

        const URL_BASE = '/api/auth';

        try {
            // LLAMADA API: Validar credenciales y obtener JWT/Rol
            console.log('Llamada API: Solicitando token a /api/auth/login...');
            const loginResponse = await fetch(`${URL_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginPayload)
            });

            if (!loginResponse.ok) {
                // Captura 401 Unauthorized (Credenciales incorrectas) o 404/500
                console.log(`Llamada Fallida. Status: ${loginResponse.status}`);
                throw new Error("Credenciales incorrectas");
            }

            const data = await loginResponse.json();

            // CORRECCIÓN LÓGICA: Si el login es exitoso (200), debe contener el token y el rol.
            if (!data.token || !data.rol) {
                  throw new Error("Respuesta del servidor incompleta (falta token o rol).");
            }
            
            // --- LÓGICA DE ÉXITO: GUARDAR SESIÓN Y REDIRIGIR ---
            
            // 1. Guardar el token para futuras peticiones (usamos 'token' como clave)
            localStorage.setItem('token', data.token);
            
            // 2. Guardar la información básica de la sesión para el frontend
            localStorage.setItem('sesionActiva', JSON.stringify(data)); 

            console.log('Login Exitoso. Rol obtenido:', data.rol);
            
            // Ocultar campos y mostrar mensaje
            emailInput.style.display = 'none';
            passwordInput.parentElement.style.display = 'none';
            loginButton.style.display = 'none';
            
            const nombreUsuario = data.correo.split('@')[0];
            showLoginSuccess(alertMessage, '¡Bienvenido, ' + nombreUsuario + '!');

            // 3. Redireccionar
            const rutaDestino = obtenerRutaSegunRol(data.rol);
            console.log('Redirigiendo a:', rutaDestino);

            setTimeout(() => {
                const modalInstance = bootstrap.Modal.getInstance(loginModal);
                if (modalInstance) modalInstance.hide();
                setTimeout(() => { window.location.href = rutaDestino; }, 500);
            }, 2000);

        } catch (error) {
            // Captura errores de red y de credenciales
            console.error('Error en el proceso de login:', error.message);
            showLoginError(alertMessage, 'Correo o contraseña incorrectos.');
            markLoginFieldInvalid('emailInput');
            markLoginFieldInvalid('passwordInput');
        }
    });

    // ----------------------------------------------------------
    // EVENTOS ADICIONALES (UI y Validaciones)
    // ----------------------------------------------------------

    // BOTON DE MOSTRAR/OCULTAR CONTRASENA
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

    // VALIDACION EN TIEMPO REAL (Email)
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

    // VALIDACION EN TIEMPO REAL (Contraseña)
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        const parentDiv = this.parentElement;
        const feedback = parentDiv.nextElementSibling;
        
        // CORRECCIÓN LÓGICA: Se cambió la validación de 8 caracteres a una lógica más limpia.
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

    // EVENTOS DEL MODAL (Cerrar/Abrir)
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
        setTimeout(() => { emailInput.focus(); }, 300);
    });

    // OBSERVADOR: Corregir aria-hidden dinamicamente
    const observer = new MutationObserver(corregirAccesibilidadModales);
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'class'],
        subtree: true
    });

    // ----------------------------------------------------------
    // VI. UTILIDADES DE CONSOLA (Para Debugging)
    // ----------------------------------------------------------
    
    // Nota: Las funciones de consola no requieren estar reubicadas, 
    // pero deben usar las funciones internas limpias (limpiarCamposLogin).

    window.verSesionActiva = function () {
        const sesion = localStorage.getItem('sesionActiva');
        const token = localStorage.getItem('token');
        if (sesion) {
            try {
                const obj = JSON.parse(sesion);
                console.log('Sesion activa:');
                console.table([obj]);
                console.log('Token (JWT) actual:');
                console.log(token);
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
        localStorage.removeItem('token'); // Usamos 'token'
        console.log('Sesion cerrada correctamente');
        window.location.reload();
    };

    // Otras utilidades de consola se mantienen igual...
    window.limpiarLogin = limpiarCamposLogin;
    
    // (Otras funciones de debugging con localStorage se mantienen)

    // Mostrar credenciales de admin en consola
    console.log('CREDENCIALES DE ADMINISTRADOR DE FALLBACK');
    console.log('admin@muebleria.com');
    console.log('Contraseña: admin123');
    console.log('---');
    console.log('CREDENCIALES DE ADMINISTRADOR DE BACKEND');
    console.log('admin@ecommerce.com');
    console.log('Contraseña: 12345678');
});
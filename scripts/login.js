// SISTEMA DE LOGIN - MULTI-USUARIO

// CONFIGURACIÓN DE LA URL BASE DE LA API
const API = '/api'; // URL base para todas las peticiones

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Sistema de login inicializado');

    // ELEMENTOS DEL DOM
    const loginModal = document.getElementById('loginModal');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginButton = loginModal?.querySelector('button.btn-primary');
    const loginForm = loginModal?.querySelector('form');

    // Validación de elementos críticos
    if (!loginModal || !emailInput || !passwordInput || !loginButton) {
        console.error('Error: Elementos del login no encontrados. Verifica los IDs en el HTML.');
        return;
    }

    // BOTÓN DE MOSTRAR/OCULTAR CONTRASEÑA
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

    // FUNCIONES PARA MANEJAR USUARIOS (Se mantienen por si las usas en otra parte)
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

    // CORRECCIÓN: Eliminar aria-hidden de modales
    function corregirAccesibilidadModales() {
        const modales = document.querySelectorAll('.modal[aria-hidden="true"]');
        modales.forEach(modal => {
            if (modal.hasAttribute('tabindex')) {
                modal.removeAttribute('aria-hidden');
            }
        });
    }

    corregirAccesibilidadModales();

    // CREACIÓN DE ELEMENTO DE ALERTA
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
        element.innerHTML = `<i class="bi bi-exclamation-triangle-fill me-2"></i>${message}`;
        setTimeout(() => element.classList.add('d-none'), 5000);
    }

    function showLoginSuccess(element, message) {
        if (!element) return;
        element.classList.remove('d-none', 'alert-danger');
        element.classList.add('alert-success');
        element.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${message}`;
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

    // ==================================================================
    // === INICIO DE LA SECCIÓN MODIFICADA: PROCESO DE LOGIN (JWT) ===
    // ==================================================================

    // Se convierte la función en 'async' para usar 'await' con fetch
    loginButton.addEventListener('click', async (event) => {
        event.preventDefault();
        console.log('→ Procesando inicio de sesión (JWT)...');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const alertMessage = crearAlertaLogin();

        clearLoginValidationStates();

        // 1. VALIDACIÓN DEL LADO DEL CLIENTE (Se mantiene igual)
        if (!email || !password) {
            showLoginError(alertMessage, 'Por favor, complete todos los campos.');
            if (!email) markLoginFieldInvalid('emailInput');
            if (!password) markLoginFieldInvalid('passwordInput');
            return;
        }
        if (!validarEmail(email)) {
            showLoginError(alertMessage, 'Ingrese un correo electrónico válido.');
            markLoginFieldInvalid('emailInput');
            return;
        }
        if (password.length < 8) {
            // Nota: Tu backend no valida longitud, pero el frontend sí. Lo mantenemos.
            showLoginError(alertMessage, 'La contraseña debe tener 8 caracteres como mínimo.');
            markLoginFieldInvalid('passwordInput');
            return;
        }

        // 2. VALIDACIÓN DEL LADO DEL SERVIDOR (Nueva lógica JWT)

        // Preparamos el payload JSON que espera AuthRequest.java
        const loginPayload = {
            correo: email,
            password: password
        };

        try {
            // Hacemos fetch al endpoint de tu AuthContoller.java
            const loginResponse = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload)
            });

            const responseData = await loginResponse.json();

            // Si la respuesta no es OK (ej. 401 Unauthorized), las credenciales son incorrectas
            if (!loginResponse.ok) {
                // Leemos el mensaje de error de AuthResponse
                const errorMessage = responseData.token || 'Email o contraseña incorrectos.';
                console.log('❌ Credenciales incorrectas para:', email);
                showLoginError(alertMessage, errorMessage);
                markLoginFieldInvalid('emailInput');
                markLoginFieldInvalid('passwordInput');
                return;
            }

            // 3. LOGIN EXITOSO (authData = AuthResponse)
            console.log('✓ Login exitoso. Token recibido.');
            
            // ¡IMPORTANTE! Guardar el token JWT en localStorage
            localStorage.setItem('jwtToken', responseData.token);
            
            // Ahora, en lugar de buscar en el backend, usamos los datos
            // que ya nos envió el AuthResponse.
            // PERO, AuthResponse no incluye 'nombre' o 'telefono'.
            // Vamos a guardar lo que tenemos por ahora.
            const sesion = {
                // No tenemos ID de usuario, nombre o teléfono en AuthResponse.
                // Usamos el email como ID temporal si es necesario.
                usuarioId: responseData.correo, 
                nombre: responseData.correo.split('@')[0], // Usamos el email como 'nombre' temporal
                correo: responseData.correo,
                rol: responseData.rol, // ¡Sí tenemos el rol!
                fechaLogin: new Date().toISOString()
            };

            localStorage.setItem('sesionActiva', JSON.stringify(sesion));
            console.log('✓ Sesión guardada (JWT):', sesion);

            const nombreUsuario = sesion.nombre;
            
            emailInput.style.display = 'none';
            passwordInput.parentElement.style.display = 'none';
            loginButton.style.display = 'none';
            
            showLoginSuccess(alertMessage, `¡Bienvenido, ${nombreUsuario}!`);

            setTimeout(() => {
                if (typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(loginModal) || new bootstrap.Modal(loginModal);
                    modalInstance.hide();
                }
                console.log('→ Redirigiendo a la página principal...');
                
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 1000);
            }, 3000);

        } catch (error) {
            // Captura errores de red (ej. backend caído)
            console.error('Error de red durante el login:', error);
            showLoginError(alertMessage, 'No se pudo conectar al servidor. Intente más tarde.');
        }
    });

    // ==================================================================
    // === FIN DE LA SECCIÓN MODIFICADA ===
    // ==================================================================


    // VALIDACIÓN EN TIEMPO REAL (Sin cambios)
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
                feedback.textContent = 'La contraseña debe tener 8 caracteres como mínimo.';
                feedback.style.display = 'block';
            }
        } else {
            this.classList.remove('is-invalid', 'is-valid');
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.style.display = 'none';
            }
        }
    });

    // EVENTOS DEL MODAL (Sin cambios)
    loginModal.addEventListener('hidden.bs.modal', () => {
        console.log('→ Modal de login cerrado');
        limpiarCamposLogin();

        const video = document.getElementById('loginVideo');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    });

    loginModal.addEventListener('shown.bs.modal', () => {
        console.log('→ Modal de login abierto');
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

    // OBSERVADOR: Corregir aria-hidden dinámicamente (Sin cambios)
    const observer = new MutationObserver(() => {
        corregirAccesibilidadModales();
    });

    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['aria-hidden', 'class'],
        subtree: true
    });

    // UTILIDADES DE CONSOLA (Función 'cerrarSesion' ACTUALIZADA)
    window.verSesionActiva = function () {
        const sesion = localStorage.getItem('sesionActiva');
        const token = localStorage.getItem('jwtToken');
        
        if (token) {
             console.log('Token JWT Activo:', token);
        } else {
             console.log('No hay Token JWT');
        }
        
        if (sesion) {
            try {
                const obj = JSON.parse(sesion);
                console.log('Datos de sesión activa:');
                console.table([obj]);
                return obj;
            } catch (error) {
                console.error('Error al leer sesión:', error);
            }
        } else {
            console.log('No hay datos de sesión activa');
        }
    };

    window.cerrarSesion = function () {
        // ACTUALIZADO: Borrar ambos, la sesión y el token JWT
        localStorage.removeItem('sesionActiva');
        localStorage.removeItem('jwtToken'); 
        console.log('✓ Sesión y Token JWT cerrados correctamente');
        window.location.reload();
    };

    window.limpiarLogin = function () {
        limpiarCamposLogin();
        console.log('✓ Campos de login limpiados');
    };

    window.verTodosLosUsuarios = function() {
        console.warn('Esta función (verTodosLosUsuarios) solo muestra usuarios del obsoleto localStorage "usuarios".');
        const usuarios = obtenerUsuarios();
        if (usuarios.length > 0) {
            console.log('Total de usuarios (localStorage "usuarios"):', usuarios.length);
            console.table(usuarios);
        } else {
            console.log('No hay usuarios registrados (en localStorage "usuarios")');
        }
    };

    // Mostrar sesión activa al cargar (si existe)
    const sesionActual = localStorage.getItem('sesionActiva');
    if (sesionActual) {
        console.log('✓ Sesión activa encontrada');
        verSesionActiva();
    }
    
    // === LÓGICA PARA EL BOTÓN DE USUARIO === (Sin cambios)
    
    const userButtons = document.querySelectorAll('.btn-action-user');
    const welcomeModalElement = document.getElementById('welcomeModal');
    const loginModalElement = document.getElementById('loginModal'); 
    const btnLogout = document.getElementById('btnLogout');

    userButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const sesionActiva = localStorage.getItem('sesionActiva');

            if (sesionActiva) {
                const usuario = JSON.parse(sesionActiva);
                const nombreDisplay = document.getElementById('welcomeUserName');
                const correoDisplay = document.getElementById('welcomeUserEmail');
                
                // Ahora podemos leer el 'rol' que guardamos en la sesión
                if (usuario.rol === 'ADMINISTRADOR') { // Tu AuthResponse usa 'ADMINISTRADOR'
                     nombreDisplay.textContent = `¡Bienvenido Administrador!`;
                     nombreDisplay.classList.add('text-danger'); 
                } else {
                     // Usamos 'nombre' que (por ahora) es el email
                     nombreDisplay.textContent = `¡Hola, ${usuario.nombre}!`;
                     nombreDisplay.classList.remove('text-danger');
                }
                
                if(correoDisplay) correoDisplay.textContent = usuario.correo;

                const welcomeModal = new bootstrap.Modal(welcomeModalElement);
                welcomeModal.show();

            } else {
                const loginModal = new bootstrap.Modal(loginModalElement);
                loginModal.show();
            }
        });
    });

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            // Usamos la función global para asegurar que también se borre el token
            window.cerrarSesion(); 
        });
    }


    //bloquear el boton cuando de click en finalizar compra
    const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');

    btnFinalizarCompra.addEventListener('click', function(event) {
        
        const sesionJSON = localStorage.getItem('sesionActiva');
        const sesion = JSON.parse(sesionJSON);
            
            // 2. Obtiene los datos de autenticación de localStorage
            const userToken = localStorage.getItem('jwtToken'); 
            const userEmail = sesion.correo; // Si tienes el email en la sesión
            
            // Condición: el usuario debe tener AMBOS (token y email)
            const hasValidAccount = userToken && userEmail;

            if (!hasValidAccount) {
                // Si no tiene token O no tiene email:
                event.preventDefault(); // <-- **IMPORTANTE:** Detiene la acción por defecto
                
                // Muestra el modal con el mensaje de error: "No tienes una cuenta"
                unauthorizedModal.show();
                
                console.warn("Finalización de Compra bloqueada. El usuario debe iniciar sesión.");
            } else {
                // Si la cuenta es válida, permite la acción por defecto o inicia el proceso.
                console.log("Usuario autorizado. Redireccionando al checkout...");
                // Aquí podrías agregar la lógica final de redirección o inicio de API
                // window.location.href = '/paginas/checkout.html';
            }
    });
    

});
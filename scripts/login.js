// SISTEMA DE LOGIN - VERSIÓN OPTIMIZADA SIN ERRORES

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
        console.error(' Error: Elementos del login no encontrados. Verifica los IDs en el HTML.');
        return;
    }

    // BOTÓN DE MOSTRAR/OCULTAR CONTRASEÑA
    const togglePasswordButton = document.getElementById('toggleLoginPassword');
    
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar el ícono
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('bi-eye');
                icon.classList.toggle('bi-eye-slash');
            }
        });
    }

    // CORRECCIÓN: Eliminar aria-hidden de modales
    function corregirAccesibilidadModales() {
        const modales = document.querySelectorAll('.modal[aria-hidden="true"]');
        modales.forEach(modal => {
            // Si el modal tiene tabindex, removemos aria-hidden para evitar conflictos
            if (modal.hasAttribute('tabindex')) {
                modal.removeAttribute('aria-hidden');
            }
        });
    }

    // Ejecutar corrección al cargar
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
        
        // Restaurar visibilidad de los campos
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
        
        // Ocultar mensaje de error de contraseña
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

    // EVENTO: PROCESO DE LOGIN
    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('→ Procesando inicio de sesión...');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const alertMessage = crearAlertaLogin();

        clearLoginValidationStates();

        // Validación: campos vacíos
        if (!email || !password) {
            showLoginError(alertMessage, 'Por favor, complete todos los campos.');
            if (!email) markLoginFieldInvalid('emailInput');
            if (!password) markLoginFieldInvalid('passwordInput');
            return;
        }

        // Validación: formato de email
        if (!validarEmail(email)) {
            showLoginError(alertMessage, 'Ingrese un correo electrónico válido.');
            markLoginFieldInvalid('emailInput');
            return;
        }

        // Validación: longitud de contraseña
        if (password.length < 8) {
            showLoginError(alertMessage, 'La contraseña debe tener 8 caracteres como mínimo.');
            markLoginFieldInvalid('passwordInput');
            const parentDiv = passwordInput.parentElement;
            const feedback = parentDiv?.nextElementSibling;
            if (feedback && feedback.classList.contains('invalid-feedback')) {
                feedback.textContent = 'La contraseña debe tener 8 caracteres como mínimo.';
                feedback.style.display = 'block';
            }
            return;
        }

        // Verificar si existe usuario registrado
        const usuarioGuardado = localStorage.getItem('usuarioRegistrado');
        if (!usuarioGuardado) {
            showLoginError(alertMessage, 'No existe una cuenta registrada. Por favor, regístrese primero.');
            markLoginFieldInvalid('emailInput');
            return;
        }

        // Parsear datos del usuario
        let usuario;
        try {
            usuario = JSON.parse(usuarioGuardado);
        } catch (error) {
            console.error('Error al parsear datos del usuario:', error);
            showLoginError(alertMessage, 'Error al procesar los datos. Intente nuevamente.');
            return;
        }

        // Validación: correo incorrecto
        if (usuario.correo !== email) {
            showLoginError(alertMessage, 'Correo electrónico incorrecto.');
            markLoginFieldInvalid('emailInput');
            return;
        }

        // Validación: contraseña incorrecta
        if (usuario.contraseña !== password) {
            showLoginError(alertMessage, 'Contraseña incorrecta.');
            markLoginFieldInvalid('passwordInput');
            return;
        }

        // ✓ LOGIN EXITOSO
        console.log(' Login exitoso:', usuario.nombre);

        const sesion = {
            usuarioId: usuario.id || Date.now(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            fechaLogin: new Date().toISOString()
        };

        try {
            localStorage.setItem('sesionActiva', JSON.stringify(sesion));
        } catch (error) {
            console.error('Error al guardar sesión:', error);
            showLoginError(alertMessage, 'Error al iniciar sesión. Intente nuevamente.');
            return;
        }

        const nombreUsuario = usuario.nombre.split(' ')[0];
        
        // Ocultar los campos del formulario para dar protagonismo al mensaje
        emailInput.style.display = 'none';
        passwordInput.parentElement.style.display = 'none';
        loginButton.style.display = 'none';
        
        // Mostrar el mensaje de éxito
        showLoginSuccess(alertMessage, `¡Bienvenido a Mueblería España, ${nombreUsuario}!`);

        // CAMBIO: Dar tiempo suficiente para que el usuario vea bien el mensaje de éxito
        // Esperar 5 segundos antes de cerrar el modal
        setTimeout(() => {
            if (typeof bootstrap !== 'undefined') {
                const modalInstance = bootstrap.Modal.getInstance(loginModal) || new bootstrap.Modal(loginModal);
                modalInstance.hide();
            }
            console.log('→ Redirigiendo a la página principal...');
            
            // Redirigir 1 segundo después de cerrar el modal
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }, 5000);
    });

    // VALIDACIÓN EN TIEMPO REAL
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
        // Buscar el div de feedback que está después del div contenedor
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

    // EVENTOS DEL MODAL
    loginModal.addEventListener('hidden.bs.modal', () => {
        console.log('→ Modal de login cerrado');
        limpiarCamposLogin();

        // Detener video si existe
        const video = document.getElementById('loginVideo');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
    });

    loginModal.addEventListener('shown.bs.modal', () => {
        console.log('→ Modal de login abierto');
        
        //LIMPIEZA INMEDIATA: Limpiar campos al abrir el modal
    limpiarCamposLogin();
    
        // Reproducir video si existe
        const video = document.getElementById('loginVideo');
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => {
                // Silenciar error de autoplay bloqueado
            });
        }

        // Focus en el campo de email
        setTimeout(() => {
            emailInput.focus();
        }, 300);
    });

    // OBSERVADOR: Corregir aria-hidden dinámicamente
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
                console.table([obj]);
                return obj;
            } catch (error) {
                console.error(' Error al leer sesión:', error);
            }
        } else {
            console.log(' No hay sesión activa');
        }
    };

    window.cerrarSesion = function () {
        localStorage.removeItem('sesionActiva');
        console.log(' Sesión cerrada correctamente');
        window.location.reload();
    };

    window.limpiarLogin = function () {
        limpiarCamposLogin();
        console.log('✓ Campos de login limpiados');
    };

    // Mostrar sesión activa al cargar (si existe)
    const sesionActual = localStorage.getItem('sesionActiva');
    if (sesionActual) {
        console.log('✓ Sesión activa encontrada:');
        verSesionActiva();
    }
});
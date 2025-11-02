// SISTEMA DE LOGIN - MULTI-USUARIO

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

        // CORREGIDO: Buscar en el array de usuarios
        const usuarios = obtenerUsuarios();
        
        if (usuarios.length === 0) {
            showLoginError(alertMessage, 'No hay usuarios registrados. Por favor, regístrese primero.');
            markLoginFieldInvalid('emailInput');
            return;
        }

        // Buscar el usuario por correo
        const usuario = buscarUsuarioPorCorreo(email);

        if (!usuario) {
            showLoginError(alertMessage, 'Correo electrónico no registrado.');
            markLoginFieldInvalid('emailInput');
            console.log('❌ Usuario no encontrado con el correo:', email);
            return;
        }

        // Validación: contraseña incorrecta
        if (usuario.contraseña !== password) {
            showLoginError(alertMessage, 'Contraseña incorrecta.');
            markLoginFieldInvalid('passwordInput');
            console.log('❌ Contraseña incorrecta para:', email);
            return;
        }

        // ✓ LOGIN EXITOSO
        console.log('✓ Login exitoso:', usuario.nombre);

        const sesion = {
            usuarioId: usuario.id || Date.now(),
            nombre: usuario.nombre,
            correo: usuario.correo,
            telefono: usuario.telefono,
            fechaLogin: new Date().toISOString()
        };

        try {
            localStorage.setItem('sesionActiva', JSON.stringify(sesion));
            console.log('✓ Sesión guardada:', sesion);
        } catch (error) {
            console.error('Error al guardar sesión:', error);
            showLoginError(alertMessage, 'Error al iniciar sesión. Intente nuevamente.');
            return;
        }

        const nombreUsuario = usuario.nombre.split(' ')[0];
        
        // Ocultar los campos del formulario
        emailInput.style.display = 'none';
        passwordInput.parentElement.style.display = 'none';
        loginButton.style.display = 'none';
        
        // Mostrar el mensaje de éxito
        showLoginSuccess(alertMessage, `¡Bienvenido a Mueblería España, ${nombreUsuario}!`);

        // Cerrar modal y redirigir
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
                console.log('Sesión activa:');
                console.table([obj]);
                return obj;
            } catch (error) {
                console.error('Error al leer sesión:', error);
            }
        } else {
            console.log('No hay sesión activa');
        }
    };

    window.cerrarSesion = function () {
        localStorage.removeItem('sesionActiva');
        console.log('✓ Sesión cerrada correctamente');
        window.location.reload();
    };

    window.limpiarLogin = function () {
        limpiarCamposLogin();
        console.log('✓ Campos de login limpiados');
    };

    window.verTodosLosUsuarios = function() {
        const usuarios = obtenerUsuarios();
        if (usuarios.length > 0) {
            console.log('Total de usuarios:', usuarios.length);
            console.table(usuarios);
        } else {
            console.log('No hay usuarios registrados');
        }
    };

    // Mostrar sesión activa al cargar (si existe)
    const sesionActual = localStorage.getItem('sesionActiva');
    if (sesionActual) {
        console.log('✓ Sesión activa encontrada');
        verSesionActiva();
    }
});
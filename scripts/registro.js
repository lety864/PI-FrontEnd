document.addEventListener('DOMContentLoaded', function() {
    
    // FUNCIONES AUXILIARES PARA MENSAJES DE ALERTA

    /**
     * Función genérica para mostrar un mensaje de alerta de Bootstrap.
     * @param {HTMLElement} formElement - El elemento <form> donde se insertará la alerta.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de alerta 
     */
    function renderAlert(formElement, message, type) {
        // Estructura HTML de la alerta de Bootstrap con botón de cierre
        const alertHtml = `<div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
        
        // El selector busca el contenedor del botón de submit para insertarlo después
        const submitButtonContainer = formElement.querySelector('.d-grid.gap-2');
        
        // Limpiar alertas previas en este formulario
        const existingAlert = formElement.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        
        // Insertar la nueva alerta justo después del botón de submit
        if (submitButtonContainer) {
             submitButtonContainer.insertAdjacentHTML('afterend', alertHtml);
        } else {
             // Opción de respaldo si la estructura del botón cambia
             formElement.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    function renderError(formElement, message) {
        renderAlert(formElement, message, 'danger');
    }

    function renderSuccess(formElement, message) {
        renderAlert(formElement, message, 'success');
    }


    // REGISTRO

    const registerFormEl = document.getElementById('registerForm');
    
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', (event) => {
            event.preventDefault();

            // Obtener todos los valores del formulario usando los IDs correctos del HTML
            const fullName = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;

            // Verificar si las contraseñas no coinciden
            if (password !== confirmPassword) {
                renderError(registerFormEl, 'Las contraseñas no coinciden.');
                return;
            }

            //  Verificar si el usuario ya existe
            const storedUser = localStorage.getItem('user_' + email);
            if (storedUser) {
                 renderError(registerFormEl, 'Este correo ya está registrado.');
                 return;
            }

            // 3. Registrar usuario
            const userData = { fullName, email, phone, password };
            // Guardar los datos en el localStorage (usando el email como prefijo para unicidad)
            localStorage.setItem('user_' + email, JSON.stringify(userData));

            // 4. Mostrar éxito y resetear
            renderSuccess(registerFormEl, ' Registro exitoso. ¡Ahora puedes iniciar sesión!');
            registerFormEl.reset();
        });
    }

    //  INICIO DE SESIÓN

    const loginFormEl = document.getElementById('loginForm');
    
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', (event) => {
            event.preventDefault();

            // Obtener valores del formulario de login
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;

            // 1. Obtener los datos del usuario de localStorage
            const storedUser = localStorage.getItem('user_' + email);

            if (!storedUser) {
                // Usuario no encontrado
                renderError(loginFormEl, 'Correo electrónico o contraseña incorrectos.');
                return;
            }

            const userData = JSON.parse(storedUser);

            // 2. Verificar la contraseña
            if (userData.password !== password) {
                renderError(loginFormEl, 'Correo electrónico o contraseña incorrectos.');
                return;
            }

            // 3. Inicio de sesión exitoso
            renderSuccess(loginFormEl, `¡Bienvenido(a) de nuevo, ${userData.fullName}!`);
            loginFormEl.reset();

            setTimeout(() => {
                // Se asegura de que Bootstrap esté disponible antes de intentar cerrar el modal
                if (window.bootstrap) { 
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    if (loginModal) {
                        loginModal.hide();
                    }
                }
            }, 2000); 
        });
    }
    
    //  FUNCIONALIDAD DEL OJO (Toggle Password)

    function setupPasswordToggle(toggleId, inputId, iconId) {
        const toggleButton = document.getElementById(toggleId);
        const passwordInput = document.getElementById(inputId);
        const eyeIcon = document.getElementById(iconId);

        if (toggleButton && passwordInput && eyeIcon) {
            toggleButton.addEventListener('click', function () {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                // Alternar el icono de Bootstrap Icons
                eyeIcon.classList.toggle('bi-eye-slash');
                eyeIcon.classList.toggle('bi-eye');
            });
        }
    }

    // Inicializar la funcionalidad para todos los campos de contraseña
    setupPasswordToggle('togglePassword', 'passwordInput', 'eyeIconLogin'); // Login
    setupPasswordToggle('toggleRegPassword', 'regPassword', 'eyeIconReg'); // Registro (Contraseña)
    setupPasswordToggle('toggleRegConfirmPassword', 'regConfirmPassword', 'eyeIconRegConfirm'); // Registro (Confirmar)
});
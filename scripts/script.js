
function setupPasswordToggle(toggleId, inputId, iconId) {
    // Obtiene los elementos del DOM usando sus IDs
    const toggleButton = document.getElementById(toggleId);
    const passwordInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    // Verifica que todos los elementos existan antes de añadir el evento
    if (toggleButton && passwordInput && eyeIcon) {
        toggleButton.addEventListener('click', function () {
            // Si es 'password', lo cambia a 'text' para mostrarla; si no, lo vuelve a 'password' para ocultarla.
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Alterna entre el icono de ojo cerrado (bi-eye-slash) y ojo abierto (bi-eye).
            eyeIcon.classList.toggle('bi-eye-slash');
            eyeIcon.classList.toggle('bi-eye');
        });
    }
}

// Modal de Inicio de Sesión
setupPasswordToggle('togglePassword', 'passwordInput', 'eyeIconLogin');

//Modal de Registro (Contraseña principal)
setupPasswordToggle('toggleRegPassword', 'regPassword', 'eyeIconReg');

// Modal de Registro (Confirmar Contraseña)
setupPasswordToggle('toggleRegConfirmPassword', 'regConfirmPassword', 'eyeIconRegConfirm');
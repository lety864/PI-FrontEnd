document.addEventListener('DOMContentLoaded', function() {
    const formEl = document.getElementById('registerForm');

    formEl.addEventListener('submit', (event) => {
        event.preventDefault();

        // Obtener todos los valores del formulario
        const fullName = formEl.elements['fullName'].value;
        const email = formEl.elements['email'].value;
        const phone = formEl.elements['phone'].value;
        const password = formEl.elements['password'].value;
        const confirmPassword = formEl.elements['confirmPassword'].value;

        // Verificar si las contraseñas coinciden
        if (password !== confirmPassword) {
            renderError('Las contraseñas no coinciden');
            return;
        }

        // Crear objeto con los datos del usuario
        const userData = { fullName, email, phone, password };

        // Guardar los datos en el localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Mostrar un mensaje de éxito y resetear el formulario
        renderSuccess('Registro exitoso');
        formEl.reset();
    });

    // Función para mostrar un error en (rojo)
    function renderError(message) {
        const alert = `<div class="alert alert-danger" role="alert">${message}</div>`;
        const existingAlert = formEl.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        formEl.insertAdjacentHTML('afterbegin', alert);
    }

    // Función para mostrar el registro con éxito en (verde)
    function renderSuccess(message) {
        const alert = `<div class="alert alert-success" role="alert">${message}</div>`;
        const existingAlert = formEl.querySelector('.alert');
        if (existingAlert) existingAlert.remove();
        formEl.insertAdjacentHTML('afterbegin', alert);
    }
});
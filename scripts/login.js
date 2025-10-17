document.addEventListener("DOMContentLoaded", () => {
    //  Elementos del DOM 
    const form = document.getElementById("loginForm");
    const alertMessage = document.getElementById("alertMessage");
    const emailInput = document.getElementById("emailInput");
    const passwordInput = document.getElementById("passwordInput");
    const togglePassword = document.getElementById("togglePassword");
    const eyeIcon = document.getElementById("eyeIconLogin");

    // Usuario de prueba (solo si no existen usuarios guardados)
    if (!localStorage.getItem("users")) {
        const defaultUser = [
            { email: "uriel12@email.com", password: btoa("123456") } 
        ];
        localStorage.setItem("users", JSON.stringify(defaultUser));
    }

    // Ahora controla las clases 'alert-success' y 'alert-danger'
    const showMessage = (message, success = false) => {
        alertMessage.textContent = message;
        
        // 1. Asegurarse de que sea visible (quitando d-none)
        alertMessage.classList.remove("d-none");
        
        // 2. Controlar las clases de color de la ALERTA
        if (success) {
            alertMessage.classList.remove("alert-danger");
            alertMessage.classList.add("alert-success");
        } else {
            alertMessage.classList.remove("alert-success");
            alertMessage.classList.add("alert-danger");
        }
    };

    // Mostrar/Ocultar contraseña 
    if (togglePassword && passwordInput && eyeIcon) {
        togglePassword.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            
            eyeIcon.classList.toggle("bi-eye");
            eyeIcon.classList.toggle("bi-eye-slash");
        });
    }

    //Validar formato de correo 
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    //  Al enviar el formulario 
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        // Codificamos la contraseña ingresada para compararla con la guardada
        const encodedPassword = btoa(password);

        // Ocultar mensaje de alerta previo (en caso de que estuviera visible con otro mensaje)
        alertMessage.classList.add("d-none");

        // Validaciones básicas
        if (!email || !password) {
            showMessage("Por favor, completa todos los campos.", false);
            return;
        }

        if (!isValidEmail(email)) {
            showMessage("Por favor, introduce un correo electrónico válido.", false);
            return;
        }

        // Obtener usuarios del Local Storage
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Buscar coincidencia (email Y contraseña codificada)
        const userExists = users.find(
            (user) => user.email === email && user.password === encodedPassword
        );

        if (userExists) {
            // Inicio de sesión exitoso
            showMessage("Inicio de sesión exitoso. ¡Bienvenido a Mueblería España!", true);

            // Guardar usuario logueado 
            localStorage.setItem("activeUser", JSON.stringify(userExists));

            setTimeout(() => {
                // Redirige a la página principal
                window.location.replace("../index.html"); 
            }, 1500);
        } else {
            // Credenciales incorrectas
            showMessage("Correo electrónico o contraseña inválidos.", false);
        }
    });
});

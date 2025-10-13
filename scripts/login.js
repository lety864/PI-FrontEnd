document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const alertMessage = document.getElementById("alertMessage");
  const togglePassword = document.getElementById("togglePassword");
  const password = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  // Ojo para mostrar y ocultar la contraseña
  togglePassword.addEventListener("click", () => {
    const isPassword = password.type === "password";
    password.type = isPassword ? "text" : "password";
    eyeIcon.classList.toggle("bi-eye");
    eyeIcon.classList.toggle("bi-eye-slash");
  });

  // Usuario de prueba 
  const testUser = { username: "usuario123", password: btoa("123456") };

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify([testUser]));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById("username").value;
    const passwordInput = btoa(password.value);
   // Guardar datos en el localStorage 

    const users = JSON.parse(localStorage.getItem("users"));

    const userFound = users.find(
      (user) => user.username === usernameInput && user.password === passwordInput
    );

    if (userFound) {
      alertMessage.classList.add("d-none");
      alert("¡Bienvenido de nuevo a Mueblería España!");

      // Redirigir después de 1.5s
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    } else {
      alertMessage.textContent = "Nombre de usuario o contraseña inválidos";
      alertMessage.classList.remove("d-none");
    }
  });
});


// --- Lógica para el Modal de Inicio de Sesión ---
  const loginModalEl = document.getElementById('loginModal');
  const loginVideo = document.getElementById('loginVideo');

  // Escucha cuando el modal de login se va a mostrar
  loginModalEl.addEventListener('show.bs.modal', event => {
    // Reinicia el video al principio
    loginVideo.currentTime = 0;
    // Reproduce el video
    loginVideo.play();
  });


  // --- Lógica para el Modal de Registro ---
  const registerModalEl = document.getElementById('registerModal');
  const registerVideo = document.getElementById('registerVideo');

  // Escucha cuando el modal de registro se va a mostrar
  registerModalEl.addEventListener('show.bs.modal', event => {
    // Reinicia el video al principio
    registerVideo.currentTime = 0;
    // Reproduce el video
    registerVideo.play();
  });

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
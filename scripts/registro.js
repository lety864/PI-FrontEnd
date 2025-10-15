const form = document.getElementById('registerForm');
const successMessage = document.getElementById('successMessage');

//  Función principal de envío de formulario 
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Evita recargar la página

  // Obtener valores de los campos
  const fullname = document.getElementById('fullname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const phone = document.getElementById('phone').value.trim();

  // Validar contraseñas
  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden. Intenta nuevamente.');
    return;
  }

  // Crear objeto con los datos
  const ObjectData = {
    nombreCompleto: fullname,
    correoElectronico: email,
    contraseña: password,
    telefono: phone
  };

  // Mostrar mensaje de éxito
  successMessage.style.display = 'block';
  successMessage.textContent = 'Registro exitoso. ¡Bienvenido!';

  // Ocultar mensaje de éxito después de 5 segundos
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 5000);

  // Mostrar datos en consola como JSON
  console.log("Datos del registro:", JSON.stringify(ObjectData, null, 2));

  // Limpiar formulario
  form.reset();
});

// --- Función para Mostrar/Ocultar contraseñas (ícono de ojo) ---
function setupPasswordToggle(toggleButtonId, passwordInputId, eyeIconId) {
  const toggleButton = document.getElementById(toggleButtonId);
  const passwordInput = document.getElementById(passwordInputId);
  const eyeIcon = document.getElementById(eyeIconId);

  if (toggleButton && passwordInput && eyeIcon) {
    toggleButton.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);

      // Cambia el ícono según el estado
      if (type === 'text') {
        eyeIcon.classList.remove('bi-eye-slash');
        eyeIcon.classList.add('bi-eye');
      } else {
        eyeIcon.classList.remove('bi-eye');
        eyeIcon.classList.add('bi-eye-slash');
      }
    });
  }
}


//  Contraseña principal (Crea una Contraseña)
setupPasswordToggle('toggleRegisterPassword', 'password', 'eyeIconPassword');

//  Confirmar Contraseña
setupPasswordToggle('toggleConfirmRegisterPassword', 'confirmPassword', 'eyeIconConfirmPassword');
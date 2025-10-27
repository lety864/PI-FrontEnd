// Manejo del formulario de recuperación de contraseña
document.getElementById('recoveryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const email = document.getElementById('recoveryEmail').value.trim();
  const alertDiv = document.getElementById('recoveryAlertMessage');
  
  // Validar que el email no esté vacío
  if (!email) {
    showRecoveryAlert('Por favor ingresa tu correo electrónico.', 'danger');
    return;
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showRecoveryAlert('Por favor ingresa un correo electrónico válido.', 'danger');
    return;
  }
  
  // Aquí iría la llamada a tu API para enviar el correo de recuperación
  // Por ahora simulamos el envío
  simulatePasswordRecovery(email);
});

// Función para simular el envío del correo de recuperación
function simulatePasswordRecovery(email) {
  const submitButton = document.querySelector('#recoveryForm button[type="submit"]');
  const originalText = submitButton.innerHTML;
  
  // Deshabilitar el botón y mostrar estado de carga
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enviando...';
  
  setTimeout(() => {
    showRecoveryAlert(
      `<div class="text-center">
        Se ha enviado un enlace de recuperación a<br>
        <strong>${email}</strong><br>
        Por favor revisa tu bandeja de entrada.
      </div>`,
      'success'
    );
    
    // Limpiar el formulario
    document.getElementById('recoveryForm').reset();
    
    // Restaurar el botón
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
    
    // Opcional: Cerrar el modal después de 3 segundos
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(document.getElementById('recoveryModal'));
      if (modal) {
        modal.hide();
        // Limpiar mensaje al cerrar
        setTimeout(() => {
          document.getElementById('recoveryAlertMessage').classList.add('d-none');
        }, 300);
      }
    }, 3000);
    
  }, 1500); // Simular 1.5 segundos de espera
}

// Función para mostrar alertas en el modal de recuperación
function showRecoveryAlert(message, type) {
  const alertDiv = document.getElementById('recoveryAlertMessage');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = message;
  alertDiv.classList.remove('d-none');
}

// Limpiar mensajes cuando se cierra el modal de recuperación
document.getElementById('recoveryModal').addEventListener('hidden.bs.modal', function () {
  document.getElementById('recoveryForm').reset();
  document.getElementById('recoveryAlertMessage').classList.add('d-none');
});

// Limpiar mensajes cuando se abre el modal de recuperación
document.getElementById('recoveryModal').addEventListener('show.bs.modal', function () {
  document.getElementById('recoveryAlertMessage').classList.add('d-none');
});
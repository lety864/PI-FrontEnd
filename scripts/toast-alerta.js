/* =================================================================
   ARCHIVO: toast-alerta.js
   DESCRIPCIÓN: Solo la función del toast para alertas
   ================================================================= */

function mostrarToast(titulo, mensaje, tipo = 'success') {
    // Crear contenedor de toasts si no existe
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Iconos y colores según el tipo
    const config = {
        'success': {
            icon: 'bi-check-circle-fill',
            bgClass: 'bg-success',
            textClass: 'text-white'
        },
        'danger': {
            icon: 'bi-exclamation-triangle-fill',
            bgClass: 'bg-danger',
            textClass: 'text-white'
        },
        'info': {
            icon: 'bi-info-circle-fill',
            bgClass: 'bg-info',
            textClass: 'text-white'
        },
        'warning': {
            icon: 'bi-exclamation-circle-fill',
            bgClass: 'bg-warning',
            textClass: 'text-dark'
        }
    };

    const { icon, bgClass, textClass } = config[tipo] || config['success'];

    // Crear el toast
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} ${textClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${icon} me-2"></i>
                    <strong>${titulo}:</strong> ${mensaje}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    // Insertar el toast en el contenedor
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    // Inicializar y mostrar el toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });

    toast.show();

    // Eliminar el toast del DOM después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Hacer la función disponible globalmente
window.mostrarToast = mostrarToast;
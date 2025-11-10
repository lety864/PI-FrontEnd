/* =================================================================
   ARCHIVO: carrito-global.js
   DESCRIPCIÓN: Script para agregar productos y actualizar el badge.
   INCLUIR EN: TODAS LAS PÁGINAS.
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Escuchar clics en los botones "Agregar al Carrito"
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-add-cart')) {
            e.preventDefault(); // Prevenir cualquier acción default
            
            // Encontrar la "tarjeta" del producto más cercana
            const productCard = e.target.closest('.product-card');
            
            if (productCard) {
                agregarProductoAlCarrito(productCard);
            }
        }
    });

    // 2. Actualizar el badge al cargar cualquier página
    actualizarBadgeCarrito();
});

function agregarProductoAlCarrito(productCard) {
    // 1. Obtener la información del producto
    const nombre = productCard.querySelector('.product-title').textContent;
    const precioTexto = productCard.querySelector('.current-price').textContent;
    const imagenSrc = productCard.querySelector('.product-image').src;

    // 2. Limpiar y convertir el precio a número
    // Quita "$", "MXN", "," y espacios
    const precio = parseFloat(precioTexto.replace(/\$|MXN|,/g, '').trim());

    // 3. CORRECCIÓN IMPORTANTE DE RUTA DE IMAGEN:
    // Normalizar la ruta para que funcione en el carrito.
    // Convertimos "../assets/" en "/assets/"
    const imagenNormalizada = new URL(imagenSrc, window.location.href).pathname;


    const producto = {
        // Usamos el nombre como ID; en un sistema real, usarías un SKU o ID de producto
        id: nombre, 
        nombre: nombre,
        precio: precio,
        imagen: imagenNormalizada, // Usamos la ruta normalizada
        cantidad: 1
    };

    // 4. Traer el carrito actual de localStorage (o crear uno vacío)
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 5. Verificar si el producto ya existe en el carrito
    const productoExistenteIndex = carrito.findIndex(item => item.id === producto.id);

    if (productoExistenteIndex !== -1) {
        // Si existe, solo aumenta la cantidad
        carrito[productoExistenteIndex].cantidad++;
    } else {
        // Si no existe, lo agrega al carrito
        carrito.push(producto);
    }

    // 6. Guardar el carrito actualizado en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));

    // 7. Dar retroalimentación al usuario con Toast
    mostrarToast('Producto agregado al carrito', producto.nombre, 'success');

    // 8. Actualizar el badge
    actualizarBadgeCarrito();
}

function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    
    // Suma la 'cantidad' de todos los productos en el carrito
    const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);

    // Seleccionar TODOS los badges (móvil y desktop)
    const badges = document.querySelectorAll('.navbar .badge');

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('d-none'); // Mostrar el badge
        } else {
            badge.classList.add('d-none'); // Ocultar si el carrito está vacío
        }
    });
}

/**
 * Muestra un toast de Bootstrap con notificación
 * @param {string} titulo - Título del toast
 * @param {string} mensaje - Mensaje del toast
 * @param {string} tipo - Tipo: 'success', 'danger', 'info', 'warning'
 */
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
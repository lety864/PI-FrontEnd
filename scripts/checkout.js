/* =================================================================
   ARCHIVO: checkout.js
   DESCRIPCIÓN: Script para renderizar el resumen del pedido en la página de checkout.
   INCLUIR EN: SÓLO EN checkout.html
   ================================================================= */

/*document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleccionar los elementos del DOM
    const resumenContenedor = document.querySelector('.col-lg-5 .card-body');
    const subtotalSpan = document.getElementById('summary-subtotal');
    const shippingSpan = document.getElementById('summary-shipping');
    const totalSpan = document.getElementById('summary-total');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const orderSuccessToast = new bootstrap.Toast(document.getElementById('orderSuccessToast'));

    // 2. Traer el carrito de localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // 3. Limpiar los items de ejemplo que están en el HTML
    // Seleccionamos la primera línea divisoria (<hr>)
    const primerHR = resumenContenedor.querySelector('hr');
    
    // Seleccionamos y borramos los items de ejemplo (los que están antes del HR)
    const itemsDeEjemplo = resumenContenedor.querySelectorAll('.d-flex.justify-content-between.align-items-center.mb-3');
    itemsDeEjemplo.forEach(item => item.remove());

    // 4. Renderizar los productos reales
    let subtotalCalculado = 0;

    if (carrito.length === 0) {
        // Si no hay productos, mostrar mensaje
        const mensajeVacio = '<p class="text-muted">Tu carrito está vacío.</p>';
        // Insertar el mensaje antes de la línea divisoria
        primerHR.insertAdjacentHTML('beforebegin', mensajeVacio);
        
    } else {
        // Si hay productos, iterar y dibujarlos
        carrito.forEach(producto => {
            const itemSubtotal = producto.precio * producto.cantidad;
            subtotalCalculado += itemSubtotal;

            const productoHtml = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <div>
                            <h6 class="mb-0">${producto.nombre}</h6>
                            <small class="text-muted">Cantidad: ${producto.cantidad}</small>
                        </div>
                    </div>
                    <span class="fw-bold">$${itemSubtotal.toFixed(2)}</span>
                </div>
            `;
            // Insertar cada producto antes de la línea divisoria
            primerHR.insertAdjacentHTML('beforebegin', productoHtml);
        });
    }

    // 5. Calcular y mostrar los totales
    // Usamos $50.00 como en tu ejemplo HTML. Puedes cambiar esta lógica.
    const costoEnvio = subtotalCalculado > 0 ? 50.00 : 0.00; 
    const totalCalculado = subtotalCalculado + costoEnvio;

    subtotalSpan.textContent = `$${subtotalCalculado.toFixed(2)}`;
    shippingSpan.textContent = `$${costoEnvio.toFixed(2)}`;
    totalSpan.textContent = `$${totalCalculado.toFixed(2)}`;

    // 6. EVENT LISTENER PARA EL BOTÓN DE REALIZAR PEDIDO
    confirmOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        console.log('Botón clickeado'); // Para debug
        
        // Validar formulario
        if (!validateForm()) {
            showError('Por favor completa todos los campos requeridos');
            return;
        }

        // Procesar el pedido
        processOrder();
    });

    function validateForm() {
        const requiredFields = checkoutForm.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add('is-invalid');
            } else {
                field.classList.remove('is-invalid');
            }
        });

        return isValid;
    }

    function processOrder() {
        console.log('Procesando pedido...'); // Para debug
        
        // Mostrar loading en el botón
        const originalText = confirmOrderBtn.innerHTML;
        confirmOrderBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Procesando...';
        confirmOrderBtn.disabled = true;

        // Simular delay de procesamiento (2 segundos)
        setTimeout(() => {
            // 1. Mostrar toast de éxito
            orderSuccessToast.show();
            console.log('Toast mostrado'); // Para debug
            
            // 2. Limpiar carrito (usa 'carrito' en lugar de 'cart')
            localStorage.removeItem('carrito');
            
            // 3. Redirigir a inicio después de 3 segundos
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 3000);

            // Restaurar botón
            confirmOrderBtn.innerHTML = originalText;
            confirmOrderBtn.disabled = false;
        }, 2000);
    }

    function showError(message) {
        // Crear toast de error temporal
        const errorToast = `
            <div class="toast align-items-center text-bg-danger border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.toast-container');
        container.insertAdjacentHTML('beforeend', errorToast);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            const toast = container.lastElementChild;
            if (toast) toast.remove();
        }, 4000);
    }

    // Validación en tiempo real
    const inputs = checkoutForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
});*/

// checkout.js - código actualizado
document.addEventListener('DOMContentLoaded', function() {
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const orderSuccessToast = document.getElementById('orderSuccessToast');
    
    if (!confirmOrderBtn) return;
    
    // Cargar productos del carrito
    cargarProductosCarrito();
    
    const toast = new bootstrap.Toast(orderSuccessToast, {
        autohide: true,
        delay: 5000
    });
    
    confirmOrderBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            alert('Por favor completa todos los campos obligatorios.');
            return;
        }
        
        // Vaciar carrito y redirigir
        localStorage.removeItem('carrito');
        toast.show();
        
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    });
    
    function cargarProductosCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        const resumenContainer = document.querySelector('.col-lg-5 .card-body');
        
        // Limpiar productos existentes (excepto totales)
        const productosElements = resumenContainer.querySelectorAll('.d-flex.justify-content-between.align-items-center.mb-3');
        productosElements.forEach(el => el.remove());
        
        // Agregar productos reales
        carrito.forEach(producto => {
            const productoHTML = `
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex align-items-center">
                        <div>
                            <h6 class="mb-0">${producto.nombre}</h6>
                            <small class="text-muted">Cantidad: ${producto.cantidad}</small>
                        </div>
                    </div>
                    <span class="fw-bold">$${(producto.precio * producto.cantidad).toFixed(2)}</span>
                </div>
            `;
            resumenContainer.insertAdjacentHTML('afterbegin', productoHTML);
        });
        
        // Actualizar totales
        if (carrito.length > 0) {
            const subtotal = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
            const totalElement = document.querySelector('.d-flex.justify-content-between.fw-bold.fs-5 span:last-child');
            if (totalElement) {
                totalElement.textContent = `$${(subtotal + 150).toFixed(2)}`;
            }
        }
    }
    
    function validarFormulario() {
        const required = ['checkout-nombre', 'checkout-apellidos', 'checkout-calle', 'checkout-colonia', 'checkout-cp', 'checkout-ciudad', 'checkout-estado'];
        return required.every(id => {
            const field = document.getElementById(id);
            return field && field.value.trim();
        });
    }
});
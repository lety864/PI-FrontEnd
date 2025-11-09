/* =================================================================
   ARCHIVO: checkout.js
   DESCRIPCIÓN: Script para renderizar el resumen del pedido en la página de checkout.
   INCLUIR EN: SÓLO EN checkout.html
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Seleccionar los elementos del DOM
    const resumenContenedor = document.querySelector('.col-lg-5 .card-body');
    const subtotalSpan = document.getElementById('summary-subtotal');
    const shippingSpan = document.getElementById('summary-shipping');
    const totalSpan = document.getElementById('summary-total');

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
    const costoEnvio = subtotalCalculado > 0 ? 0.00 : 0.00; 
    const totalCalculado = subtotalCalculado + costoEnvio;

    subtotalSpan.textContent = `$${subtotalCalculado.toFixed(2)}`;
    shippingSpan.textContent = `$${costoEnvio.toFixed(2)}`;
    totalSpan.textContent = `$${totalCalculado.toFixed(2)}`;
});
/* =================================================================
   ARCHIVO: carrito-pagina.js
   DESCRIPCIÓN: Script para renderizar y gestionar la página del carrito.
   INCLUIR EN: SÓLO EN carrito.html
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('cart-items');
    const subtotalSpan = document.getElementById('summary-subtotal');
    const shippingSpan = document.getElementById('summary-shipping');
    const totalSpan = document.getElementById('summary-total');
    const cartTotalSpan = document.getElementById('cart-total'); // El total de abajo
    const clearCartBtn = document.getElementById('clear-cart');

    // Función principal para dibujar el carrito
    function renderizarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        tbody.innerHTML = ''; // Limpiar la tabla antes de dibujar
        let subtotalGeneral = 0;

        if (carrito.length === 0) {
            // Mostrar mensaje de carrito vacío
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4">
                        Tu carrito está vacío.
                    </td>
                </tr>
            `;
            actualizarTotales(0); // Actualiza totales a 0
            return;
        }

        // Dibujar cada producto
        carrito.forEach(producto => {
            const subtotalProducto = producto.precio * producto.cantidad;
            subtotalGeneral += subtotalProducto;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="d-flex align-items-center">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="img-fluid me-3" style="width: 80px; height: 80px; object-fit: cover;">
                    <span>${producto.nombre}</span>
                </td>
                <td>$${producto.precio.toFixed(2)} MXN</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Cantidad">
                        <button class="btn btn-outline-secondary btn-sm btn-disminuir" data-id="${producto.id}">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="btn btn-sm disabled" style="min-width: 50px;">${producto.cantidad}</span>
                        <button class="btn btn-outline-secondary btn-sm btn-aumentar" data-id="${producto.id}">
                            <i class="bi bi-plus"></i>
                        </button>
                    </div>
                </td>
                <td>$${subtotalProducto.toFixed(2)} MXN</td>
                <td>
                    <button class="btn btn-danger btn-sm btn-eliminar-item" data-id="${producto.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Actualizar los totales en el HTML
        actualizarTotales(subtotalGeneral);
    }

    // Función para actualizar los resúmenes de total
    function actualizarTotales(subtotal) {
        // Obtener costo de envío. Asumamos un valor fijo o 0 si es gratis.
        const costoEnvio = 0.00; 
        
        // Si el subtotal es 0, el envío también es 0
        const envioFinal = subtotal > 0 ? costoEnvio : 0;
        
        const totalFinal = subtotal + envioFinal;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`;
        shippingSpan.textContent = `$${envioFinal.toFixed(2)} MXN`;
        totalSpan.textContent = `$${totalFinal.toFixed(2)} MXN`;
        
        // Actualiza el total grande de abajo (solo el subtotal)
        cartTotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`; 
    }

    // --- MANEJO DE EVENTOS ---

    // Evento para Vaciar Carrito
    clearCartBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
            localStorage.removeItem('carrito');
            renderizarCarrito(); // Re-dibujar (mostrará carrito vacío)
            actualizarBadgeCarrito(); // Actualizar el badge global
        }
    });

    // Evento para Eliminar un solo item (Usando delegación de eventos)
    tbody.addEventListener('click', (e) => {
        // Buscar si el clic fue en un botón de eliminar o en su ícono
        const botonEliminar = e.target.closest('.btn-eliminar-item');
        const botonAumentar = e.target.closest('.btn-aumentar');
        const botonDisminuir = e.target.closest('.btn-disminuir');

        if (botonEliminar) {
            const productoId = botonEliminar.dataset.id;
            eliminarProductoDelCarrito(productoId);
        } else if (botonAumentar) {
            const productoId = botonAumentar.dataset.id;
            cambiarCantidad(productoId, 1);
        } else if (botonDisminuir) {
            const productoId = botonDisminuir.dataset.id;
            cambiarCantidad(productoId, -1);
        }
    });

    function eliminarProductoDelCarrito(id) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Filtra el carrito, dejando fuera el producto con el id a eliminar
        carrito = carrito.filter(producto => producto.id !== id);

        // Guardar el carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Re-renderizar la tabla
        renderizarCarrito();

        // Actualizar el badge global
        actualizarBadgeCarrito();
    }

    /**
     * Cambia la cantidad de un producto en el carrito
     * @param {string} id - ID del producto
     * @param {number} delta - Cambio en cantidad (+1 o -1)
     */
    function cambiarCantidad(id, delta) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        // Buscar el producto
        const producto = carrito.find(p => p.id === id);

        if (!producto) return;

        // Cambiar la cantidad
        producto.cantidad += delta;

        // Si la cantidad llega a 0, eliminar el producto
        if (producto.cantidad <= 0) {
            eliminarProductoDelCarrito(id);
            return;
        }

        // Guardar el carrito actualizado
        localStorage.setItem('carrito', JSON.stringify(carrito));

        // Re-renderizar la tabla
        renderizarCarrito();

        // Actualizar el badge global
        actualizarBadgeCarrito();
    }

    // --- EJECUCIÓN INICIAL ---
    renderizarCarrito();

});

// IMPORTANTE: También necesitamos la función de actualizar badge aquí
// para cuando eliminamos productos.
function actualizarBadgeCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    const badges = document.querySelectorAll('.navbar .badge');

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('d-none');
        } else {
            badge.classList.add('d-none');
        }
    });
}
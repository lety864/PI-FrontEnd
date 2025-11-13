/* =================================================================
   ARCHIVO: carrito-pagina.js
   DESCRIPCIÓN: Script para renderizar y gestionar la página del carrito.
   INCLUIR EN: SÓLO EN carrito.html
   ================================================================= */

/*document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('cart-items');
    const subtotalSpan = document.getElementById('summary-subtotal');
    const shippingSpan = document.getElementById('summary-shipping');
    const totalSpan = document.getElementById('summary-total');
    const cartTotalSpan = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');

    // Función principal para dibujar el carrito
    function renderizarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar que los elementos existan
        if (!tbody) {
            console.error('No se encontró el elemento con id "cart-items"');
            return;
        }
        
        tbody.innerHTML = '';
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
            actualizarTotales(0);
            return;
        }

        // Dibujar cada producto
        carrito.forEach(producto => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 1;
            const subtotalProducto = precio * cantidad;
            subtotalGeneral += subtotalProducto;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="d-flex align-items-center">
                    <img src="${producto.imagen || 'https://placehold.co/80x80'}" 
                         alt="${producto.nombre}" 
                         class="img-fluid me-3" 
                         style="width: 80px; height: 80px; object-fit: cover;">
                    <span>${producto.nombre || 'Producto sin nombre'}</span>
                </td>
                <td>$${precio.toFixed(2)} MXN</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Cantidad">
                        <button class="btn btn-outline-secondary btn-sm btn-disminuir" data-id="${producto.id}">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="btn btn-sm disabled" style="min-width: 50px;">${cantidad}</span>
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
        if (!subtotalSpan || !shippingSpan || !totalSpan || !cartTotalSpan) {
            console.error('No se encontraron algunos elementos para los totales');
            return;
        }
        
        const costoEnvio = 0.00; 
        
        // Si el subtotal es 0, el envío también es 0
        const envioFinal = subtotal > 0 ? costoEnvio : 0;
        
        const totalFinal = subtotal + envioFinal;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`;
        shippingSpan.textContent = `$${envioFinal.toFixed(2)} MXN`;
        totalSpan.textContent = `$${totalFinal.toFixed(2)} MXN`;
        cartTotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`;
    }

    // --- MANEJO DE EVENTOS ---

    // Evento para Vaciar Carrito
if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
        // Vaciar carrito inmediatamente
        localStorage.removeItem('carrito');
        renderizarCarrito();
        actualizarBadgeCarrito();
        console.log('Carrito vaciado');
    });

    }

    // Evento para Eliminar un solo item
    if (tbody) {
        tbody.addEventListener('click', (e) => {
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
    }

    function eliminarProductoDelCarrito(id) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito = carrito.filter(producto => producto.id == id); // USAR ==
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
    /*function cambiarCantidad(id, delta) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const producto = carrito.find(p => p.id == id); // USAR ==

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

    // Función para actualizar badge del carrito
    function actualizarBadgeCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, producto) => total + (producto.cantidad || 0), 0);
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

    // Hacer la función disponible globalmente
    window.actualizarBadgeCarrito = actualizarBadgeCarrito;

    // --- EJECUCIÓN INICIAL ---
    renderizarCarrito();
    actualizarBadgeCarrito();
});*/
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
    const cartTotalSpan = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');

    // Función principal para dibujar el carrito
    function renderizarCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Verificar que los elementos existan
        if (!tbody) {
            console.error('No se encontró el elemento con id "cart-items"');
            return;
        }
        
        tbody.innerHTML = '';
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
            actualizarTotales(0);
            return;
        }

        // Dibujar cada producto
        carrito.forEach(producto => {
            const precio = Number(producto.precio) || 0;
            const cantidad = Number(producto.cantidad) || 1;
            const subtotalProducto = precio * cantidad;
            subtotalGeneral += subtotalProducto;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="d-flex align-items-center">
                    <img src="${producto.imagen || 'https://placehold.co/80x80'}" 
                         alt="${producto.nombre}" 
                         class="img-fluid me-3" 
                         style="width: 80px; height: 80px; object-fit: cover;">
                    <span>${producto.nombre || 'Producto sin nombre'}</span>
                </td>
                <td>$${precio.toFixed(2)} MXN</td>
                <td>
                    <div class="btn-group" role="group" aria-label="Cantidad">
                        <button class="btn btn-outline-secondary btn-sm btn-disminuir" data-id="${producto.id}">
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="btn btn-sm disabled" style="min-width: 50px;">${cantidad}</span>
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
        if (!subtotalSpan || !shippingSpan || !totalSpan || !cartTotalSpan) {
            console.error('No se encontraron algunos elementos para los totales');
            return;
        }
        
        const costoEnvio = 0.00; 
        
        // Si el subtotal es 0, el envío también es 0
        const envioFinal = subtotal > 0 ? costoEnvio : 0;
        
        const totalFinal = subtotal + envioFinal;

        subtotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`;
        shippingSpan.textContent = `$${envioFinal.toFixed(2)} MXN`;
        totalSpan.textContent = `$${totalFinal.toFixed(2)} MXN`;
        cartTotalSpan.textContent = `$${subtotal.toFixed(2)} MXN`;
    }

    // --- MANEJO DE EVENTOS ---

    // Evento para Vaciar Carrito
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            // Vaciar carrito inmediatamente
            localStorage.removeItem('carrito');
            renderizarCarrito();
            actualizarBadgeCarrito();
            console.log('Carrito vaciado');
        });
    }

    // Evento para Eliminar un solo item
    if (tbody) {
        tbody.addEventListener('click', (e) => {
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
    }

    function eliminarProductoDelCarrito(id) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        
        // Usar != para eliminar solo el producto específico
        carrito = carrito.filter(producto => producto.id != id);
        
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
        const producto = carrito.find(p => p.id == id);

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

    // Función para actualizar badge del carrito
    function actualizarBadgeCarrito() {
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const totalItems = carrito.reduce((total, producto) => total + (producto.cantidad || 0), 0);
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

    // Hacer la función disponible globalmente
    window.actualizarBadgeCarrito = actualizarBadgeCarrito;

    // --- EJECUCIÓN INICIAL ---
    renderizarCarrito();
    actualizarBadgeCarrito();
});

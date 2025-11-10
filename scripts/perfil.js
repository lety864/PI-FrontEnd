/**
 * PERFIL DEL CLIENTE - MUEBLERÍA ESPAÑA
 *
 * Funcionalidades:
 * - Cargar y mostrar información del usuario
 * - Editar perfil
 * - Ver historial de pedidos
 * - Ver facturas solicitadas
 * - Cerrar sesión
 *
 */

// ===================================
// 1. VARIABLES GLOBALES
// ===================================
let usuarioActual = null;

// ===================================
// 2. INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarDatosUsuario();
    cargarHistorialPedidos();
    cargarFacturas();
});

// ===================================
// 3. GESTIÓN DE SESIÓN
// ===================================

/**
 * Verifica si hay una sesión activa
 * Si no hay sesión, redirige a login
 */
function verificarSesion() {
    usuarioActual = JSON.parse(localStorage.getItem('usuario'));

    if (!usuarioActual) {
        // No hay sesión, redirigir a login
        mostrarAlerta('warning', 'Debes iniciar sesión para ver tu perfil');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return false;
    }

    return true;
}

/**
 * Cierra la sesión del usuario
 */
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('usuario');

        // Mostrar mensaje
        mostrarAlerta('success', 'Sesión cerrada exitosamente');

        // Redirigir a inicio
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }
}

// ===================================
// 4. CARGAR DATOS DEL USUARIO
// ===================================

/**
 * Carga y muestra la información del usuario
 */
function cargarDatosUsuario() {
    if (!usuarioActual) return;

    // Header
    document.getElementById('nombreUsuario').textContent = usuarioActual.nombre || 'Usuario';
    document.getElementById('emailUsuario').textContent = usuarioActual.email || '';

    // Información detallada
    document.getElementById('infNombre').textContent = usuarioActual.nombre || 'No especificado';
    document.getElementById('infEmail').textContent = usuarioActual.email || 'No especificado';
    document.getElementById('infTelefono').textContent = usuarioActual.telefono || 'No especificado';
    document.getElementById('infDireccion').textContent = usuarioActual.direccion || 'No especificada';
}

/**
 * Abre modal para editar el perfil
 */
function editarPerfil() {
    // Por ahora, mostrar un simple prompt
    // En producción, usar un modal de Bootstrap con formulario completo

    const nuevoNombre = prompt('Nombre completo:', usuarioActual.nombre || '');
    if (nuevoNombre === null) return; // Canceló

    const nuevoTelefono = prompt('Teléfono:', usuarioActual.telefono || '');
    if (nuevoTelefono === null) return;

    const nuevaDireccion = prompt('Dirección:', usuarioActual.direccion || '');
    if (nuevaDireccion === null) return;

    // Actualizar datos
    usuarioActual.nombre = nuevoNombre;
    usuarioActual.telefono = nuevoTelefono;
    usuarioActual.direccion = nuevaDireccion;

    // Guardar en localStorage
    localStorage.setItem('usuario', JSON.stringify(usuarioActual));

    // Recargar datos
    cargarDatosUsuario();

    // Mostrar mensaje
    mostrarAlerta('success', 'Perfil actualizado exitosamente');
}

/**
 * Cambiar contraseña (simulado)
 */
function cambiarContrasena() {
    mostrarAlerta('info', 'La funcionalidad de cambiar contraseña estará disponible próximamente');

    // En producción:
    // 1. Mostrar modal con formulario
    // 2. Validar contraseña actual
    // 3. Validar nueva contraseña (mínimo 8 caracteres, etc.)
    // 4. Hacer PUT a /api/usuarios/{id}/cambiar-password
}

// ===================================
// 5. HISTORIAL DE PEDIDOS
// ===================================

/**
 * Carga el historial de pedidos del usuario
 */
function cargarHistorialPedidos() {
    // Por ahora usar datos de ejemplo en localStorage
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    // Filtrar pedidos del usuario actual
    const pedidosUsuario = pedidos.filter(p => p.idUsuario === usuarioActual?.id);

    const container = document.getElementById('pedidosContainer');

    if (pedidosUsuario.length === 0) {
        // Ya tiene el estado vacío por defecto
        return;
    }

    // Renderizar pedidos
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>Pedido #</th>';
    html += '<th>Fecha</th>';
    html += '<th>Total</th>';
    html += '<th>Estado</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    pedidosUsuario.forEach(pedido => {
        const badgeClass = obtenerBadgeEstadoPedido(pedido.estado);
        html += `<tr>
            <td><strong>#${pedido.id}</strong></td>
            <td>${formatearFecha(pedido.fecha)}</td>
            <td>$${formatearPrecio(pedido.total)} MXN</td>
            <td><span class="${badgeClass}">${pedido.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetallePedido(${pedido.id})">
                    <i class="bi bi-eye"></i> Ver
                </button>
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/**
 * Obtiene la clase del badge según el estado del pedido
 */
function obtenerBadgeEstadoPedido(estado) {
    const badges = {
        'Pendiente': 'badge-status bg-warning text-dark',
        'En proceso': 'badge-status bg-info text-white',
        'Enviado': 'badge-status bg-primary text-white',
        'Entregado': 'badge-status bg-success text-white',
        'Cancelado': 'badge-status bg-danger text-white'
    };

    return badges[estado] || 'badge-status bg-secondary';
}

/**
 * Muestra el detalle de un pedido
 */
function verDetallePedido(idPedido) {
    mostrarAlerta('info', `Mostrando detalles del pedido #${idPedido} (funcionalidad en desarrollo)`);

    // En producción:
    // 1. Hacer GET a /api/pedidos/{idPedido}
    // 2. Mostrar modal con detalle completo
    // 3. Incluir productos, dirección de envío, etc.
}

// ===================================
// 6. FACTURAS
// ===================================

/**
 * Carga las facturas del usuario
 */
async function cargarFacturas() {
    // Por ahora usar localStorage, en producción hacer fetch al backend
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];

    // Filtrar facturas del usuario actual
    const facturasUsuario = facturas.filter(f => f.idUsuario === usuarioActual?.id);

    const container = document.getElementById('facturasContainer');

    if (facturasUsuario.length === 0) {
        // Ya tiene el estado vacío por defecto
        return;
    }

    // Renderizar facturas
    let html = '<div class="table-responsive"><table class="table table-hover">';
    html += '<thead><tr>';
    html += '<th>Factura #</th>';
    html += '<th>Pedido #</th>';
    html += '<th>RFC</th>';
    html += '<th>Total</th>';
    html += '<th>Estado</th>';
    html += '<th>Acciones</th>';
    html += '</tr></thead><tbody>';

    facturasUsuario.forEach(factura => {
        const badgeClass = obtenerBadgeEstadoFactura(factura.estadoFactura);
        html += `<tr>
            <td><strong>#${factura.idFactura}</strong></td>
            <td>#${factura.idPedido || 'N/A'}</td>
            <td><code>${factura.rfc}</code></td>
            <td>$${formatearPrecio(factura.total)} MXN</td>
            <td><span class="${badgeClass}">${factura.estadoFactura}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="verDetalleFactura(${factura.idFactura})">
                    <i class="bi bi-eye"></i> Ver
                </button>
                ${factura.estadoFactura === 'ENVIADA' ? `
                <button class="btn btn-sm btn-outline-success" onclick="descargarFactura(${factura.idFactura})">
                    <i class="bi bi-download"></i> Descargar
                </button>
                ` : ''}
            </td>
        </tr>`;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

/**
 * Obtiene la clase del badge según el estado de la factura
 */
function obtenerBadgeEstadoFactura(estado) {
    const badges = {
        'PENDIENTE': 'badge-status bg-warning text-dark',
        'GENERADA': 'badge-status bg-info text-white',
        'ENVIADA': 'badge-status bg-success text-white'
    };

    return badges[estado] || 'badge-status bg-secondary';
}

/**
 * Muestra el detalle de una factura
 */
function verDetalleFactura(idFactura) {
    mostrarAlerta('info', `Mostrando detalles de la factura #${idFactura} (funcionalidad en desarrollo)`);

    // En producción:
    // 1. Hacer GET a /api/facturas/{idFactura}
    // 2. Mostrar modal con detalle completo
}

/**
 * Descarga una factura (PDF/XML)
 */
function descargarFactura(idFactura) {
    mostrarAlerta('info', `Descargando factura #${idFactura} (funcionalidad en desarrollo)`);

    // En producción:
    // 1. Hacer GET a /api/facturas/{idFactura}/descargar
    // 2. Abrir PDF en nueva pestaña o descargar ZIP con PDF+XML
}

// ===================================
// 7. UTILIDADES
// ===================================

/**
 * Formatea un precio con 2 decimales y separadores de miles
 */
function formatearPrecio(precio) {
    if (!precio) return '0.00';
    return parseFloat(precio).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formatea una fecha ISO a formato legible
 */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'N/A';

    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Muestra una alerta usando Bootstrap
 */
function mostrarAlerta(tipo, mensaje) {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';

    const iconos = {
        'success': 'bi-check-circle-fill',
        'danger': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-circle-fill',
        'info': 'bi-info-circle-fill'
    };

    const titulos = {
        'success': '¡Éxito!',
        'danger': 'Error:',
        'warning': 'Advertencia:',
        'info': 'Información:'
    };

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
        <i class="bi ${iconos[tipo]} me-2"></i>
        <strong>${titulos[tipo]}</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    alertContainer.appendChild(alertDiv);
    alertContainer.style.display = 'block';

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();

        setTimeout(() => {
            if (alertContainer.children.length === 0) {
                alertContainer.style.display = 'none';
            }
        }, 150);
    }, 5000);
}

// ===================================
// 8. DATOS DE EJEMPLO (SIMULACIÓN)
// ===================================

/**
 * Inicializa datos de ejemplo si no existen
 */
function inicializarDatosEjemplo() {
    // Usuario de ejemplo
    if (!localStorage.getItem('usuario')) {
        const usuarioEjemplo = {
            id: 1,
            nombre: 'Fernando Pérez García',
            email: 'fernando.perez@example.com',
            telefono: '+52 55 1234 5678',
            direccion: 'Calle Principal 123, Col. Centro, Ciudad de México, CP 06000'
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioEjemplo));
    }

    // Pedidos de ejemplo
    if (!localStorage.getItem('pedidos')) {
        const pedidosEjemplo = [
            {
                id: 1001,
                idUsuario: 1,
                fecha: '2025-11-01T10:30:00',
                total: 4699.00,
                estado: 'Entregado'
            },
            {
                id: 1002,
                idUsuario: 1,
                fecha: '2025-11-05T14:20:00',
                total: 12500.00,
                estado: 'En proceso'
            }
        ];
        localStorage.setItem('pedidos', JSON.stringify(pedidosEjemplo));
    }

    // Facturas de ejemplo
    if (!localStorage.getItem('facturas')) {
        const facturasEjemplo = [
            {
                idFactura: 1,
                idPedido: 1001,
                idUsuario: 1,
                rfc: 'XAXX010101000',
                razonSocial: 'Fernando Pérez García',
                subtotal: 4050.86,
                iva: 648.14,
                total: 4699.00,
                estadoFactura: 'ENVIADA',
                fechaEmision: '2025-11-02T09:00:00'
            }
        ];
        localStorage.setItem('facturas', JSON.stringify(facturasEjemplo));
    }
}

// Descomentar la siguiente línea para inicializar datos de ejemplo
inicializarDatosEjemplo();
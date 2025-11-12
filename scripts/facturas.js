/**
 * ============================================
 * MUEBLERÍA ESPAÑA - FACTURAS.JS (SIMULACIÓN)
 * ============================================
 * Este script simula la gestión de facturas
 * sin conectarse a un backend real.
 */

// ===================================
// 1. DATOS SIMULADOS (MOCK DATA)
// ===================================
/**
 * Base de datos simulada de facturas.
 * En una app real, esto vendría de `facturaAPI.obtenerTodas()`.
 */
let facturasSimuladas = [];

/**
 * Genera datos de ejemplo para la simulación.
 */
function generarDatosSimulados() {
    // Simulamos los datos que vendrían del backend
    // Usamos la misma lógica de cálculo de IVA que tu `FacturaService.java`
    const factorIVA = 1.16;

    const total1 = 12500.00;
    const subtotal1 = (total1 / factorIVA).toFixed(2);
    const iva1 = (total1 - subtotal1).toFixed(2);

    const total2 = 8990.50;
    const subtotal2 = (total2 / factorIVA).toFixed(2);
    const iva2 = (total2 - subtotal2).toFixed(2);

    const total3 = 3200.00;
    const subtotal3 = (total3 / factorIVA).toFixed(2);
    const iva3 = (total3 - subtotal3).toFixed(2);

    facturasSimuladas = [
        {
            idFactura: 101,
            idPedido: 2024001,
            rfc: 'XAXX010101000',
            razonSocial: 'Público en General',
            subtotal: subtotal1,
            iva: iva1,
            total: total1,
            estado: 'PENDIENTE', // PENDIENTE, GENERADA, ENVIADA
            fechaEmision: '2025-11-10T09:30:00',
            // Datos extra para el modal de detalles
            cliente: 'Ana García',
            correo: 'ana.garcia@email.com',
            direccion: 'Avenida Siempre Viva 742, Col. Centro, C.P. 06000, CDMX',
            productos: [
                { id: 4, nombre: 'Sofá de 3 Plazas', cantidad: 1, precio: 12500.00 }
            ]
        },
        {
            idFactura: 102,
            idPedido: 2024002,
            rfc: 'GOPM880101ABC',
            razonSocial: 'Mueblería González S.A. de C.V.',
            subtotal: subtotal2,
            iva: iva2,
            total: total2,
            estado: 'GENERADA',
            fechaEmision: '2025-11-09T14:15:00',
            cliente: 'Mario González',
            correo: 'mario.gonzalez@muebleriag.com',
            direccion: 'Calle Falsa 123, Col. Industrial, C.P. 50000, Toluca',
            productos: [
                { id: 6, nombre: 'Mesa de Comedor de Roble', cantidad: 1, precio: 8990.50 }
            ]
        },
        {
            idFactura: 103,
            idPedido: 2024003,
            rfc: 'XEXX010101000',
            razonSocial: 'Operadora de Tiendas ABC',
            subtotal: subtotal3,
            iva: iva3,
            total: total3,
            estado: 'ENVIADA',
            fechaEmision: '2025-11-08T18:00:00',
            cliente: 'Carlos Sánchez',
            correo: 'carlos.sanchez@operadora.com',
            direccion: 'Blvd. Industrial 404, C.P. 64000, Monterrey',
            productos: [
                { id: 9, nombre: 'Buró de Noche (Par)', cantidad: 2, precio: 1600.00 }
            ]
        }
    ];
}


// ===================================
// 2. ELEMENTOS DEL DOM
// ===================================
const alertContainer = document.getElementById('alertContainer');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const tablaContainer = document.getElementById('tablaContainer');
const facturasTableBody = document.getElementById('facturasTableBody');
const contadorFacturas = document.getElementById('contadorFacturas');
const filtroBotones = document.querySelectorAll('input[name="filtroEstado"]');
const btnRecargar = document.getElementById('btnRecargar');

// Modales
const confirmModalElement = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalElement);
const confirmModalBody = document.getElementById('confirmModalBody');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');

const detallesModalElement = document.getElementById('detallesModal');
const detallesModal = new bootstrap.Modal(detallesModalElement);
const detallesModalBody = document.getElementById('detallesModalBody');


// ===================================
// 3. FUNCIONES DE RENDERIZADO
// ===================================

/**
 * Función principal para cargar y mostrar las facturas en la tabla.
 */
function actualizarTabla() {
    console.log('🔄 Actualizando tabla...');
    mostrarLoader(true);

    // 1. Obtener el filtro actual
    const filtroActivo = document.querySelector('input[name="filtroEstado"]:checked').value;
    console.log(`Filtro activo: ${filtroActivo}`);

    // 2. Filtrar los datos simulados
    let facturasFiltradas = [];
    if (filtroActivo === 'todas') {
        facturasFiltradas = facturasSimuladas;
    } else {
        facturasFiltradas = facturasSimuladas.filter(f => f.estado === filtroActivo);
    }

    // 3. Simular tiempo de carga de API
    setTimeout(() => {
        mostrarLoader(false);
        facturasTableBody.innerHTML = ''; // Limpiar tabla

        // 4. Validar si hay resultados
        if (facturasFiltradas.length === 0) {
            emptyState.style.display = 'flex';
            tablaContainer.style.display = 'none';
            contadorFacturas.innerHTML = 'Mostrando <strong>0</strong> facturas';
            return;
        }

        // 5. Mostrar tabla y ocultar estado vacío
        emptyState.style.display = 'none';
        tablaContainer.style.display = 'block';

        // 6. Renderizar filas
        facturasFiltradas.forEach(factura => {
            const fila = crearFilaFactura(factura);
            facturasTableBody.appendChild(fila);
        });

        // 7. Actualizar contador
        const total = facturasFiltradas.length;
        contadorFacturas.innerHTML = `Mostrando <strong>${total}</strong> factura${total === 1 ? '' : 's'}`;

    }, 500); // 0.5 segundos de simulación
}

/**
 * Crea el HTML para una fila <tr> de factura.
 * @param {object} factura - El objeto de factura.
 * @returns {HTMLElement} El elemento <tr>
 */
function crearFilaFactura(factura) {
    const tr = document.createElement('tr');
    tr.id = `factura-fila-${factura.idFactura}`;

    tr.innerHTML = `
        <td><strong>${factura.idFactura}</strong></td>
        <td>${factura.idPedido}</td>
        <td>${factura.rfc}</td>
        <td>${factura.razonSocial}</td>
        <td class="text-end">${formatearMoneda(factura.subtotal)}</td>
        <td class="text-end">${formatearMoneda(factura.iva)}</td>
        <td class="text-end"><strong>${formatearMoneda(factura.total)}</strong></td>
        <td class="text-center">${crearBadgeEstado(factura.estado)}</td>
        <td>${formatearFecha(factura.fechaEmision)}</td>
        <td>
            <div class="d-flex gap-1 justify-content-center">
                <button class="btn btn-sm btn-outline-primary" title="Ver Detalles" onclick="verDetalles(${factura.idFactura})">
                    <i class="bi bi-eye"></i>
                </button>
                ${crearBotonAccion(factura)}
            </div>
        </td>
    `;
    return tr;
}

/**
 * Crea un badge de color según el estado de la factura.
 * @param {string} estado - 'PENDIENTE', 'GENERADA', 'ENVIADA'
 * @returns {string} El HTML del badge.
 */
function crearBadgeEstado(estado) {
    switch (estado) {
        case 'PENDIENTE':
            return '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>Pendiente</span>';
        case 'GENERADA':
            return '<span class="badge bg-info"><i class="bi bi-check-circle me-1"></i>Generada</span>';
        case 'ENVIADA':
            return '<span class="badge bg-success"><i class="bi bi-send-check me-1"></i>Enviada</span>';
        default:
            return `<span class="badge bg-secondary">${estado}</span>`;
    }
}

/**
 * Crea el botón de acción correcto según el estado.
 * @param {object} factura - El objeto de factura.
 * @returns {string} El HTML del botón o un texto.
 */
function crearBotonAccion(factura) {
    switch (factura.estado) {
        case 'PENDIENTE':
            return `<button class="btn btn-sm btn-warning" title="Marcar como Generada" onclick="prepararCambioEstado(${factura.idFactura}, 'GENERADA', 'Generar Factura')">
                        <i class="bi bi-check-circle"></i>
                    </button>`;
        case 'GENERADA':
            return `<button class="btn btn-sm btn-info" title="Marcar como Enviada" onclick="prepararCambioEstado(${factura.idFactura}, 'ENVIADA', 'Marcar como Enviada')">
                        <i class="bi bi-send"></i>
                    </button>`;
        case 'ENVIADA':
            return `<span class="text-success" title="Completado"><i class="bi bi-check-all"></i></span>`;
        default:
            return '';
    }
}

/**
 * Muestra u oculta el spinner de carga.
 * @param {boolean} mostrar - true para mostrar, false para ocultar.
 */
function mostrarLoader(mostrar) {
    if (mostrar) {
        loadingState.style.display = 'block';
        emptyState.style.display = 'none';
        tablaContainer.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
    }
}

// ===================================
// 4. LÓGICA DE ACCIONES
// ===================================

/**
 * Prepara el modal de confirmación antes de cambiar el estado.
 * @param {number} idFactura - ID de la factura a cambiar.
 * @param {string} nuevoEstado - El estado al que se va a cambiar.
 * @param {string} verbo - Texto para el botón (ej. "Generar Factura").
 */
window.prepararCambioEstado = function(idFactura, nuevoEstado, verbo) {
    // Configurar el modal
    confirmModalBody.textContent = `¿Estás seguro de que deseas marcar la factura #${idFactura} como "${nuevoEstado}"?`;
    btnConfirmarModal.textContent = verbo;

    // Asignar el evento al botón de confirmar
    btnConfirmarModal.onclick = () => {
        ejecutarCambioEstado(idFactura, nuevoEstado);
    };

    // Mostrar el modal
    confirmModal.show();
}

/**
 * Ejecuta el cambio de estado (simulado).
 * @param {number} idFactura - ID de la factura.
 * @param {string} nuevoEstado - El nuevo estado.
 */
function ejecutarCambioEstado(idFactura, nuevoEstado) {
    console.log(`Cambiando estado de #${idFactura} a ${nuevoEstado}`);
    
    // 1. Buscar la factura en nuestra BDD simulada
    const factura = facturasSimuladas.find(f => f.idFactura === idFactura);
    
    if (factura) {
        // 2. Actualizar el estado
        factura.estado = nuevoEstado;
        
        // 3. Ocultar el modal
        confirmModal.hide();
        
        // 4. Mostrar alerta de éxito
        mostrarAlerta('success', `La factura #${idFactura} se marcó como ${nuevoEstado}.`);
        
        // 5. Actualizar la tabla para reflejar el cambio
        // (Podríamos solo actualizar la fila, pero recargar es más fácil para la demo)
        actualizarTabla();
    } else {
        mostrarAlerta('danger', `No se encontró la factura #${idFactura}.`);
    }
}

/**
 * Muestra el modal con los detalles de la factura.
 * @param {number} idFactura - ID de la factura a mostrar.
 */
window.verDetalles = function(idFactura) {
    const factura = facturasSimuladas.find(f => f.idFactura === idFactura);
    
    if (!factura) {
        mostrarAlerta('danger', `No se encontró la factura #${idFactura}.`);
        return;
    }

    // Generar el HTML para el cuerpo del modal
    let productosHTML = '';
    factura.productos.forEach(p => {
        productosHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td class="text-center">${p.cantidad}</td>
                <td class="text-end">${formatearMoneda(p.precio)}</td>
                <td class="text-end">${formatearMoneda(p.cantidad * p.precio)}</td>
            </tr>
        `;
    });

    detallesModalBody.innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <h5>Datos de Facturación</h5>
                <ul class="list-group">
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        RFC: <strong>${factura.rfc}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Razón Social: <strong>${factura.razonSocial}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ID de Factura: <strong>#${factura.idFactura}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ID de Pedido: <strong>#${factura.idPedido}</strong>
                    </li>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        Estado: ${crearBadgeEstado(factura.estado)}
                    </li>
                </ul>
            </div>
            <div class="col-md-6">
                <h5>Datos del Cliente</h5>
                <ul class="list-group">
                    <li class="list-group-item">
                        <strong>${factura.cliente}</strong>
                    </li>
                    <li class="list-group-item">
                        ${factura.correo}
                    </li>
                    <li class="list-group-item">
                        ${factura.direccion}
                    </li>
                </ul>
            </div>
            <div class="col-12">
                <h5>Desglose del Pedido</h5>
                <div class="table-responsive">
                    <table class="table table-sm table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>SKU</th>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>P. Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosHTML}
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="4" class="text-end">Subtotal (Pedido):</td>
                                <td class="text-end">${formatearMoneda(factura.subtotal)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end">IVA (16%):</td>
                                <td class="text-end">${formatearMoneda(factura.iva)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end"><strong>Total Facturado:</strong></td>
                                <td class="text-end"><strong>${formatearMoneda(factura.total)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Mostrar el modal
    detallesModal.show();
}

// ===================================
// 5. UTILIDADES
// ===================================

/**
 * Muestra una alerta usando Bootstrap
 * @param {string} tipo - 'success', 'danger', o 'info'
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarAlerta(tipo, mensaje) {
    alertContainer.innerHTML = '';
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    let icono = '';
    if (tipo === 'success') icono = '<i class="bi bi-check-circle-fill me-2"></i>';
    if (tipo === 'danger') icono = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
    alertDiv.innerHTML = `
        ${icono} ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    alertContainer.appendChild(alertDiv);
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
        try { new bootstrap.Alert(alertDiv).close(); } catch (e) {}
    }, 5000);
}

/**
 * Formatea un número como moneda MXN.
 * @param {number|string} valor - El valor numérico.
 * @returns {string} - El valor formateado (ej. $1,234.50)
 */
function formatearMoneda(valor) {
    const numero = parseFloat(valor);
    return numero.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });
}

/**
 * Formatea una fecha ISO a un formato legible.
 * @param {string} fechaISO - La fecha en formato ISO (ej. '2025-11-10T09:30:00')
 * @returns {string} - La fecha formateada (ej. 10/11/2025, 09:30)
 */
function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ===================================
// 6. INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Sistema de simulación de facturas cargado');
    
    // 1. Generar los datos simulados
    generarDatosSimulados();
    
    // 2. Cargar la tabla por primera vez
    actualizarTabla();

    // 3. Asignar eventos a los filtros
    filtroBotones.forEach(boton => {
        boton.addEventListener('change', actualizarTabla);
    });

    // 4. Asignar evento al botón de recargar
    btnRecargar.addEventListener('click', actualizarTabla);
});
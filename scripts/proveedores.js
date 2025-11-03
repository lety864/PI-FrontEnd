/**
 * MUEBLERÍA ESPAÑA - SCRIPT DE GESTIÓN DE PROVEEDORES
 * 
 * Funcionalidades:
 * - CRUD completo de proveedores (Crear, Leer, Actualizar, Eliminar)
 * - Validación de formulario en tiempo real
 * - Persistencia de datos con localStorage
 * - Sistema de alertas usando Bootstrap
 * - Validación de email y teléfono
 * - Modo edición
 * - Modal de confirmación para eliminación
 * 
 * Estructura de datos del proveedor:
 * {
 *   id_proveedor: Number (timestamp único),
 *   nombre_empresa: String,
 *   nombre_contacto: String,
 *   telefono: String,
 *   email: String,
 *   direccion: String,
 *   activo: Boolean,
 *   fecha_creacion: String (ISO),
 *   fecha_actualizacion: String (ISO)
 * }
 */

// ===================================
// 1. ELEMENTOS DEL DOM
// ===================================
const proveedorForm = document.getElementById('proveedorForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const alertContainer = document.getElementById('alertContainer');

// Elementos de la tabla
const emptyState = document.getElementById('emptyState');
const tablaContainer = document.getElementById('tablaContainer');
const proveedoresTableBody = document.getElementById('proveedoresTableBody');
const contadorProveedores = document.getElementById('contadorProveedores');

// Elementos del Modal de Confirmación
const confirmModalElement = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalElement);
const confirmModalBody = document.getElementById('confirmModalBody');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');

// Variables de control de edición
let modoEdicion = false;
let proveedorEnEdicionId = null;

// Campos del formulario
const campos = {
    nombreEmpresa: document.getElementById('nombreEmpresa'),
    nombreContacto: document.getElementById('nombreContacto'),
    telefono: document.getElementById('telefono'),
    email: document.getElementById('email'),
    direccion: document.getElementById('direccion'),
    activo: document.getElementById('activo')
};

// ===================================
// 2. SISTEMA DE ALERTAS (BOOTSTRAP)
// ===================================
/**
 * Muestra una alerta usando los componentes oficiales de Bootstrap
 * @param {string} tipo - 'success', 'danger', o 'info'
 * @param {string} mensaje - Texto a mostrar
 */
function mostrarAlerta(tipo, mensaje) {
    // Limpiar alertas previas
    alertContainer.innerHTML = '';
    
    // Crear la alerta de Bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    
    // Crear icono según el tipo
    let icono = '';
    let titulo = '';
    
    if (tipo === 'success') {
        icono = '<i class="bi bi-check-circle-fill me-2"></i>';
        titulo = '¡Éxito!';
    } else if (tipo === 'danger') {
        icono = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
        titulo = 'Error:';
    } else if (tipo === 'info') {
        icono = '<i class="bi bi-info-circle-fill me-2"></i>';
        titulo = 'Información:';
    }
    
    // Contenido de la alerta
    alertDiv.innerHTML = `
        ${icono}
        <strong>${titulo}</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Agregar la alerta al contenedor
    alertContainer.appendChild(alertDiv);
    alertContainer.style.display = 'block';
    
    // Scroll suave hacia la alerta
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        try {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        } catch (e) {
            // La alerta ya no existe
        }
    }, 5000);
}

/**
 * Oculta todas las alertas
 */
function ocultarAlerta() {
    alertContainer.innerHTML = '';
    alertContainer.style.display = 'none';
}

// ===================================
// 3. MODAL DE CONFIRMACIÓN
// ===================================
/**
 * Muestra un modal de confirmación
 * @param {string} mensaje - El texto de pregunta a mostrar
 * @param {function} onConfirm - Callback que se ejecutará al confirmar
 */
function mostrarModalConfirmacion(mensaje, onConfirm) {
    confirmModalBody.textContent = mensaje;
    
    btnConfirmarModal.onclick = () => {
        onConfirm();
        confirmModal.hide();
    };
    
    confirmModal.show();
}

// ===================================
// 4. GESTIÓN DE LOCALSTORAGE
// ===================================
/**
 * Obtiene todos los proveedores guardados en localStorage
 * @returns {Array} - Array de proveedores
 */
function obtenerProveedores() {
    const proveedores = localStorage.getItem('proveedores');
    return proveedores ? JSON.parse(proveedores) : [];
}

/**
 * Guarda el array de proveedores en localStorage
 * @param {Array} proveedores - Array de proveedores a guardar
 */
function guardarProveedores(proveedores) {
    try {
        localStorage.setItem('proveedores', JSON.stringify(proveedores));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('❌ Error: localStorage está lleno');
            mostrarAlerta('danger', 'No se pudo guardar el proveedor. El almacenamiento está lleno.');
        } else {
            console.error('❌ Error al guardar en localStorage:', error);
            mostrarAlerta('danger', 'Ocurrió un error al guardar el proveedor.');
        }
        throw error;
    }
}

/**
 * Verifica si un email ya existe en el sistema
 * @param {String} email - Email a verificar
 * @param {Number} excludeId - ID a excluir (para edición)
 * @returns {Boolean} - true si el email existe
 */
function emailExiste(email, excludeId = null) {
    const proveedores = obtenerProveedores();
    return proveedores.some(proveedor => 
        proveedor.email.toLowerCase() === email.toLowerCase() && 
        proveedor.id_proveedor !== excludeId
    );
}

// ===================================
// 5. VALIDACIÓN DE FORMULARIO
// ===================================
/**
 * Valida un campo individual del formulario
 * @param {HTMLElement} campo - Campo a validar
 * @returns {Boolean} - true si es válido
 */
function validarCampo(campo) {
    let esValido = true;
    
    // Validación básica: campo requerido
    if (campo.hasAttribute('required') && !campo.value.trim()) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        esValido = false;
    } 
    // Validación específica de email
    else if (campo.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(campo.value.trim())) {
            campo.classList.add('is-invalid');
            campo.classList.remove('is-valid');
            esValido = false;
        } else {
            campo.classList.remove('is-invalid');
            campo.classList.add('is-valid');
        }
    }
    // Campo válido
    else {
        campo.classList.remove('is-invalid');
        campo.classList.add('is-valid');
    }
    
    return esValido;
}

/**
 * Valida todo el formulario
 * @returns {Boolean} - true si todo es válido
 */
function validarFormulario() {
    let formularioValido = true;
    
    // Validar cada campo
    Object.values(campos).forEach(campo => {
        if (!validarCampo(campo)) {
            formularioValido = false;
        }
    });
    
    // Validación extra: verificar email duplicado
    if (formularioValido) {
        const emailDuplicado = emailExiste(
            campos.email.value.trim(), 
            proveedorEnEdicionId
        );
        
        if (emailDuplicado) {
            campos.email.classList.add('is-invalid');
            mostrarAlerta('danger', 'Ya existe un proveedor con este email.');
            formularioValido = false;
        }
    }
    
    return formularioValido;
}

// Agregar validación en tiempo real a cada campo
Object.values(campos).forEach(campo => {
    campo.addEventListener('blur', () => validarCampo(campo));
    campo.addEventListener('input', () => {
        if (campo.classList.contains('is-invalid')) {
            validarCampo(campo);
        }
    });
});

// ===================================
// 6. CRUD - CREAR/ACTUALIZAR
// ===================================
/**
 * Crea un objeto proveedor a partir de los datos del formulario
 * @returns {Object} - Objeto proveedor
 */
function crearObjetoProveedor() {
    return {
        id_proveedor: modoEdicion ? proveedorEnEdicionId : Date.now(),
        nombre_empresa: campos.nombreEmpresa.value.trim(),
        nombre_contacto: campos.nombreContacto.value.trim(),
        telefono: campos.telefono.value.trim(),
        email: campos.email.value.trim(),
        direccion: campos.direccion.value.trim(),
        activo: campos.activo.value === 'true',
        fecha_creacion: modoEdicion ? 
            obtenerProveedores().find(p => p.id_proveedor === proveedorEnEdicionId)?.fecha_creacion : 
            new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
    };
}

/**
 * Guarda un nuevo proveedor
 * @param {Object} proveedor - Proveedor a guardar
 */
function guardarNuevoProveedor(proveedor) {
    const proveedores = obtenerProveedores();
    proveedores.push(proveedor);
    guardarProveedores(proveedores);
    
    console.log('✅ Proveedor guardado:', proveedor);
    mostrarAlerta('success', `Proveedor "${proveedor.nombre_empresa}" agregado correctamente.`);
    
    limpiarFormulario();
    renderizarTabla();
}

/**
 * Actualiza un proveedor existente
 * @param {Object} proveedorActualizado - Proveedor con datos actualizados
 */
function actualizarProveedor(proveedorActualizado) {
    const proveedores = obtenerProveedores();
    const index = proveedores.findIndex(p => p.id_proveedor === proveedorActualizado.id_proveedor);
    
    if (index !== -1) {
        proveedores[index] = proveedorActualizado;
        guardarProveedores(proveedores);
        
        console.log('✅ Proveedor actualizado:', proveedorActualizado);
        mostrarAlerta('success', `Proveedor "${proveedorActualizado.nombre_empresa}" actualizado correctamente.`);
        
        cancelarEdicion();
        renderizarTabla();
    }
}

// ===================================
// 7. MANEJO DEL FORMULARIO
// ===================================
/**
 * Maneja el envío del formulario
 */
proveedorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validarFormulario()) {
        mostrarAlerta('danger', 'Por favor, corrige los errores en el formulario.');
        return;
    }
    
    // Crear objeto proveedor
    const proveedor = crearObjetoProveedor();
    
    // Guardar o actualizar según el modo
    if (modoEdicion) {
        actualizarProveedor(proveedor);
    } else {
        guardarNuevoProveedor(proveedor);
    }
});

/**
 * Limpia el formulario y resetea el estado
 */
function limpiarFormulario() {
    proveedorForm.reset();
    
    // Quitar clases de validación
    Object.values(campos).forEach(campo => {
        campo.classList.remove('is-valid', 'is-invalid');
    });
    
    // Resetear modo edición
    if (modoEdicion) {
        cancelarEdicion();
    }
    
    ocultarAlerta();
    
    // Scroll al inicio del formulario
    document.querySelector('.admin-title').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

/**
 * Cancela la edición y vuelve al modo de agregar
 */
function cancelarEdicion() {
    modoEdicion = false;
    proveedorEnEdicionId = null;
    
    // Cambiar texto del botón
    btnGuardar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Proveedor';
    
    // Quitar resaltado de fila en edición
    document.querySelectorAll('.fila-en-edicion').forEach(fila => {
        fila.classList.remove('fila-en-edicion');
    });
}

// Botón cancelar
btnCancelar.addEventListener('click', limpiarFormulario);

// ===================================
// 8. RENDERIZADO DE TABLA
// ===================================
/**
 * Renderiza la tabla de proveedores
 */
function renderizarTabla() {
    const proveedores = obtenerProveedores();
    
    // Actualizar contador
    const totalProveedores = proveedores.length;
    const totalActivos = proveedores.filter(p => p.activo).length;
    contadorProveedores.innerHTML = `
        <strong>${totalProveedores}</strong> proveedor${totalProveedores !== 1 ? 'es' : ''} 
        <span class="text-muted">(${totalActivos} activo${totalActivos !== 1 ? 's' : ''})</span>
    `;
    
    // Mostrar/ocultar tabla o estado vacío
    if (proveedores.length === 0) {
        emptyState.style.display = 'block';
        tablaContainer.style.display = 'none';
        return;
    }
    
    emptyState.style.display = 'none';
    tablaContainer.style.display = 'block';
    
    // Limpiar tbody
    proveedoresTableBody.innerHTML = '';
    
    // Renderizar cada proveedor (más recientes primero)
    proveedores.reverse().forEach(proveedor => {
        const fila = crearFilaProveedor(proveedor);
        proveedoresTableBody.appendChild(fila);
    });
}

/**
 * Crea una fila de la tabla para un proveedor
 * @param {Object} proveedor - Datos del proveedor
 * @returns {HTMLElement} - Fila <tr> con los datos
 */
function crearFilaProveedor(proveedor) {
    const tr = document.createElement('tr');
    
    // Marcar si está en edición
    if (modoEdicion && proveedor.id_proveedor === proveedorEnEdicionId) {
        tr.classList.add('fila-en-edicion');
    }
    
    tr.innerHTML = `
        <td>
            <strong>${proveedor.nombre_empresa}</strong>
            <br>
            <small class="text-muted">${proveedor.direccion}</small>
        </td>
        <td>${proveedor.nombre_contacto}</td>
        <td>
            <i class="bi bi-telephone me-1"></i>
            ${proveedor.telefono}
        </td>
        <td>
            <i class="bi bi-envelope me-1"></i>
            ${proveedor.email}
        </td>
        <td>
            ${proveedor.activo 
                ? '<span class="badge bg-success">Activo</span>' 
                : '<span class="badge bg-secondary">Inactivo</span>'
            }
        </td>
        <td>
            <button class="btn btn-action btn-editar" 
                    onclick="editarProveedor(${proveedor.id_proveedor})"
                    aria-label="Editar proveedor">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-action btn-eliminar" 
                    onclick="confirmarEliminarProveedor(${proveedor.id_proveedor})"
                    aria-label="Eliminar proveedor">
                <i class="bi bi-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// ===================================
// 9. CRUD - EDITAR
// ===================================
/**
 * Carga un proveedor en el formulario para edición
 * @param {Number} id - ID del proveedor a editar
 */
function editarProveedor(id) {
    const proveedores = obtenerProveedores();
    const proveedor = proveedores.find(p => p.id_proveedor === id);
    
    if (!proveedor) {
        mostrarAlerta('danger', 'No se encontró el proveedor.');
        return;
    }
    
    // Activar modo edición
    modoEdicion = true;
    proveedorEnEdicionId = id;
    
    // Llenar el formulario con los datos
    campos.nombreEmpresa.value = proveedor.nombre_empresa;
    campos.nombreContacto.value = proveedor.nombre_contacto;
    campos.telefono.value = proveedor.telefono;
    campos.email.value = proveedor.email;
    campos.direccion.value = proveedor.direccion;
    campos.activo.value = proveedor.activo.toString();
    
    // Cambiar texto del botón
    btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Actualizar Proveedor';
    
    // Marcar fila en edición
    renderizarTabla();
    
    // Scroll al formulario
    document.querySelector('.admin-title').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
    
    mostrarAlerta('info', `Editando: ${proveedor.nombre_empresa}`);
}

// ===================================
// 10. CRUD - ELIMINAR
// ===================================
/**
 * Muestra modal de confirmación antes de eliminar
 * @param {Number} id - ID del proveedor a eliminar
 */
function confirmarEliminarProveedor(id) {
    const proveedores = obtenerProveedores();
    const proveedor = proveedores.find(p => p.id_proveedor === id);
    
    if (!proveedor) {
        mostrarAlerta('danger', 'No se encontró el proveedor.');
        return;
    }
    
    const mensaje = `¿Estás seguro de que deseas eliminar al proveedor "${proveedor.nombre_empresa}"?\n\nEsta acción no se puede deshacer.`;
    
    mostrarModalConfirmacion(mensaje, () => {
        eliminarProveedor(id);
    });
}

/**
 * Elimina un proveedor del sistema
 * @param {Number} id - ID del proveedor a eliminar
 */
function eliminarProveedor(id) {
    let proveedores = obtenerProveedores();
    const proveedor = proveedores.find(p => p.id_proveedor === id);
    
    if (!proveedor) {
        mostrarAlerta('danger', 'No se encontró el proveedor.');
        return;
    }
    
    // Filtrar el proveedor a eliminar
    proveedores = proveedores.filter(p => p.id_proveedor !== id);
    guardarProveedores(proveedores);
    
    console.log('🗑️ Proveedor eliminado:', proveedor);
    mostrarAlerta('success', `Proveedor "${proveedor.nombre_empresa}" eliminado correctamente.`);
    
    // Si se estaba editando ese proveedor, cancelar edición
    if (modoEdicion && proveedorEnEdicionId === id) {
        limpiarFormulario();
    }
    
    renderizarTabla();
}

// ===================================
// 11. INICIALIZACIÓN
// ===================================
/**
 * Inicializa la página al cargar
 */
function inicializar() {
    console.log('🚀 Inicializando gestión de proveedores...');
    
    // Renderizar tabla con datos existentes
    renderizarTabla();
    
    console.log('✅ Sistema de proveedores listo');
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', inicializar);

// ===================================
// 12. FUNCIONES GLOBALES (para onclick)
// ===================================
// Exponer funciones al scope global para que funcionen los onclick en HTML
window.editarProveedor = editarProveedor;
window.confirmarEliminarProveedor = confirmarEliminarProveedor;
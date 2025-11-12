/**
 * ============================================
 * MUEBLERÍA ESPAÑA - PROVEEDORES.JS
 * ============================================
 * Gestión de proveedores conectado al backend Spring Boot
 * 
 * CAMBIOS PRINCIPALES:
 * - Usa api-admin.js para comunicarse con el backend
 * - Sin localStorage (todo se guarda en la base de datos)
 * - Validación de email único
 * - CRUD completo
 */

import { proveedorAPI } from './api/api-admin.js';

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

// Lista de proveedores en memoria (para validaciones)
let proveedoresEnMemoria = [];

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
function mostrarAlerta(tipo, mensaje) {
    alertContainer.innerHTML = '';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    
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
    
    alertDiv.innerHTML = `
        ${icono}
        <strong>${titulo}</strong> ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alertDiv);
    alertContainer.style.display = 'block';
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        try {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        } catch (e) {
            // Alerta ya cerrada
        }
    }, 5000);
}

function ocultarAlerta() {
    alertContainer.innerHTML = '';
    alertContainer.style.display = 'none';
}

// ===================================
// 3. MODAL DE CONFIRMACIÓN
// ===================================
function mostrarModalConfirmacion(mensaje, onConfirm) {
    confirmModalBody.textContent = mensaje;
    
    btnConfirmarModal.onclick = () => {
        onConfirm();
        confirmModal.hide();
    };
    
    confirmModal.show();
}

// ===================================
// 4. CARGA DE DATOS DESDE EL BACKEND
// ===================================

/**
 * Carga todos los proveedores desde el backend
 */
async function cargarProveedores() {
    try {
        console.log('Cargando proveedores...');
        
        const proveedores = await proveedorAPI.obtenerTodos();
        proveedoresEnMemoria = proveedores;
        
        console.log('Proveedores cargados:', proveedores.length);
        
        // Actualizar tabla
        renderizarTabla();
        
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        mostrarAlerta('danger', `No se pudieron cargar los proveedores: ${error.message}`);
    }
}

/**
 * Renderiza la tabla de proveedores
 */
function renderizarTabla() {
    const proveedores = proveedoresEnMemoria;
    
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
    
    // Renderizar cada proveedor
    proveedores.forEach(proveedor => {
        const fila = crearFilaProveedor(proveedor);
        proveedoresTableBody.appendChild(fila);
    });
}

/**
 * Crea una fila de la tabla para un proveedor
 */
function crearFilaProveedor(proveedor) {
    const tr = document.createElement('tr');
    
    // Marcar si está en edición
    if (modoEdicion && proveedor.idProveedor === proveedorEnEdicionId) {
        tr.classList.add('fila-en-edicion');
    }
    
    tr.innerHTML = `
        <td>
            <strong>${proveedor.nombreEmpresa}</strong>
            <br>
            <small class="text-muted">${proveedor.direccion}</small>
        </td>
        <td>${proveedor.nombre}</td>
        <td>
            <i class="bi bi-telephone me-1"></i>
            ${proveedor.telefono}
        </td>
        <td>
            <i class="bi bi-envelope me-1"></i>
            ${proveedor.correo}
        </td>
        <td>
            ${proveedor.activo 
                ? '<span class="badge bg-success">Activo</span>' 
                : '<span class="badge bg-secondary">Inactivo</span>'
            }
        </td>
        <td>
            <button class="btn btn-action btn-editar" 
                    onclick="editarProveedor(${proveedor.idProveedor})"
                    aria-label="Editar proveedor">
                <i class="bi bi-pencil"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// ===================================
// 5. VALIDACIÓN DE FORMULARIO
// ===================================

/**
 * Valida un campo individual
 */
function validarCampo(campo) {
    let esValido = true;
    
    // Validación básica: campo requerido (excepto checkbox)
    if (campo.type !== 'checkbox' && campo.hasAttribute('required') && !campo.value.trim()) {
        campo.classList.add('is-invalid');
        campo.classList.remove('is-valid');
        esValido = false;
    } 
    // Validación de email
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
        if (campo.value.trim() !== '' || campo.type === 'checkbox') {
            campo.classList.add('is-valid');
        }
    }
    
    return esValido;
}

/**
 * Valida todo el formulario
 */
function validarFormulario() {
    let formularioValido = true;
    
    // Validar cada campo (excepto checkbox)
    Object.entries(campos).forEach(([key, campo]) => {
        if (campo.type !== 'checkbox' && !validarCampo(campo)) {
            formularioValido = false;
        }
    });
    
    return formularioValido;
}

// Agregar validación en tiempo real
Object.values(campos).forEach(campo => {
    if (campo.type !== 'checkbox') {
        campo.addEventListener('blur', () => validarCampo(campo));
        campo.addEventListener('input', () => {
            // Limpiar error mientras escribe
            if (campo.classList.contains('is-invalid')) {
                campo.classList.remove('is-invalid');
            }
        });
    }
});

// ===================================
// 6. GUARDAR PROVEEDOR
// ===================================

/**
 * Crea el objeto proveedor desde el formulario
 */
function crearObjetoProveedor() {
    return {
        nombreEmpresa: campos.nombreEmpresa.value.trim(),
        nombre: campos.nombreContacto.value.trim(),
        telefono: campos.telefono.value.trim(),
        correo: campos.email.value.trim(),
        direccion: campos.direccion.value.trim(),
        activo: campos.activo.value === 'true' // Convertir string a boolean
    };
}

/**
 * Guarda o actualiza un proveedor
 */
async function guardarProveedor() {
    // Validar formulario
    if (!validarFormulario()) {
        mostrarAlerta('danger', 'Por favor completa todos los campos correctamente');
        return;
    }
    
    // Cambiar botón a estado de carga
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        // Crear objeto proveedor
        const datosProveedor = crearObjetoProveedor();
        
        console.log('📤 Datos a enviar:', datosProveedor);

        let resultado;
        
        if (modoEdicion) {
            // ACTUALIZAR proveedor existente
            resultado = await proveedorAPI.actualizar(proveedorEnEdicionId, datosProveedor);
            
            mostrarAlerta('success', `Proveedor actualizado: ${datosProveedor.nombreEmpresa}`);
            console.log('✅ Proveedor actualizado:', resultado);
            
        } else {
            // CREAR nuevo proveedor
            resultado = await proveedorAPI.crear(datosProveedor);
            
            mostrarAlerta('success', `Proveedor creado exitosamente: ${datosProveedor.nombreEmpresa}`);
            console.log('✅ Proveedor creado:', resultado);
        }
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Recargar proveedores
        await cargarProveedores();
        
        // Scroll hacia la tabla
        setTimeout(() => {
            document.getElementById('proveedoresSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
        
    } catch (error) {
        console.error('❌ Error al guardar proveedor:', error);
        
        // Mensaje de error específico para nombre empresa duplicado
        if (error.message.includes('nombreEmpresa') || error.message.includes('empresa')) {
            mostrarAlerta('danger', 'Ya existe un proveedor con este nombre de empresa');
        } else {
            mostrarAlerta('danger', `Error al guardar: ${error.message}`);
        }
    } finally {
        // Restaurar botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

// ===================================
// 7. MODO EDICIÓN
// ===================================

/**
 * Activa el modo edición y carga los datos del proveedor
 */
async function activarModoEdicion(idProveedor) {
    try {
        console.log('✏️ Activando modo edición para proveedor:', idProveedor);
        
        // Buscar proveedor en memoria
        const proveedor = proveedoresEnMemoria.find(p => p.idProveedor === idProveedor);
        
        if (!proveedor) {
            mostrarAlerta('danger', 'Proveedor no encontrado');
            return;
        }
        
        // Activar modo edición
        modoEdicion = true;
        proveedorEnEdicionId = idProveedor;
        
        // Cargar datos en el formulario
        campos.nombreEmpresa.value = proveedor.nombreEmpresa || '';
        campos.nombreContacto.value = proveedor.nombre || '';
        campos.telefono.value = proveedor.telefono || '';
        campos.email.value = proveedor.correo || '';
        campos.direccion.value = proveedor.direccion || '';
        campos.activo.value = proveedor.activo.toString();
        
        // Cambiar texto del botón
        btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i>Actualizar Proveedor';
        
        // Marcar fila en edición
        renderizarTabla();
        
        // Scroll al formulario
        proveedorForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight visual
        proveedorForm.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.25)';
        setTimeout(() => {
            proveedorForm.style.boxShadow = '';
        }, 2000);
        
        mostrarAlerta('info', `Editando: ${proveedor.nombreEmpresa}`);
        
    } catch (error) {
        console.error('❌ Error al activar modo edición:', error);
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

/**
 * Desactiva el modo edición
 */
function desactivarModoEdicion() {
    modoEdicion = false;
    proveedorEnEdicionId = null;
    btnGuardar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Proveedor';
    
    // Quitar highlight de filas
    document.querySelectorAll('.fila-en-edicion').forEach(fila => {
        fila.classList.remove('fila-en-edicion');
    });
}

// ===================================
// 8. LIMPIEZA DEL FORMULARIO
// ===================================
function limpiarFormulario() {
    proveedorForm.reset();
    
    // Quitar clases de validación
    Object.values(campos).forEach(campo => {
        campo.classList.remove('is-valid', 'is-invalid');
    });
    
    // Resetear modo edición
    if (modoEdicion) {
        desactivarModoEdicion();
    }
    
    ocultarAlerta();
    
    // Scroll al inicio del formulario
    proveedorForm.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// ===================================
// 9. EVENT LISTENERS
// ===================================

// Envío del formulario
proveedorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarProveedor();
});

// Botón cancelar
btnCancelar.addEventListener('click', () => {
    const mensaje = modoEdicion 
        ? '¿Deseas cancelar la edición? Los cambios no guardados se perderán.'
        : '¿Estás seguro de que deseas cancelar? Se borrarán los datos del formulario.';
    
    mostrarModalConfirmacion(mensaje, () => {
        limpiarFormulario();
    });
});

// ===================================
// 10. INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando gestión de proveedores...');
    
    try {
        // Cargar proveedores desde el backend
        await cargarProveedores();
        
        console.log('✅ Sistema de proveedores listo');
        
    } catch (error) {
        console.error('❌ Error al inicializar:', error);
        mostrarAlerta('danger', `Error al inicializar: ${error.message}. Verifica que el backend esté corriendo.`);
    }
    
    // Focus automático en el primer campo
    campos.nombreEmpresa.focus();
});

// ===================================
// 11. FUNCIONES GLOBALES (para onclick)
// ===================================
window.editarProveedor = function(idProveedor) {
    activarModoEdicion(idProveedor);
};
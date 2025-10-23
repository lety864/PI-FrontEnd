/**
 * MUEBLERÍA ESPAÑA - SCRIPT DE ADMINISTRACIÓN
 * * CUMPLIMIENTO DE REQUISITOS DE LA TAREA:
 * ✅ Formulario con componentes de Bootstrap (inputs, selects, input-groups, textareas)
 * ✅ Validación de campos con JavaScript
 * ✅ Alertas de Bootstrap para mostrar errores/éxitos
 * ✅ Creación de objeto JSON con los datos del formulario
 * ✅ Página responsiva (desktop, tablet, móvil)
 * * Funcionalidades:
 * - Validación de formulario en tiempo real
 * - Guardado de productos (simulado)
 * - Sistema de alertas usando Bootstrap Alert Component
 * - Limpieza de formulario
 * - Creación de objeto JSON con notación correcta
 *
 * CORRECCIONES:
 * 1. Corregida URL de imagen placeholder (de 'via.placeholder.com' a 'placehold.co')
 * 2. Reemplazado `confirm()` por un Modal de Bootstrap para compatibilidad con iframes.
 */

// ===================================
// 1. ELEMENTOS DEL DOM
// ===================================
const productForm = document.getElementById('productForm');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const alertContainer = document.getElementById('alertContainer');

// Elementos de la tabla
const emptyState = document.getElementById('emptyState');
const tablaContainer = document.getElementById('tablaContainer');
const productosTableBody = document.getElementById('productosTableBody');
const contadorProductos = document.getElementById('contadorProductos');

// Elementos del Modal de Confirmación
const confirmModalElement = document.getElementById('confirmModal');
const confirmModal = new bootstrap.Modal(confirmModalElement);
const confirmModalBody = document.getElementById('confirmModalBody');
const btnConfirmarModal = document.getElementById('btnConfirmarModal');


// Variables de control de edición
let modoEdicion = false;
let productoEnEdicionIndex = -1;

// Campos del formulario
const campos = {
    sku: document.getElementById('sku'),
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    categoria: document.getElementById('categoria'),
    subcategoria: document.getElementById('subcategoria'),
    precio: document.getElementById('precio'),
    stock: document.getElementById('stock'),
    materiales: document.getElementById('materiales'),
    alto: document.getElementById('alto'),
    ancho: document.getElementById('ancho'),
    profundo: document.getElementById('profundo'),
    imagen: document.getElementById('imagen')
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
        // Usar try-catch por si el usuario ya la cerró manualmente
        try {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        } catch (e) {
            // La alerta ya no existe, no hacer nada.
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
// 2.1 MODAL DE CONFIRMACIÓN (Reemplazo de confirm())
// ===================================
/**
 * Muestra un modal de confirmación.
 * @param {string} mensaje - El texto de pregunta a mostrar en el modal.
 * @param {function} onConfirm - El callback que se ejecutará si el usuario presiona "Confirmar".
 */
function mostrarModalConfirmacion(mensaje, onConfirm) {
    // 1. Poner el mensaje en el body del modal
    confirmModalBody.textContent = mensaje;
    
    // 2. Asignar el evento al botón de confirmar
    // Se usa .onclick para reemplazar cualquier listener anterior fácilmente
    btnConfirmarModal.onclick = () => {
        onConfirm();      // Ejecutar la acción deseada
        confirmModal.hide(); // Ocultar el modal
    };
    
    // 3. Mostrar el modal
    confirmModal.show();
}


// ===================================
// 3. GESTIÓN DE LOCALSTORAGE
// ===================================
/**
 * Obtiene todos los productos guardados en localStorage
 * @returns {Array} - Array de productos
 */
function obtenerProductos() {
    const productos = localStorage.getItem('productos');
    return productos ? JSON.parse(productos) : [];
}

/**
 * Guarda el array de productos en localStorage
 * @param {Array} productos - Array de productos a guardar
 */
function guardarProductos(productos) {
    try {
        localStorage.setItem('productos', JSON.stringify(productos));
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.error('❌ Error: localStorage está lleno');
            mostrarAlerta('danger', 'No se pudo guardar el producto. El almacenamiento está lleno.');
        } else {
            console.error('❌ Error al guardar en localStorage:', error);
            mostrarAlerta('danger', 'Ocurrió un error al guardar el producto.');
        }
        throw error; // Re-lanzar para que guardarProducto lo maneje
    }
}

/**
 * Verifica si un SKU ya existe en el inventario
 * @param {String} sku - SKU a verificar
 * @param {Number} excludeIndex - Índice a excluir (para edición)
 * @returns {Boolean} - true si el SKU existe
 */
function skuExiste(sku, excludeIndex = -1) {
    const productos = obtenerProductos();
    return productos.some((producto, index) => {
        return producto.sku.toLowerCase() === sku.toLowerCase() && index !== excludeIndex;
    });
}

/**
 * Agrega un nuevo producto al localStorage
 * @param {Object} producto - Objeto del producto a agregar
 * @returns {Boolean} - true si se guardó correctamente
 */
function agregarProducto(producto) {
    try {
        const productos = obtenerProductos();
        productos.push(producto);
        guardarProductos(productos);
        actualizarTabla();
        return true;
    } catch (error) {
        console.error('❌ Error al agregar producto:', error);
        return false;
    }
}

/**
 * Actualiza un producto existente en localStorage
 * @param {Number} index - Índice del producto a actualizar
 * @param {Object} productoActualizado - Nuevos datos del producto
 * @returns {Boolean} - true si se actualizó correctamente
 */
function actualizarProducto(index, productoActualizado) {
    try {
        const productos = obtenerProductos();
        
        if (index < 0 || index >= productos.length) {
            throw new Error('Índice de producto inválido');
        }
        
        // Mantener la fecha de creación original
        productoActualizado.fechaCreacion = productos[index].fechaCreacion;
        
        // Actualizar el producto
        productos[index] = productoActualizado;
        guardarProductos(productos);
        actualizarTabla();
        return true;
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        return false;
    }
}

/**
 * Elimina un producto del localStorage
 * @param {Number} index - Índice del producto a eliminar
 * @returns {Boolean} - true si se eliminó correctamente
 */
function eliminarProductoDeStorage(index) {
    try {
        const productos = obtenerProductos();
        
        if (index < 0 || index >= productos.length) {
            throw new Error('Índice de producto inválido');
        }
        
        productos.splice(index, 1);
        guardarProductos(productos);
        actualizarTabla();
        return true;
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        return false;
    }
}

/**
 * Actualiza el contador de productos
 */
function actualizarContador() {
    const productos = obtenerProductos();
    const productosNuevos = productos.filter(p => esProductoNuevo(p.fechaCreacion)).length;
    
    if (productosNuevos > 0) {
        contadorProductos.innerHTML = `
            <strong>${productos.length}</strong> ${productos.length === 1 ? 'producto' : 'productos'}
            <span class="contador-nuevo">(${productosNuevos} nuevo${productosNuevos === 1 ? '' : 's'})</span>
        `;
    } else {
        contadorProductos.innerHTML = `
            <strong>${productos.length}</strong> ${productos.length === 1 ? 'producto' : 'productos'}
        `;
    }
}

/**
 * Muestra u oculta el estado vacío según haya productos
 */
function toggleEmptyState() {
    const productos = obtenerProductos();
    
    if (productos.length === 0) {
        emptyState.style.display = 'block';
        tablaContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tablaContainer.style.display = 'block';
    }
}

/**
 * Crea una fila de la tabla con los datos del producto
 * @param {Object} producto - Datos del producto
 * @param {Number} index - Índice del producto en el array
 * @returns {String} - HTML de la fila
 */
function crearFilaProducto(producto, index) {
    // Determinar clase del stock
    let stockClass = 'stock-ok';
    if (producto.stock === 0) {
        stockClass = 'stock-agotado';
    } else if (producto.stock < 5) {
        stockClass = 'stock-bajo';
    }
    
    // Badge de "Nuevo" si fue creado en las últimas 24 horas
    const badgeNuevo = esProductoNuevo(producto.fechaCreacion) 
        ? '<span class="badge-nuevo" title="Agregado en las últimas 24 horas">Nuevo</span>' 
        : '';
    
    // Formatear fechas para tooltips
    const fechaCreacion = producto.fechaCreacion ? formatearFecha(producto.fechaCreacion) : 'N/A';
    const fechaModificacion = producto.fechaModificacion ? formatearFecha(producto.fechaModificacion) : fechaCreacion;
    
    // Clase para resaltar fila en edición
    const filaEnEdicion = (modoEdicion && productoEnEdicionIndex === index) ? 'fila-en-edicion' : '';
    
    // URL de imagen de fallback
    const fallbackImage = 'https://placehold.co/60x60/EEE/BDBDBD?text=Sin+Imagen';

    return `
        <tr class="${filaEnEdicion}" title="Creado: ${fechaCreacion} | Modificado: ${fechaModificacion}">
            <td>
                <strong>${producto.sku}</strong>
                ${badgeNuevo}
                ${filaEnEdicion ? '<span class="badge-editando">Editando</span>' : ''}
            </td>
            <td>${producto.nombre}</td>
            <td>
                <span class="badge-categoria">${producto.categoria}</span>
            </td>
            <td class="precio-tabla">$${producto.precio.toFixed(2)} MXN</td>
            <td>
                <span class="stock-badge ${stockClass}">
                    ${producto.stock} ${producto.stock === 1 ? 'unidad' : 'unidades'}
                </span>
            </td>
            <td>
                <!-- CORRECCIÓN: Se cambió 'via.placeholder.com' por 'placehold.co' -->
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img-table" onerror="this.onerror=null; this.src='${fallbackImage}';">
            </td>
            <td>
                <button class="btn-action btn-editar" onclick="editarProducto(${index})" title="Editar producto">
                    <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn-action btn-eliminar" onclick="eliminarProducto(${index})" title="Eliminar producto">
                    <i class="bi bi-trash-fill"></i>
                </button>
            </td>
        </tr>
    `;
}

/**
 * Actualiza la tabla con todos los productos
 */
function actualizarTabla() {
    const productos = obtenerProductos();
    productosTableBody.innerHTML = '';
    
    productos.forEach((producto, index) => {
        productosTableBody.innerHTML += crearFilaProducto(producto, index);
    });
    
    actualizarContador();
    toggleEmptyState();
}

/**
 * Activa el modo de edición y carga los datos del producto en el formulario
 * @param {Number} index - Índice del producto a editar
 */
function activarModoEdicion(index) {
    const productos = obtenerProductos();
    const producto = productos[index];
    
    if (!producto) {
        console.error('Producto no encontrado');
        return;
    }
    
    // Activar modo edición
    modoEdicion = true;
    productoEnEdicionIndex = index;
    
    // Cargar datos en el formulario
    campos.sku.value = producto.sku;
    campos.nombre.value = producto.nombre;
    campos.descripcion.value = producto.descripcion;
    campos.categoria.value = producto.categoria;
    campos.subcategoria.value = producto.subcategoria || '';
    campos.precio.value = producto.precio;
    campos.stock.value = producto.stock;
    campos.materiales.value = producto.materiales || '';
    campos.alto.value = producto.dimensiones?.alto || '';
    campos.ancho.value = producto.dimensiones?.ancho || '';
    campos.profundo.value = producto.dimensiones?.profundo || '';
    campos.imagen.value = producto.imagen;
    
    // Deshabilitar el campo SKU (no se puede cambiar)
    campos.sku.disabled = true;
    campos.sku.style.backgroundColor = '#f5f5f5';
    campos.sku.style.cursor = 'not-allowed';
    
    // Cambiar botón de guardar a actualizar
    btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat me-2"></i> Actualizar Producto';
    btnGuardar.classList.add('btn-actualizar');
    
    // Cambiar texto del botón cancelar
    btnCancelar.innerHTML = '<i class="bi bi-x-circle me-2"></i> Cancelar Edición';
    
    // Mostrar alerta informativa
    mostrarAlerta('info', `Editando producto: ${producto.sku} - ${producto.nombre}`);
    
    // Scroll al formulario
    productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Focus en el nombre
    campos.nombre.focus();
    
    console.log('✏️ Modo edición activado para:', producto.sku);

    // Actualizar la tabla para mostrar el badge "Editando"
    actualizarTabla();
}

/**
 * Desactiva el modo de edición y restaura el formulario
 */
function desactivarModoEdicion() {
    modoEdicion = false;
    productoEnEdicionIndex = -1;
    
    // Habilitar el campo SKU
    campos.sku.disabled = false;
    campos.sku.style.backgroundColor = '';
    campos.sku.style.cursor = '';
    
    // Restaurar botón de guardar
    btnGuardar.innerHTML = '<i class="bi bi-check-circle me-2"></i> Guardar Producto';
    btnGuardar.classList.remove('btn-actualizar');
    
    // Restaurar texto del botón cancelar
    btnCancelar.innerHTML = 'Cancelar';
    
    console.log('❌ Modo edición desactivado');

    // Actualizar la tabla para quitar el badge "Editando"
    actualizarTabla();
}

/**
 * Formatea una fecha ISO a formato legible
 * @param {String} isoDate - Fecha en formato ISO
 * @returns {String} - Fecha formateada
 */
function formatearFecha(isoDate) {
    const fecha = new Date(isoDate);
    const opciones = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return fecha.toLocaleDateString('es-MX', opciones);
}

/**
 * Verifica si un producto fue creado en las últimas 24 horas
 * @param {String} fechaCreacion - Fecha de creación ISO
 * @returns {Boolean} - true si es reciente
 */
function esProductoNuevo(fechaCreacion) {
    if (!fechaCreacion) return false;
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const diferenciaHoras = (ahora - fecha) / (1000 * 60 * 60);
    return diferenciaHoras < 24;
}

// ===================================
// 4. VALIDACIÓN DEL FORMULARIO
// ===================================
/**
 * Valida un campo individual
 * @param {HTMLElement} campo - Input a validar
 * @returns {boolean} - true si es válido
 */
function validarCampo(campo) {
    // Si el campo no es obligatorio y está vacío, es válido
    if (!campo.hasAttribute('required') && campo.value.trim() === '') {
        campo.classList.remove('is-invalid');
        return true;
    }
    
    // Validación específica para SKU (verificar duplicados)
    if (campo.id === 'sku' && campo.value.trim() !== '') {
        // En modo edición, permitir el SKU actual
        const excludeIndex = modoEdicion ? productoEnEdicionIndex : -1;
        
        if (skuExiste(campo.value.trim(), excludeIndex)) {
            campo.classList.add('is-invalid');
            // Actualizar mensaje de error
            const feedback = campo.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'Este SKU ya existe en el inventario';
            }
            return false;
        } else {
            // Restaurar mensaje original
            const feedback = campo.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = 'El código SKU es obligatorio';
            }
        }
    }
    
    // Validar campos obligatorios
    if (campo.hasAttribute('required')) {
        // Para selects
        if (campo.tagName === 'SELECT') {
            if (campo.value === '' || campo.value === null) {
                campo.classList.add('is-invalid');
                return false;
            }
        }
        // Para inputs de texto
        else if (campo.type === 'text' || campo.type === 'url' || campo.tagName === 'TEXTAREA') {
            if (campo.value.trim() === '') {
                campo.classList.add('is-invalid');
                return false;
            }
        }
        // Para inputs numéricos
        else if (campo.type === 'number') {
            if (campo.value === '' || parseFloat(campo.value) < 0) {
                campo.classList.add('is-invalid');
                return false;
            }
        }
    }
    
    // Validación específica para URL
    if (campo.type === 'url' && campo.value.trim() !== '') {
        // Patrón simple para verificar si empieza con http:// o https://
        const urlPattern = /^https?:\/\/.+/i;
        if (!urlPattern.test(campo.value)) {
            campo.classList.add('is-invalid');
            return false;
        }
    }
    
    // Si pasó todas las validaciones
    campo.classList.remove('is-invalid');
    return true;
}

/**
 * Valida todo el formulario
 * @returns {boolean} - true si todo es válido
 */
function validarFormulario() {
    let esValido = true;
    
    // Validar todos los campos obligatorios
    Object.values(campos).forEach(campo => {
        if (campo.hasAttribute('required')) {
            if (!validarCampo(campo)) {
                esValido = false;
            }
        }
        // Validar también los no obligatorios que podrían tener un formato incorrecto (como la URL)
        else if (campo.type === 'url') {
            if(!validarCampo(campo)) {
                esValido = false;
            }
        }
    });
    
    return esValido;
}

// Validación en tiempo real mientras el usuario escribe
Object.values(campos).forEach(campo => {
    campo.addEventListener('blur', () => {
        validarCampo(campo);
    });
    
    campo.addEventListener('input', () => {
        if (campo.classList.contains('is-invalid')) {
            validarCampo(campo);
        }
    });
});

// ===================================
// 5. GUARDADO DE PRODUCTO (SIMULADO)
// ===================================
/**
 * Guarda o actualiza el producto según el modo
 * En producción, aquí harías un fetch() a tu API
 */
function guardarProducto() {
    // Validar antes de guardar
    if (!validarFormulario()) {
        mostrarAlerta('danger', 'Por favor, completa todos los campos obligatorios correctamente.');
        return;
    }
    
    // Verificar SKU duplicado (solo en modo creación)
    const skuIngresado = campos.sku.value.trim();
    if (!modoEdicion && skuExiste(skuIngresado)) {
        mostrarAlerta('danger', `El SKU "${skuIngresado}" ya existe en el inventario. Por favor, usa un código único.`);
        campos.sku.focus();
        campos.sku.classList.add('is-invalid');
        return;
    }
    
    // Mostrar estado de carga
    btnGuardar.classList.add('loading');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.innerHTML = '<i class="bi bi-arrow-repeat"></i> Guardando...';
    
    // Timestamp actual
    const ahora = new Date().toISOString();
    
    // Recopilar datos del formulario
    const producto = {
        sku: skuIngresado,
        nombre: campos.nombre.value.trim(),
        descripcion: campos.descripcion.value.trim(),
        categoria: campos.categoria.value,
        subcategoria: campos.subcategoria.value.trim() || null, // Guardar null si está vacío
        precio: parseFloat(campos.precio.value),
        stock: parseInt(campos.stock.value),
        materiales: campos.materiales.value.trim() || null, // Guardar null si está vacío
        dimensiones: {
            alto: campos.alto.value ? parseInt(campos.alto.value) : null,
            ancho: campos.ancho.value ? parseInt(campos.ancho.value) : null,
            profundo: campos.profundo.value ? parseInt(campos.profundo.value) : null
        },
        imagen: campos.imagen.value.trim(),
        fechaCreacion: modoEdicion ? null : ahora, // Se mantiene la original si es edición
        fechaModificacion: ahora,
        activo: true
    };
    
    // Simular petición al servidor (1.5 segundos)
    setTimeout(() => {
        let guardadoExitoso = false;
        let mensaje = '';
        
        try {
            if (modoEdicion) {
                // ACTUALIZAR producto existente
                guardadoExitoso = actualizarProducto(productoEnEdicionIndex, producto);
                
                if (guardadoExitoso) {
                    mensaje = `¡Producto actualizado exitosamente! SKU: ${producto.sku}`;
                    console.log('=== PRODUCTO ACTUALIZADO ===');
                    console.log(JSON.stringify(producto, null, 2));
                    console.log('=== ÍNDICE:', productoEnEdicionIndex, '===');
                }
                
                // Desactivar modo edición
                desactivarModoEdicion();
            } else {
                // CREAR nuevo producto
                guardadoExitoso = agregarProducto(producto);
                
                if (guardadoExitoso) {
                    const totalProductos = obtenerProductos().length;
                    mensaje = `¡Producto guardado exitosamente! SKU: ${producto.sku} | Total en inventario: ${totalProductos} ${totalProductos === 1 ? 'producto' : 'productos'}`;
                    console.log('=== PRODUCTO GUARDADO ===');
                    console.log(JSON.stringify(producto, null, 2));
                    console.log('=== TOTAL PRODUCTOS:', totalProductos, '===');
                }
            }
        } catch (error) {
            // Error proveniente de guardarProductos (ej. QuotaExceeded)
            guardadoExitoso = false;
            // La alerta de error ya se mostró en guardarProductos()
        }
        
        if (!guardadoExitoso) {
            // Si hubo error, restaurar botón (la alerta ya se mostró)
            btnGuardar.classList.remove('loading');
            btnGuardar.innerHTML = textoOriginal;
            return;
        }
        
        // Mostrar alerta de éxito
        mostrarAlerta('success', mensaje);
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Restaurar botón
        btnGuardar.classList.remove('loading');
        btnGuardar.innerHTML = '<i class="bi bi-check-circle me-2"></i> Guardar Producto';
        
        // Scroll suave hacia la tabla
        setTimeout(() => {
            document.getElementById('productosSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
        
    }, 1500);
}

// ===================================
// 6. LIMPIEZA DEL FORMULARIO
// ===================================
/**
 * Limpia todos los campos del formulario
 */
function limpiarFormulario() {
    productForm.reset();
    
    // Remover clases de validación
    Object.values(campos).forEach(campo => {
        campo.classList.remove('is-invalid');
    });
    
    // Desactivar modo edición si está activo
    if (modoEdicion) {
        desactivarModoEdicion();
    }
    
    // Scroll al inicio del formulario
    productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================================
// 7. EVENT LISTENERS
// ===================================

// Envío del formulario
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    guardarProducto();
});

// Botón cancelar
btnCancelar.addEventListener('click', () => {
    const mensaje = modoEdicion 
        ? '¿Deseas cancelar la edición? Los cambios no guardados se perderán.'
        : '¿Estás seguro de que deseas cancelar? Se borrarán los datos del formulario.';
    
    // Usar el modal personalizado en lugar de confirm()
    mostrarModalConfirmacion(mensaje, () => {
        limpiarFormulario();
        ocultarAlerta();
    });
});

// Cerrar alerta al hacer click en ella (para cierre manual rápido)
alertContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-close')) {
        ocultarAlerta();
    }
});

// ===================================
// 8. INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Sistema de administración cargado correctamente');
    console.log('');
    console.log('💡 Funciones disponibles en consola:');
    console.log('   • exportarProductos() - Exporta el inventario a JSON');
    console.log('   • limpiarInventario() - Limpia todos los productos (requiere confirmación)');
    console.log('');
    
    // Cargar productos guardados
    actualizarTabla();
    
    const totalProductos = obtenerProductos().length;
    if (totalProductos > 0) {
        console.log(`✅ ${totalProductos} producto${totalProductos === 1 ? '' : 's'} cargado${totalProductos === 1 ? '' : 's'} desde localStorage`);
    }
    
    // Focus automático en el primer campo
    campos.sku.focus();
});

// ===================================
// 9. FUNCIONES GLOBALES (para onclick)
// ===================================
/**
 * Edita un producto cargando sus datos en el formulario
 * @param {Number} index - Índice del producto en el array
 */
window.editarProducto = function(index) {
    const productos = obtenerProductos();
    const producto = productos[index];
    
    if (!producto) {
        mostrarAlerta('danger', 'Producto no encontrado');
        return;
    }
    
    console.log('✏️ Editando producto:', producto.sku);
    activarModoEdicion(index);
}

/**
 * Elimina un producto después de confirmación del usuario
 * @param {Number} index - Índice del producto en el array
 */
window.eliminarProducto = function(index) {
    const productos = obtenerProductos();
    const producto = productos[index];
    
    if (!producto) {
        mostrarAlerta('danger', 'Producto no encontrado');
        return;
    }
    
    // Mensaje para el modal de confirmación
    const mensajeConfirmacion = 
        `⚠️ ¿Estás seguro de que deseas eliminar este producto?\n\n` +
        `SKU: ${producto.sku}\n` +
        `Nombre: ${producto.nombre}\n\n` +
        `Esta acción no se puede deshacer.`;
    
    // Usar el modal personalizado en lugar de confirm()
    mostrarModalConfirmacion(mensajeConfirmacion, () => {
        // Esta es la función onConfirm
        const eliminadoExitoso = eliminarProductoDeStorage(index);
        
        if (eliminadoExitoso) {
            mostrarAlerta('success', `Producto eliminado: ${producto.sku} - ${producto.nombre}`);
            console.log('🗑️ Producto eliminado:', producto.sku);
            console.log('=== TOTAL PRODUCTOS:', obtenerProductos().length, '===');
            
            // Si estábamos editando ese producto, cancelar la edición
            if (modoEdicion && productoEnEdicionIndex === index) {
                limpiarFormulario();
            }
        }
    });
}

/**
 * BONUS: Exporta todos los productos a un archivo JSON
 * Útil para hacer backup del inventario
 */
window.exportarProductos = function() {
    const productos = obtenerProductos();
    
    if (productos.length === 0) {
        mostrarModalConfirmacion('No hay productos para exportar.', () => {});
        return;
    }
    
    // Crear blob con los datos JSON
    const dataStr = JSON.stringify(productos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Crear link de descarga
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventario_muebleria_${new Date().toISOString().slice(0, 10)}.json`;
    
    // Simular click y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Inventario exportado correctamente');
}

/**
 * BONUS: Limpia todo el inventario (para testing)
 * Requiere confirmación del usuario
 */
window.limpiarInventario = function() {
    const productos = obtenerProductos();
    
    if (productos.length === 0) {
        mostrarModalConfirmacion('El inventario ya está vacío.', () => {});
        return;
    }
    
    const mensajeConfirmacion =
        `⚠️ ¿Estás seguro de que deseas eliminar TODOS los productos?\n\n` +
        `Se eliminarán ${productos.length} producto${productos.length === 1 ? '' : 's'}.\n\n` +
        `Esta acción no se puede deshacer.`;
    
    mostrarModalConfirmacion(mensajeConfirmacion, () => {
        localStorage.removeItem('productos');
        actualizarTabla();
        mostrarAlerta('success', 'Inventario limpiado correctamente');
        console.log('🗑️ Inventario limpiado');
    });
}

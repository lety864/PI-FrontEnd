/**
 * ============================================
 * MUEBLERÍA ESPAÑA - ADMIN.JS
 * ============================================
 * Panel de administración conectado al backend Spring Boot
 * 
 * CAMBIOS PRINCIPALES:
 * - Usa api-admin.js para comunicarse con el backend
 * - Campos simplificados: nombre, descripción, precio, stock, categoría, proveedor, imagen
 * - Sin localStorage (todo se guarda en la base de datos)
 * - Flujo de dos pasos: producto + imagen
 */

import { productoAPI, categoriaAPI, proveedorAPI, crearProductoConImagen } from './api/api-admin.js';
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
let productoEnEdicionId = null;

// Variables de control de edición para categorías
let modoEdicionCategoria = false;
let categoriaEnEdicionId = null;

// Variable GLOBAL para almacenar todas las categorías cargadas
let todasCategorias = [];

// Campos del formulario (actualizados según el HTML actual)
const campos = {
    nombre: document.getElementById('nombre'),
    descripcion: document.getElementById('descripcion'),
    categoria: document.getElementById('categoria'),
    proveedor: document.getElementById('proveedor'),
    precio: document.getElementById('precio'),
    stock: document.getElementById('stock'),
    activo: document.getElementById('activo'),
    imagen: document.getElementById('imagen')
};

// ===================================
// ELEMENTOS DEL DOM - GESTIÓN DE CATEGORÍAS
// ===================================
const categoriaForm = document.getElementById('categoriaForm');
const btnGuardarCategoria = document.getElementById('btnGuardarCategoria');
const btnCancelarCategoria = document.getElementById('btnCancelarCategoria');
const alertContainerCategorias = document.getElementById('alertContainerCategorias');

// Campos del formulario de categorías
const camposCategoria = {
    nombreCategoria: document.getElementById('nombreCategoria'),
    categoriaPadreNombre: document.getElementById('categoriaPadreNombre'), // Input del nombre
    categoriaActiva: document.getElementById('categoriaActiva')
};

// Elementos de la tabla de categorías
const emptyStateCategorias = document.getElementById('emptyStateCategorias');
const tablaContainerCategorias = document.getElementById('tablaContainerCategorias');
const categoriasTableBody = document.getElementById('categoriasTableBody');
const contadorCategorias = document.getElementById('contadorCategorias');

// Datalist para autocompletar categorías padre
const listaCategoriasPadre = document.getElementById('listaCategoriasPadre');

// ===================================
// 2. SISTEMA DE ALERTAS (BOOTSTRAP)
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
 * @param {string} mensaje - Texto de pregunta
 * @param {function} onConfirm - Callback si confirma
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
// 4. CARGA DE DATOS DESDE EL BACKEND
// ===================================

/**
 * Carga los selects de categorías y proveedores desde el backend
 */
async function cargarSelects() {
    try {
        console.log('Cargando categorías y proveedores...');
        
        // Cargar categorías y proveedores en paralelo
        const [categorias, proveedores] = await Promise.all([
            categoriaAPI.obtenerTodas(),
            proveedorAPI.obtenerTodos()
        ]);
        
        // GUARDAR CATEGORÍAS GLOBALMENTE (para traducción nombre->ID)
        todasCategorias = categorias;
        
        console.log('✅ Categorías cargadas:', categorias.length);
        console.log('✅ Proveedores cargados:', proveedores.length);
        
        // Llenar select de categorías con jerarquía (para formulario de productos)
        llenarSelectCategorias(categorias);
        
        // Llenar select de proveedores
        llenarSelectProveedores(proveedores);
        
        // Llenar datalist de categorías padre (para formulario de categorías)
        llenarDatalistCategoriasPadre(categorias);
        
        // Actualizar tabla de categorías
        actualizarTablaCategorias();
        
    } catch (error) {
        console.error('Error al cargar selects:', error);
        mostrarAlerta('danger', `No se pudieron cargar las categorías y proveedores: ${error.message}`);
    }
}

/**
 * Llena el select de categorías mostrando la jerarquía
 * @param {Array} categorias - Array de categorías del backend
 */
function llenarSelectCategorias(categorias) {
    // Separar padres de hijos
    const categoriasPadre = categorias.filter(cat => !cat.idCategoriaPadre && cat.activo);
    const categoriasHijas = categorias.filter(cat => cat.idCategoriaPadre && cat.activo);
    
    // Limpiar y agregar opción por defecto
    campos.categoria.innerHTML = '<option value="" selected disabled>Selecciona una categoría</option>';
    
    // Recorrer categorías padre
    categoriasPadre.forEach(padre => {
        // Agregar categoría padre
        const optionPadre = document.createElement('option');
        optionPadre.value = padre.idCategoria;
        optionPadre.textContent = padre.nombreCategoria;
        campos.categoria.appendChild(optionPadre);
        
        // Buscar y agregar sus hijos con indentación
        const hijos = categoriasHijas.filter(hijo => hijo.idCategoriaPadre === padre.idCategoria);
        
        hijos.forEach(hijo => {
            const optionHijo = document.createElement('option');
            optionHijo.value = hijo.idCategoria;
            optionHijo.textContent = `   — ${hijo.nombreCategoria}`;
            campos.categoria.appendChild(optionHijo);
        });
    });
}

/**
 * Llena el select de proveedores
 * @param {Array} proveedores - Array de proveedores del backend
 */
function llenarSelectProveedores(proveedores) {
    // Filtrar solo proveedores activos
    const proveedoresActivos = proveedores.filter(p => p.activo);
    
    // Limpiar y agregar opción por defecto
    campos.proveedor.innerHTML = '<option value="" selected disabled>Selecciona un proveedor</option>';
    
    // Agregar cada proveedor
    proveedoresActivos.forEach(proveedor => {
        const option = document.createElement('option');
        option.value = proveedor.idProveedor;
        option.textContent = `${proveedor.nombreEmpresa} (${proveedor.nombre})`;
        campos.proveedor.appendChild(option);
    });
}

/**
 * Carga todos los productos desde el backend y actualiza la tabla
 */
async function actualizarTabla() {
    try {
        console.log('Cargando productos...');
        
        const productos = await productoAPI.obtenerTodos();
        
        console.log('Productos cargados:', productos.length);
        
        // Actualizar contador
        const total = productos.length;
        contadorProductos.innerHTML = `<strong>${total}</strong> producto${total === 1 ? '' : 's'}`;
        
        // Si no hay productos, mostrar empty state
        if (total === 0) {
            emptyState.style.display = 'flex';
            tablaContainer.style.display = 'none';
            return;
        }
        
        // Ocultar empty state y mostrar tabla
        emptyState.style.display = 'none';
        tablaContainer.style.display = 'block';
        
        // Llenar tabla
        productosTableBody.innerHTML = '';
        
        productos.forEach(producto => {
            const fila = crearFilaProducto(producto);
            productosTableBody.appendChild(fila);
        });
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarAlerta('danger', `No se pudieron cargar los productos: ${error.message}`);
    }
}

/**
 * Crea una fila de la tabla para un producto
 * @param {Object} producto - Datos del producto
 * @returns {HTMLElement} - Fila <tr> con los datos
 */
function crearFilaProducto(producto) {
    const tr = document.createElement('tr');
    
    // Extraer datos del producto
    const nombre = producto.producto || 'Sin nombre';
    const categoria = producto.categoria?.nombreCategoria || 'Sin categoría';
    const proveedor = producto.proveedor?.nombreEmpresa || 'Sin proveedor';
    const precio = parseFloat(producto.precioActual || 0).toFixed(2);
    const stock = producto.stockDisponible || 0;
    const activo = producto.activo;
    
    // Determinar badge de estado
    const badgeEstado = activo 
        ? '<span class="badge bg-success">Activo</span>'
        : '<span class="badge bg-secondary">Inactivo</span>';
    
    // Determinar badge de stock
    let badgeStock = '';
    if (stock === 0) {
        badgeStock = '<span class="badge bg-danger ms-1">Agotado</span>';
    } else if (stock < 5) {
        badgeStock = '<span class="badge bg-warning text-dark ms-1">Bajo</span>';
    }
    
    // Obtener URL de imagen (si existe)
    const imagenUrl = producto.imagenes && producto.imagenes.length > 0 
        ? producto.imagenes[0].urlImagen 
        : '';
    
    const imagenHTML = imagenUrl 
        ? `<a href="${imagenUrl}" target="_blank" class="btn btn-sm btn-outline-secondary">
             <i class="bi bi-image"></i>
           </a>`
        : '<span class="text-muted">Sin imagen</span>';
    
    tr.innerHTML = `
        <td>${nombre}</td>
        <td>${categoria}</td>
        <td>${proveedor}</td>
        <td class="text-end">$${precio} MXN</td>
        <td class="text-center">${stock}${badgeStock}</td>
        <td class="text-center">${badgeEstado}</td>
        <td class="text-center">${imagenHTML}</td>
        <td class="text-center">
            <button onclick="editarProducto(${producto.idProducto})" 
                    class="btn btn-sm btn-primary" 
                    title="Editar producto">
                <i class="bi bi-pencil"></i>
            </button>
        </td>
    `;
    
    return tr;
}

// ===================================
// 5. VALIDACIÓN Y GUARDADO
// ===================================

/**
 * Valida que todos los campos obligatorios estén completos
 * @returns {boolean} - true si es válido
 */
function validarFormulario() {
    let esValido = true;
    
    // Validar cada campo obligatorio
    Object.keys(campos).forEach(key => {
        const campo = campos[key];
        
        // Saltar checkbox (activo) y campos opcionales
        if (campo.type === 'checkbox') return;
        if (key === 'imagen') return; // La imagen es opcional
        
        // Verificar si está vacío
        if (!campo.value.trim()) {
            campo.classList.add('is-invalid');
            esValido = false;
        } else {
            campo.classList.remove('is-invalid');
        }
    });
    
    // Validación especial para selects
    if (campos.categoria.value === '') {
        campos.categoria.classList.add('is-invalid');
        esValido = false;
    }
    
    if (campos.proveedor.value === '') {
        campos.proveedor.classList.add('is-invalid');
        esValido = false;
    }
    
    return esValido;
}

/**
 * Guarda o actualiza un producto
 */
async function guardarProducto() {
    // Validar formulario
    if (!validarFormulario()) {
        mostrarAlerta('danger', 'Por favor completa todos los campos obligatorios');
        return;
    }
    
    // Cambiar botón a estado de carga
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        // Construir objeto para el backend (sin imagen)
        const datosProducto = {
            producto: campos.nombre.value.trim(),
            descripcion: campos.descripcion.value.trim(),
            precioActual: parseFloat(campos.precio.value),
            stockDisponible: parseInt(campos.stock.value),
            activo: campos.activo.checked,
            idCategoria: parseInt(campos.categoria.value),
            idProveedor: parseInt(campos.proveedor.value)
        };
        
        // Obtener URL de imagen (opcional)
        const urlImagen = campos.imagen.value.trim();
        
        console.log('Datos a enviar:', datosProducto);
        console.log('URL de imagen:', urlImagen || 'Sin imagen');
        
        let resultado;
        
        if (modoEdicion) {
            // ACTUALIZAR producto existente
            resultado = await productoAPI.actualizar(productoEnEdicionId, datosProducto);
            
            // Si hay imagen, también actualizarla (esto requeriría un endpoint adicional)
            // Por ahora, las imágenes solo se agregan al crear
            
            mostrarAlerta('success', `Producto actualizado: ${datosProducto.producto}`);
            console.log('Producto actualizado:', resultado);
            
        } else {
            // CREAR nuevo producto (con imagen si existe)
            resultado = await crearProductoConImagen(datosProducto, urlImagen);
            
            mostrarAlerta('success', `Producto creado exitosamente: ${datosProducto.producto}`);
            console.log('Producto creado:', resultado);
        }
        
        // Limpiar formulario
        limpiarFormulario();
        
        // Actualizar tabla
        await actualizarTabla();
        
        // Scroll hacia la tabla
        setTimeout(() => {
            document.getElementById('productosSection').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 500);
        
    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarAlerta('danger', `Error al guardar: ${error.message}`);
    } finally {
        // Restaurar botón
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

// ===================================
// 6. MODO EDICIÓN
// ===================================

/**
 * Activa el modo edición y carga los datos del producto en el formulario
 * @param {number} idProducto - ID del producto a editar
 */
async function activarModoEdicion(idProducto) {
    try {
        console.log('Activando modo edición para producto:', idProducto);
        
        // Obtener todos los productos (alternativa: crear endpoint GET /api/productos/admin/{id})
        const productos = await productoAPI.obtenerTodos();
        const producto = productos.find(p => p.idProducto === idProducto);
        
        if (!producto) {
            mostrarAlerta('danger', 'Producto no encontrado');
            return;
        }
        
        // Activar modo edición
        modoEdicion = true;
        productoEnEdicionId = idProducto;
        
        // Cargar datos en el formulario
        campos.nombre.value = producto.producto || '';
        campos.descripcion.value = producto.descripcion || '';
        campos.precio.value = producto.precioActual || 0;
        campos.stock.value = producto.stockDisponible || 0;
        campos.activo.checked = producto.activo;
        campos.categoria.value = producto.categoria?.idCategoria || '';
        campos.proveedor.value = producto.proveedor?.idProveedor || '';
        
        // Cargar imagen si existe
        if (producto.imagenes && producto.imagenes.length > 0) {
            campos.imagen.value = producto.imagenes[0].urlImagen;
        }
        
        // Cambiar texto del botón
        btnGuardar.innerHTML = '<i class="bi bi-save me-2"></i>Actualizar Producto';
        
        // Scroll al formulario
        productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight visual
        productForm.style.boxShadow = '0 0 0 3px rgba(13, 110, 253, 0.25)';
        setTimeout(() => {
            productForm.style.boxShadow = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error al activar modo edición:', error);
        mostrarAlerta('danger', `Error: ${error.message}`);
    }
}

/**
 * Desactiva el modo edición
 */
function desactivarModoEdicion() {
    modoEdicion = false;
    productoEnEdicionId = null;
    btnGuardar.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Producto';
}

// ===================================
// 7. LIMPIEZA DEL FORMULARIO
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
    
    // Desactivar modo edición
    if (modoEdicion) {
        desactivarModoEdicion();
    }
    
    // Scroll al inicio del formulario
    productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================================
// 8. EVENT LISTENERS
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
    
    mostrarModalConfirmacion(mensaje, () => {
        limpiarFormulario();
        ocultarAlerta();
    });
});

// ===================================
// 9. INICIALIZACIÓN
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sistema de administración cargado');
    console.log('');
    
    try {
        // Cargar selects de categorías y proveedores
        await cargarSelects();
        
        // Cargar productos guardados
        await actualizarTabla();
        
        console.log('Sistema inicializado correctamente');
        
    } catch (error) {
        console.error('Error al inicializar:', error);
        mostrarAlerta('danger', `Error al inicializar: ${error.message}. Verifica que el backend esté corriendo.`);
    }
    
    // Focus automático en el primer campo
    campos.nombre.focus();
});

// ===================================
// 10. FUNCIONES GLOBALES (para onclick)
// ===================================

/**
 * Edita un producto
 * @param {number} idProducto - ID del producto
 */
window.editarProducto = function(idProducto) {
    activarModoEdicion(idProducto);
};

// ===================================
// GESTIÓN DE CATEGORÍAS
// ===================================

/**
 * Llena el datalist con categorías PRINCIPALES ACTIVAS (para el formulario de categorías)
 * @param {Array} categorias - Array de todas las categorías
 */
function llenarDatalistCategoriasPadre(categorias) {
    // Filtrar solo categorías principales activas (sin padre)
    const categoriasPrincipales = categorias.filter(cat => 
        !cat.idCategoriaPadre && cat.activo
    );
    
    // Limpiar datalist
    listaCategoriasPadre.innerHTML = '';
    
    // Agregar cada categoría principal como opción
    categoriasPrincipales.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.nombreCategoria;
        listaCategoriasPadre.appendChild(option);
    });
    
    console.log(`✅ Datalist llenado con ${categoriasPrincipales.length} categorías principales`);
}

/**
 * Actualiza la tabla de categorías
 */
async function actualizarTablaCategorias() {
    try {
        // Usar las categorías ya cargadas globalmente
        const categorias = todasCategorias;
        
        // Actualizar contador
        const total = categorias.length;
        const activas = categorias.filter(c => c.activo).length;
        
        contadorCategorias.innerHTML = `
            <strong>${total}</strong> categoría${total !== 1 ? 's' : ''} 
            <span class="text-muted">(${activas} activa${activas !== 1 ? 's' : ''})</span>
        `;
        
        // Mostrar/ocultar empty state
        if (total === 0) {
            emptyStateCategorias.style.display = 'flex';
            tablaContainerCategorias.style.display = 'none';
            return;
        }
        
        emptyStateCategorias.style.display = 'none';
        tablaContainerCategorias.style.display = 'block';
        
        // Limpiar tbody
        categoriasTableBody.innerHTML = '';
        
        // Renderizar categorías
        categorias.forEach(categoria => {
            const fila = crearFilaCategoria(categoria);
            categoriasTableBody.appendChild(fila);
        });
        
    } catch (error) {
        console.error('Error al actualizar tabla de categorías:', error);
    }
}

/**
 * Crea una fila de la tabla para una categoría
 * @param {Object} categoria - Datos de la categoría
 * @returns {HTMLElement} - Fila <tr>
 */
function crearFilaCategoria(categoria) {
    const tr = document.createElement('tr');
    
    // Determinar si es principal o subcategoría
    const tipo = categoria.idCategoriaPadre 
        ? '<span class="badge bg-info">Subcategoría</span>' 
        : '<span class="badge bg-primary">Principal</span>';
    
    // Buscar el nombre de la categoría padre
    let nombrePadre = '-';
    if (categoria.idCategoriaPadre) {
        const padre = todasCategorias.find(c => c.idCategoria === categoria.idCategoriaPadre);
        nombrePadre = padre ? padre.nombreCategoria : 'No encontrada';
    }
    
    // Badge de estado
    const badgeEstado = categoria.activo 
        ? '<span class="badge bg-success">Activa</span>'
        : '<span class="badge bg-secondary">Inactiva</span>';
    
    tr.innerHTML = `
        <td><strong>${categoria.nombreCategoria}</strong></td>
        <td>${tipo}</td>
        <td>${nombrePadre}</td>
        <td class="text-center">${badgeEstado}</td>
        <td class="text-center">
            <button onclick="editarCategoria(${categoria.idCategoria})" 
                    class="btn btn-sm btn-primary" 
                    title="Editar categoría">
                <i class="bi bi-pencil"></i>
            </button>
        </td>
    `;
    
    return tr;
}

/**
 * Muestra una alerta específica para categorías
 */
function mostrarAlertaCategoria(tipo, mensaje) {
    alertContainerCategorias.innerHTML = '';
    
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
    
    alertContainerCategorias.appendChild(alertDiv);
    alertContainerCategorias.style.display = 'block';
    alertContainerCategorias.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        try {
            const bsAlert = new bootstrap.Alert(alertDiv);
            bsAlert.close();
        } catch (e) {
            // Alerta ya cerrada
        }
    }, 5000);
}

/**
 * FUNCIÓN CLAVE: Traduce el nombre de categoría padre a su ID
 * @param {string} nombrePadre - Nombre escrito por el admin
 * @returns {number|null} - ID de la categoría o null
 */
function traducirNombrePadreAId(nombrePadre) {
    // Si el campo está vacío, es una categoría principal
    if (!nombrePadre || nombrePadre.trim() === '') {
        return null;
    }
    
    // Buscar la categoría en el array global (case-insensitive)
    const categoriaEncontrada = todasCategorias.find(cat => 
        cat.nombreCategoria.toLowerCase() === nombrePadre.trim().toLowerCase() &&
        !cat.idCategoriaPadre && // Solo buscar en categorías principales
        cat.activo // Solo activas
    );
    
    if (categoriaEncontrada) {
        console.log(`Traducción: "${nombrePadre}" → ID ${categoriaEncontrada.idCategoria}`);
        return categoriaEncontrada.idCategoria;
    }
    
    // Si no se encontró, retornar -1 (código de error)
    console.warn(`No se encontró la categoría principal: "${nombrePadre}"`);
    return -1;
}

/**
 * Guarda o actualiza una categoría
 */
async function guardarCategoria(e) {
    e.preventDefault();
    
    // Obtener valores del formulario
    const nombreCategoria = camposCategoria.nombreCategoria.value.trim();
    const nombrePadre = camposCategoria.categoriaPadreNombre.value.trim();
    const activo = camposCategoria.categoriaActiva.checked;
    
    // Validación básica
    if (!nombreCategoria) {
        camposCategoria.nombreCategoria.classList.add('is-invalid');
        mostrarAlertaCategoria('danger', 'El nombre de la categoría es obligatorio');
        return;
    }
    
    // TRADUCCIÓN: Convertir nombre a ID (o null)
    const idCategoriaPadre = traducirNombrePadreAId(nombrePadre);
    
    // Si la traducción falló (retornó -1), mostrar error
    if (idCategoriaPadre === -1) {
        camposCategoria.categoriaPadreNombre.classList.add('is-invalid');
        document.getElementById('errorCategoriaPadre').textContent = 
            `La categoría principal "${nombrePadre}" no existe. Créala primero como categoría principal.`;
        mostrarAlertaCategoria('danger', `La categoría "${nombrePadre}" no existe`);
        return;
    }
    
    // Construir objeto para el backend
    const datosCategoria = {
        nombreCategoria: nombreCategoria,
        idCategoriaPadre: idCategoriaPadre, // Puede ser null o un número
        activo: activo
    };
    
    // Cambiar botón a estado de carga
    const textoOriginal = btnGuardarCategoria.innerHTML;
    btnGuardarCategoria.disabled = true;
    btnGuardarCategoria.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
    
    try {
        let resultado;
        
        if (modoEdicionCategoria) {
            // ACTUALIZAR
            resultado = await categoriaAPI.actualizar(categoriaEnEdicionId, datosCategoria);
            mostrarAlertaCategoria('success', `Categoría actualizada: ${nombreCategoria}`);
        } else {
            // CREAR
            resultado = await categoriaAPI.crear(datosCategoria);
            mostrarAlertaCategoria('success', `Categoría creada: ${nombreCategoria}`);
        }
        
        console.log('Categoría guardada:', resultado);
        
        // Recargar categorías y actualizar UI
        todasCategorias = await categoriaAPI.obtenerTodas();
        llenarSelectCategorias(todasCategorias);
        llenarDatalistCategoriasPadre(todasCategorias);
        actualizarTablaCategorias();
        
        // Limpiar formulario
        limpiarFormularioCategoria();
        
    } catch (error) {
        console.error('Error al guardar categoría:', error);
        mostrarAlertaCategoria('danger', `Error: ${error.message}`);
    } finally {
        btnGuardarCategoria.disabled = false;
        btnGuardarCategoria.innerHTML = textoOriginal;
    }
}

/**
 * Limpia el formulario de categorías
 */
function limpiarFormularioCategoria() {
    categoriaForm.reset();
    
    // Quitar clases de validación
    Object.values(camposCategoria).forEach(campo => {
        campo.classList.remove('is-invalid');
    });
    
    // Desactivar modo edición
    if (modoEdicionCategoria) {
        modoEdicionCategoria = false;
        categoriaEnEdicionId = null;
        btnGuardarCategoria.innerHTML = '<i class="bi bi-check-circle me-2"></i>Guardar Categoría';
    }
    
    // Scroll al inicio
    categoriaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Activa el modo edición para una categoría
 * @param {number} idCategoria - ID de la categoría a editar
 */
async function activarModoEdicionCategoria(idCategoria) {
    try {
        // Buscar la categoría en el array global
        const categoria = todasCategorias.find(c => c.idCategoria === idCategoria);
        
        if (!categoria) {
            mostrarAlertaCategoria('danger', 'Categoría no encontrada');
            return;
        }
        
        // Activar modo edición
        modoEdicionCategoria = true;
        categoriaEnEdicionId = idCategoria;
        
        // Cargar datos en el formulario
        camposCategoria.nombreCategoria.value = categoria.nombreCategoria;
        camposCategoria.categoriaActiva.checked = categoria.activo;
        
        // Si tiene padre, buscar su NOMBRE (traducción inversa: ID → Nombre)
        if (categoria.idCategoriaPadre) {
            const padre = todasCategorias.find(c => c.idCategoria === categoria.idCategoriaPadre);
            camposCategoria.categoriaPadreNombre.value = padre ? padre.nombreCategoria : '';
        } else {
            camposCategoria.categoriaPadreNombre.value = '';
        }
        
        // Cambiar texto del botón
        btnGuardarCategoria.innerHTML = '<i class="bi bi-save me-2"></i>Actualizar Categoría';
        
        // Scroll al formulario
        categoriaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        mostrarAlertaCategoria('info', `Editando: ${categoria.nombreCategoria}`);
        
    } catch (error) {
        console.error('Error al activar modo edición:', error);
        mostrarAlertaCategoria('danger', `Error: ${error.message}`);
    }
}

// Event listeners para gestión de categorías
categoriaForm.addEventListener('submit', guardarCategoria);

btnCancelarCategoria.addEventListener('click', () => {
    const mensaje = modoEdicionCategoria 
        ? '¿Deseas cancelar la edición? Los cambios no guardados se perderán.'
        : '¿Deseas cancelar? Se borrarán los datos del formulario.';
    
    mostrarModalConfirmacion(mensaje, () => {
        limpiarFormularioCategoria();
    });
});

/**
 * Función global para editar categoría (llamada desde onclick)
 */
window.editarCategoria = function(idCategoria) {
    activarModoEdicionCategoria(idCategoria);
};
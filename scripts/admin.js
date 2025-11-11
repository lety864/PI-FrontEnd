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
        
        console.log('✅ Categorías cargadas:', categorias.length);
        console.log('✅ Proveedores cargados:', proveedores.length);
        
        // Llenar select de categorías con jerarquía
        llenarSelectCategorias(categorias);
        
        // Llenar select de proveedores
        llenarSelectProveedores(proveedores);
        
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

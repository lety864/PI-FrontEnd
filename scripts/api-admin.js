/**
 * ============================================
 * API ADMIN - MUEBLERÍA ESPAÑA
 * ============================================
 * Este archivo contiene todas las funciones para comunicarse
 * con el backend de Spring Boot.
 * 
 * URL BASE del backend:
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * ============================================
 * UTILIDADES
 * ============================================
 */

/**
 * Maneja errores de las peticiones fetch
 * @param {Response} response - Respuesta del fetch
 * @returns {Promise} - Promesa con la data o error
 */


async function manejarRespuesta(response) {
    if (!response.ok) {
        // Intentar leer el mensaje de error del backend
        let mensajeError = `Error ${response.status}: ${response.statusText}`;
        
        try {
            const errorData = await response.json();
            // Si el backend devuelve un campo 'message' o 'error', usarlo
            mensajeError = errorData.message || errorData.error || mensajeError;
        } catch (e) {
            // Si no se puede parsear JSON, usar el mensaje por defecto
        }
        
        throw new Error(mensajeError);
    }
    
    // Verificar si hay contenido en la respuesta
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await response.json();
    }
    
    return null; // Para respuestas sin contenido (ej. DELETE exitoso)
}

/**
 * ============================================
 * 1. GESTIÓN DE PROVEEDORES
 * ============================================
 */

export const proveedorAPI = {
    /**
     * Obtiene todos los proveedores (activos e inactivos)
     * GET /api/proveedores/admin/todos
     */
    obtenerTodos : async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/proveedores/admin/todos`);
            const data = await manejarRespuesta(response);
            return data;
            
        } catch (error) {
            console.error('Error en getAllProveedores: ', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo proveedor
     * POST /api/proveedores/admin/add
     * @param {Object} proveedor - Datos del proveedor
     * @param {string} proveedor.nombreEmpresa - Nombre de la empresa
     * @param {string} proveedor.nombre - Nombre del contacto
     * @param {string} proveedor.telefono - Teléfono
     * @param {string} proveedor.correo - Email
     * @param {string} proveedor.direccion - Dirección
     * @param {boolean} proveedor.activo - Estado activo/inactivo
     */
    async crear(proveedor) {
        try {
            const response = await fetch(`${API_BASE_URL}/proveedores/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proveedor)
            });
            return await manejarRespuesta(response);
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            throw error;
        }
    },

    /**
     * Actualiza un proveedor existente
     * PUT /api/proveedores/admin/update/{id}
     */
    async actualizar(id, proveedor) {
        try {
            const response = await fetch(`${API_BASE_URL}/proveedores/admin/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(proveedor)
            });
            return await manejarRespuesta(response);
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            throw error;
        }
    }
};

/**
 * ============================================
 * 2. GESTIÓN DE CATEGORÍAS
 * ============================================
 */

const categoriaAPI = {
    /**
     * Obtiene todas las categorías
     * GET /api/categorias/admin/todos
     */
    async obtenerTodas() {
        try {
            const response = await fetch(`${API_BASE_URL}/categorias/admin/todos`);
            return await manejarRespuesta(response);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            throw error;
        }
    },

    /**
     * Crea una nueva categoría o subcategoría
     * POST /api/categorias/admin/add
     * @param {Object} categoria - Datos de la categoría
     * @param {string} categoria.nombreCategoria - Nombre de la categoría
     * @param {number|null} categoria.idCategoriaPadre - ID de la categoría padre (null para categorías principales)
     * @param {boolean} categoria.activo - Estado activo/inactivo
     */
    async crear(categoria) {
        try {
            const response = await fetch(`${API_BASE_URL}/categorias/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(categoria)
            });
            return await manejarRespuesta(response);
        } catch (error) {
            console.error('Error al crear categoría:', error);
            throw error;
        }
    }
};

/**
 * ============================================
 * 3. GESTIÓN DE PRODUCTOS (Principal)
 * ============================================
 */

const productoAPI = {
    /**
     * Obtiene todos los productos (activos e inactivos)
     * GET /api/productos/admin/todos
     */
    async obtenerTodos() {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/admin/todos`);
            return await manejarRespuesta(response);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo producto
     * POST /api/productos/admin/add
     * @param {Object} producto - Datos del producto
     * @param {string} producto.producto - Nombre del producto
     * @param {string} producto.descripcion - Descripción
     * @param {number} producto.precioActual - Precio (número, no string)
     * @param {number} producto.stockDisponible - Stock disponible
     * @param {boolean} producto.activo - Estado activo/inactivo
     * @param {number} producto.idCategoria - ID de la categoría
     * @param {number} producto.idProveedor - ID del proveedor
     * @returns {Object} - Producto creado (incluye idProducto)
     */
    async crear(producto) {
        try {
            console.log('📤 Enviando producto al backend:', producto);
            
            const response = await fetch(`${API_BASE_URL}/productos/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
            
            const productoCreado = await manejarRespuesta(response);
            console.log('Producto creado:', productoCreado);
            return productoCreado;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw error;
        }
    },

    /**
     * Actualiza un producto existente
     * PUT /api/productos/admin/update/{id}
     */
    async actualizar(id, producto) {
        try {
            console.log(`Actualizando producto ${id}:`, producto);
            
            const response = await fetch(`${API_BASE_URL}/productos/admin/update/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(producto)
            });
            
            const productoActualizado = await manejarRespuesta(response);
            console.log('Producto actualizado:', productoActualizado);
            return productoActualizado;
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            throw error;
        }
    }
};

/**
 * ============================================
 * 4. GESTIÓN DE IMÁGENES DE PRODUCTOS
 * ============================================
 */

const imagenAPI = {
    /**
     * Añade una imagen a un producto existente
     * POST /api/imagenes/admin/add
     * @param {Object} imagen - Datos de la imagen
     * @param {string} imagen.urlImagen - URL de la imagen
     * @param {number} imagen.idProducto - ID del producto al que pertenece
     */
    async agregar(imagen) {
        try {
            console.log('Enviando imagen al backend:', imagen);
            
            const response = await fetch(`${API_BASE_URL}/imagenes/admin/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(imagen)
            });
            
            const imagenCreada = await manejarRespuesta(response);
            console.log('Imagen agregada:', imagenCreada);
            return imagenCreada;
        } catch (error) {
            console.error('Error al agregar imagen:', error);
            throw error;
        }
    }
};

/**
 * ============================================
 * 5. FUNCIÓN HELPER PARA CREAR PRODUCTO + IMAGEN
 * ============================================
 * Esta función combina la creación del producto y su imagen en un solo flujo
 */

/**
 * Crea un producto y su imagen en dos pasos
 * @param {Object} datosProducto - Datos del producto (sin imagen)
 * @param {string|null} urlImagen - URL de la imagen (opcional)
 * @returns {Object} - { producto, imagen }
 */
async function crearProductoConImagen(datosProducto, urlImagen) {
    try {
        // PASO 1: Crear el producto
        const productoCreado = await productoAPI.crear(datosProducto);
        
        // PASO 2: Si hay URL de imagen, crear la imagen
        let imagenCreada = null;
        if (urlImagen && urlImagen.trim() !== '') {
            const datosImagen = {
                urlImagen: urlImagen,
                idProducto: productoCreado.idProducto
            };
            
            imagenCreada = await imagenAPI.agregar(datosImagen);
        }
        
        return {
            producto: productoCreado,
            imagen: imagenCreada
        };
    } catch (error) {
        console.error('Error en crearProductoConImagen:', error);
        throw error;
    }
}

/**
 * ============================================
 * EXPORTAR FUNCIONES
 * ============================================
 * Para que estén disponibles en otros scripts
 */

// Si se usa módulos ES6, exportar así:
// export { proveedorAPI, categoriaAPI, productoAPI, imagenAPI, crearProductoConImagen };

// Para uso en HTML con <script src="...">, las funciones ya están en el scope global
console.log('API Admin cargada correctamente');
console.log('📡 Base URL:', API_BASE_URL);
console.log('');
console.log('📦 APIs disponibles:');
console.log('   • proveedorAPI.obtenerTodos()');
console.log('   • proveedorAPI.crear(datos)');
console.log('   • categoriaAPI.obtenerTodas()');
console.log('   • categoriaAPI.crear(datos)');
console.log('   • productoAPI.obtenerTodos()');
console.log('   • productoAPI.crear(datos)');
console.log('   • productoAPI.actualizar(id, datos)');
console.log('   • imagenAPI.agregar(datos)');
console.log('   • crearProductoConImagen(producto, urlImagen)');
console.log('');
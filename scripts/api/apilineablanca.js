/*// URL DE TU API DE SPRING
        const API_URL = 'http://localhost:8080/api/productos';

        // =========================================
        // 1. LÓGICA DE CARRITO (localStorage)
        // =========================================

        // Obtiene el carrito del almacenamiento local
        function getCarrito() {
            try {
                return JSON.parse(localStorage.getItem('carrito')) || [];
            } catch (e) {
                console.error("Error al parsear el carrito de localStorage:", e);
                return [];
            }
        }

        // Guarda el carrito actualizado en el almacenamiento local
        function saveCarrito(carrito) {
            localStorage.setItem('carrito', JSON.stringify(carrito));
        }

        // Actualiza los contadores visuales del carrito (los badges)
        function updateCartBadges() {
            const carrito = getCarrito();
            const count = carrito.length;
            
            const badges = [
                document.getElementById('cart-badge-desktop'),
                document.getElementById('cart-badge-mobile')
            ];

            badges.forEach(badge => {
                if (badge) {
                    badge.textContent = count;
                    if (count > 0) {
                        badge.classList.remove('d-none');
                    } else {
                        badge.classList.add('d-none');
                    }
                }
            });
        }
        
        // Función principal para añadir un producto
        function anadirAlCarrito(producto) {
            const carrito = getCarrito();
            carrito.push(producto);
            saveCarrito(carrito);
            updateCartBadges(); 

            // Simulación de notificación (en consola, ya que alert() está prohibido)
            console.log(`¡Producto añadido! ${producto.producto}. Total en carrito: ${carrito.length}`);
            
            // Si quieres una notificación visual simple, usa un Toast de Bootstrap.
            // Para este ejemplo, mantendremos la lógica simple sin el Toast setup.
        }


        // =========================================
        // 2. LÓGICA DE CARGA DE PRODUCTOS
        // =========================================
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.getElementById('productInfo');
            const loadingMessage = document.getElementById('loading-message');
            
            // Asegura que los contadores del carrito estén correctos al cargar
            updateCartBadges();

            fetch(API_URL)
                .then(respuesta => {
                    if (!respuesta.ok) {
                        throw new Error(`Error HTTP: ${respuesta.status}`);
                    }
                    return respuesta.json();
                })
                .then(productos => {
                    // Limpia el mensaje de carga
                    if(loadingMessage) loadingMessage.remove(); 
                    container.innerHTML = ''; 

                    // Dibuja las tarjetas de productos
                    productos.forEach(producto => {
                        
                        // 1. Obtener la URL de la imagen
                        let primeraImagenUrl = 'https://placehold.co/400x300/363636/ffffff?text=Mueble+España';
                        if (producto.imagenesProducto && producto.imagenesProducto.length > 0 && producto.imagenesProducto[0].urlImagen) {
                            primeraImagenUrl = producto.imagenesProducto[0].urlImagen;
                        }

                        // 2. Crear el contenedor de la tarjeta (columna de la cuadrícula)
                        const colDiv = document.createElement('div');
                        colDiv.className = 'col-lg-3 col-md-4 col-6'; // Grid de Bootstrap

                        // 3. Crear el HTML de la tarjeta (usando Bootstrap Card)
                        const cardHtml = `
                            <div class="card h-100 product-card-hover">
                                <img src="${primeraImagenUrl}" 
                                     class="card-img-top" 
                                     alt="${producto.producto}"
                                     onerror="this.onerror=null; this.src='https://placehold.co/400x300/363636/ffffff?text=Mueble+España';">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title text-truncate">${producto.producto}</h5>
                                    <p class="card-text text-muted small flex-grow-1">${producto.descripcion || 'Sin descripción.'}</p>
                                    <div class="d-flex justify-content-between align-items-center mt-auto">
                                        <span class="fs-5 fw-bold text-success">$${producto.precioActual ? producto.precioActual.toFixed(2) : '0.00'}</span>
                                        <button class="btn btn-primary btn-sm anadir-btn">
                                            <i class="bi bi-cart-plus"></i> Añadir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        colDiv.innerHTML = cardHtml;
                        
                        // 4. Agregar el listener al botón (ES CRUCIAL HACER ESTO DESPUÉS DE INNERHTML)
                        const boton = colDiv.querySelector('.anadir-btn');
                        boton.addEventListener('click', () => anadirAlCarrito(producto));

                        // 5. Insertar en el contenedor principal
                        container.appendChild(colDiv);
                    });
                })
                .catch(error => {
                    console.error("Error al cargar productos:", error);
                    if(loadingMessage) loadingMessage.remove(); 
                    container.innerHTML = `
                        <div class="col-12 text-center alert alert-danger" role="alert">
                            Error al conectar con el backend (${API_URL}). Asegúrate de que tu servidor Spring esté corriendo.
                        </div>
                    `;
                });
        });*/
// URL DE TU API DE SPRING
const API_URL = 'http://localhost:8080/api/productos';
const token = localStorage.getItem('token');
console.log(token);

// =========================================
// 1. LÓGICA DE CARRITO (localStorage)
// =========================================

// Obtiene el carrito del almacenamiento local
function getCarrito() {
    try {
        return JSON.parse(localStorage.getItem('carrito')) || [];
    } catch (e) {
        console.error("Error al parsear el carrito de localStorage:", e);
        return [];
    }
}

// Guarda el carrito actualizado en el almacenamiento local
function saveCarrito(carrito) {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Actualiza los contadores visuales del carrito (los badges)
function updateCartBadges() {
    const carrito = getCarrito();
    const totalItems = carrito.reduce((total, producto) => total + (producto.cantidad || 0), 0);
    
    const badges = [
        document.getElementById('cart-badge-desktop'),
        document.getElementById('cart-badge-mobile')
    ];

    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            if (totalItems > 0) {
                badge.classList.remove('d-none');
            } else {
                badge.classList.add('d-none');
            }
        }
    });
}

// Función principal para añadir un producto
function anadirAlCarrito(producto) {
    const carrito = getCarrito();
    
    // USAR idProducto EN LUGAR DE id (porque @JsonProperty no funciona)
    const productoCarrito = {
        id: producto.idProducto,  // ← ESTA ES LA SOLUCIÓN: usar idProducto
        nombre: producto.producto,
        precio: Number(producto.precioActual),
        imagen: producto.imagenesProducto && producto.imagenesProducto.length > 0 
                ? producto.imagenesProducto[0].urlImagen 
                : 'https://placehold.co/400x300/363636/ffffff?text=Mueble+España',
        cantidad: 1
    };
    
    console.log('🛒 Agregando producto:', productoCarrito);
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id == productoCarrito.id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
        console.log('🔄 Producto existente - Cantidad:', productoExistente.cantidad);
    } else {
        carrito.push(productoCarrito);
        console.log('🆕 Nuevo producto agregado');
    }
    
    saveCarrito(carrito);
    updateCartBadges(); 

    console.log('📦 Carrito actual:', carrito);
}

// =========================================
// 2. LÓGICA DE CARGA DE PRODUCTOS
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('productInfo');
    const loadingMessage = document.getElementById('loading-message');
    
    if (!container) {
        console.log('No se encontró productInfo en esta página');
        return;
    }
    
    updateCartBadges();

    fetch(API_URL,{
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                 }
            })
        .then(respuesta => {
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }
            return respuesta.json();
        })
        .then(productos => {
            if(loadingMessage) loadingMessage.remove(); 
            
            if (container) {
                container.innerHTML = ''; 

                console.log('🎯 Productos cargados:', productos);

                // Dibuja las tarjetas de productos en el nuevo formato
                productos.forEach((producto) => {
                    // Generamos la imagen automáticamente según el idProducto
                    let primeraImagenUrl = '../assets/catalogos/linea_blanca/default.png'; // fallback global

                    if (producto.imagenesProducto && producto.imagenesProducto.length > 0 && producto.imagenesProducto[0].urlImagen) {
                        // Usamos la imagen que devuelve la API si existe
                        primeraImagenUrl = producto.imagenesProducto[0].urlImagen;
                    } else if (producto.idProducto) {
                        // Generamos ruta automáticamente según el idProducto
                        primeraImagenUrl = `../assets/catalogos/linea_blanca/lineablanca_${producto.idProducto}.png`;
                    }

                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-md-6 col-lg-3';

                    const cardHtml = `
                        <article class="product-card">
                            <div class="product-image-container">
                                <img src="${primeraImagenUrl}" 
                                     alt="${producto.producto}" 
                                     class="product-image" loading="lazy"
                                     onerror="this.onerror=null; this.src='../assets/catalogos/linea_blanca/default.png';">
                                <span class="product-badge">Oferta</span>
                                <button class="product-favorite" aria-label="Agregar a favoritos">
                                    <i class="bi bi-heart"></i>
                                </button>
                            </div>
                            <div class="product-info">
                                <h3 class="product-title">${producto.producto}</h3>
                                <div class="product-rating">
                                    <div class="stars">
                                        <i class="bi bi-star-fill"></i>
                                        <i class="bi bi-star-fill"></i>
                                        <i class="bi bi-star-fill"></i>
                                        <i class="bi bi-star-fill"></i>
                                        <i class="bi bi-star-half"></i>
                                    </div>
                                    <span class="rating-count">(28)</span>
                                </div>
                                <div class="product-price">
                                    <span class="current-price">$${producto.precioActual ? Number(producto.precioActual).toFixed(2) : '0.00'} MXN</span>
                                    <span class="old-price">$17,499</span>
                                </div>
                                <button class="btn btn-custom-primary btn-add-cart">
                                    <i class="bi bi-cart-plus"></i>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </article>
                    `;

                    colDiv.innerHTML = cardHtml;

                    // Botón de añadir al carrito
                    const boton = colDiv.querySelector('.btn-add-cart');
                    boton.addEventListener('click', () => {
                        console.log('🖱️ Click en:', producto.producto, 'ID:', producto.idProducto);
                        anadirAlCarrito(producto);
                    });

                    // Botón de favoritos (opcional)
                    const favBoton = colDiv.querySelector('.product-favorite');
                    favBoton.addEventListener('click', (e) => {
                        e.preventDefault();
                        console.log('❤️ Agregar a favoritos:', producto.producto);
                        // Aquí puedes agregar la lógica para favoritos
                    });

                    container.appendChild(colDiv);
                });
            }
        })
        .catch(error => {
            console.error("❌ Error al cargar productos:", error);
            if(loadingMessage && loadingMessage.parentNode) {
                loadingMessage.remove(); 
            }
            if (container) {
                container.innerHTML = `
                    <div class="col-12 text-center alert alert-danger" role="alert">
                        Error al conectar con el backend (${API_URL}). Asegúrate de que tu servidor Spring esté corriendo.
                    </div>
                `;
            }
        });
});

// Hacer funciones disponibles globalmente
window.anadirAlCarrito = anadirAlCarrito;
window.updateCartBadges = updateCartBadges;
window.getCarrito = getCarrito;

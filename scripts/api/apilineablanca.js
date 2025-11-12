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
    
    console.log('Agregando producto:', productoCarrito);
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id == productoCarrito.id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
        console.log('Producto existente - Cantidad:', productoExistente.cantidad);
    } else {
        carrito.push(productoCarrito);
        console.log('Nuevo producto agregado');
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

    fetch(API_URL)
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

                console.log(' Productos cargados:', productos);

                // Dibuja las tarjetas de productos
                productos.forEach((producto) => {
                    
                    let primeraImagenUrl = 'https://placehold.co/400x300/363636/ffffff?text=Mueble+España';
                    if (producto.imagenesProducto && producto.imagenesProducto.length > 0 && producto.imagenesProducto[0].urlImagen) {
                        primeraImagenUrl = producto.imagenesProducto[0].urlImagen;
                    }

                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-lg-3 col-md-4 col-6';

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
                                    <span class="fs-30 fw-bold text-success">$${producto.precioActual ? Number(producto.precioActual).toFixed(2) : '0.00'}</span>
                                    <button class="btn btn-primary btn-sm anadir-btn">
                                        <i class="bi bi-cart-plus"></i> Agregar al carrito 
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    colDiv.innerHTML = cardHtml;
                    
                    const boton = colDiv.querySelector('.anadir-btn');
                    boton.addEventListener('click', () => {
                        console.log('Click en:', producto.producto, 'ID:', producto.idProducto);
                        anadirAlCarrito(producto);
                    });

                    container.appendChild(colDiv);
                });
            }
        })
        .catch(error => {
            console.error(" Error al cargar productos:", error);
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
window.getCarrito = getCarrito;*/
// URL DE TU API DE SPRING - CON IMÁGENES
const API_URL = 'http://localhost:8080/api/productos/activos-con-imagenes';

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
    
    const productoCarrito = {
        id: producto.idProducto,
        nombre: producto.producto,
        precio: Number(producto.precioActual),
        imagen: producto.imagenes && producto.imagenes.length > 0 
                ? producto.imagenes[0].urlImagen 
                : 'https://placehold.co/400x300/363636/ffffff?text=Mueble+España',
        cantidad: 1
    };
    
    console.log('Agregando producto:', productoCarrito);
    
    // Verificar si el producto ya existe en el carrito
    const productoExistente = carrito.find(item => item.id == productoCarrito.id);
    
    if (productoExistente) {
        productoExistente.cantidad += 1;
        console.log('Producto existente - Cantidad:', productoExistente.cantidad);
    } else {
        carrito.push(productoCarrito);
        console.log('Nuevo producto agregado');
    }
    
    saveCarrito(carrito);
    updateCartBadges(); 
    
    // ✅ AGREGAR ESTA LÍNEA: Mostrar el toast de confirmación
    mostrarToast('Producto agregado al carrito', productoCarrito.nombre, 'success');
    
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

    fetch(API_URL)
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

                console.log(' Productos cargados:', productos);

                // Dibuja las tarjetas de productos con el nuevo formato
                productos.forEach((producto) => {
                    
                    // ✅ USAR IMÁGENES REALES DEL BACKEND
                    let primeraImagenUrl = 'https://placehold.co/400x300/363636/ffffff?text=Mueble+España';
                    if (producto.imagenes && producto.imagenes.length > 0 && producto.imagenes[0].urlImagen) {
                        primeraImagenUrl = producto.imagenes[0].urlImagen;
                    }

                    const colDiv = document.createElement('div');
                    colDiv.className = 'col-md-6 col-lg-3';

                    // Generar rating aleatorio para demostración
                    const rating = Math.floor(Math.random() * 5) + 1;
                    const ratingCount = Math.floor(Math.random() * 50) + 10;
                    const hasOffer = Math.random() > 0.7; // 30% de probabilidad de oferta
                    const oldPrice = hasOffer ? (Number(producto.precioActual) * 1.2).toFixed(2) : null;

                    const cardHtml = `
                        <article class="product-card" style="display: flex; flex-direction: column; height: 100%;">
                            <div class="product-image-container">
                                <img src="${primeraImagenUrl}" 
                                     alt="${producto.producto}" 
                                     class="product-image" loading="lazy"
                                     onerror="this.onerror=null; this.src='https://placehold.co/400x300/363636/ffffff?text=Mueble+España';">
                                ${hasOffer ? '<span class="product-badge">Oferta</span>' : ''}
                                <button class="product-favorite" aria-label="Agregar a favoritos">
                                    <i class="bi bi-heart"></i>
                                </button>
                            </div>
                            <div class="product-info" style="display: flex; flex-direction: column; flex-grow: 1;">
                                <h3 class="product-title">${producto.producto}</h3>
                                <div class="product-rating">
                                    <div class="stars">
                                        ${Array.from({length: 5}, (_, i) => 
                                            `<i class="bi ${i < rating ? 'bi-star-fill' : 'bi-star'}"></i>`
                                        ).join('')}
                                    </div>
                                    <span class="rating-count">(${ratingCount})</span>
                                </div>
                                <div class="product-price">
                                    <span class="current-price">$${Number(producto.precioActual).toFixed(2)} MXN</span>
                                    ${hasOffer ? `<span class="old-price">$${oldPrice}</span>` : ''}
                                </div>
                                <button class="btn btn-custom-primary btn-add-cart" style="margin-top: auto; width: 100%;">
                                    <i class="bi bi-cart-plus"></i>
                                    Agregar al Carrito
                                </button>
                            </div>
                        </article>
                    `;
                    
                    colDiv.innerHTML = cardHtml;
                    
                    // Botón de agregar al carrito
                    const boton = colDiv.querySelector('.btn-add-cart');
                    boton.addEventListener('click', () => {
                        console.log('Click en:', producto.producto, 'ID:', producto.idProducto);
                        anadirAlCarrito(producto);
                    });

                    // Botón de favoritos
                    const favBoton = colDiv.querySelector('.product-favorite');
                    favBoton.addEventListener('click', (e) => {
                        e.preventDefault();
                        const icon = favBoton.querySelector('i');
                        icon.classList.toggle('bi-heart');
                        icon.classList.toggle('bi-heart-fill');
                        console.log('Producto agregado a favoritos:', producto.producto);
                    });

                    container.appendChild(colDiv);
                });
            }
        })
        .catch(error => {
            console.error(" Error al cargar productos:", error);
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
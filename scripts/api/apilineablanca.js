/* Hacer funciones disponibles globalmente
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

    const token = localStorage.getItem('token');
    console.log(token);

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

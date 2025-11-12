// URL DE TU API DE SPRING
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
        });
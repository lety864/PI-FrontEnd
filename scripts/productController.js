import { products as initialProducts } from "../scripts/productos.js";

// Versión de productos - se cambia este número cuando se actualice el productos.js
const PRODUCTS_VERSION = '1.1';

const productsContainer = document.getElementById("productInfo");

// Obtiene productos desde localStorage o carga los iniciales si hay cambios
function getProducts() {
  const productsFromStorage = localStorage.getItem('productos');
  const versionFromStorage = localStorage.getItem('productosVersion');

  // Si la versión de product.js cambió, actualiza los productos
  if (versionFromStorage !== PRODUCTS_VERSION) {
    console.log("Nueva versión detectada. Actualizando productos...");
    localStorage.setItem('productos', JSON.stringify(initialProducts));
    localStorage.setItem('productosVersion', PRODUCTS_VERSION);
    return initialProducts;
  }

  if (productsFromStorage) {
    console.log("Cargando productos desde localStorage...");
    return JSON.parse(productsFromStorage);
  } else {
    console.log("✨ Primera carga: guardando productos en localStorage...");
    localStorage.setItem('productos', JSON.stringify(initialProducts));
    localStorage.setItem('productosVersion', PRODUCTS_VERSION);
    return initialProducts;
  }
}
//Obtenemos los productos a mostrar.
const productsToShow = getProducts();

// Creamos la función para cargar los artículos en el HTML.
function cargarArticulos() {
  if (!productsContainer) {
    console.error("No se encontró el elemento con el id 'productInfo'");
    return;
  }

  const productsHTML = productsToShow.map((producto) => {
    const precioFormateado = producto.precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: producto.moneda || 'MXN'
    });
//NUEVA ESTRUCTURA DEL HTML PARA MOSTRAR PRODUCTOS
    return `
      <div class="col-md-6 col-lg-3">
        <article class="product-card">
          <div class="product-image-container">
            <img src="${producto.img}" 
                 alt="${producto.nombre}" 
                 class="product-image" loading="lazy">
            
            <span class="product-badge">Nuevo</span> 
            
            <button class="product-favorite" aria-label="Agregar a favoritos">
                <i class="bi bi-heart"></i>
            </button>
          </div>
          <div class="product-info">
            <h3 class="product-title">${producto.nombre}</h3>
            
            <div class="product-rating">
                <div class="stars">
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-half"></i>
                </div>
                <span class="rating-count">(${producto.stock * 5 + 12})</span>
            </div>

            <div class="product-price">
                <span class="current-price">${precioFormateado}</span>
            </div>

            <button class="btn btn-custom-primary btn-add-cart" data-id="${producto.id}">
                <i class="bi bi-cart-plus"></i>
                Agregar al Carrito
            </button>
          </div>
        </article>
      </div>
    `;
  }).join('');

  productsContainer.innerHTML = productsHTML;
}

cargarArticulos();
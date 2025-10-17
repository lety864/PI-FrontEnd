import { products as initialProducts } from "../scripts/productos.js";

// 1. Obtenemos el contenedor donde se mostrarán los productos.
const productsContainer = document.getElementById("productInfo");

// Función para obtener los productos: desde localStorage o desde el archivo inicial.
function getProducts() {
  // Intentamos obtener los productos de localStorage.
  const productsFromStorage = localStorage.getItem('productos');

  if (productsFromStorage) {
    // Si existen en localStorage, los convertimos de string a objeto y los retornamos.
    console.log("Cargando productos desde localStorage... 📦");
    return JSON.parse(productsFromStorage);
  } else {
    // Si no existen, usamos los productos importados del archivo JS.
    console.log("Cargando productos por primera vez y guardando en localStorage... ✨");
    // Los guardamos en localStorage para futuras visitas. Deben ser guardados como string.
    localStorage.setItem('productos', JSON.stringify(initialProducts));
    return initialProducts;
  }
}

// 2. Obtenemos los productos a mostrar.
const productsToShow = getProducts();

// 3. Creamos la función para cargar los artículos en el HTML.
function cargarArticulos() {
  if (!productsContainer) {
    console.error("No se encontró el elemento con el id 'productInfo'");
    return;
  }

  const productsHTML = productsToShow.map((producto) => {
    // Formateamos el precio para que se vea bien
    const precioFormateado = producto.precio.toLocaleString('es-MX', {
      style: 'currency',
      currency: producto.moneda || 'MXN' // Usa la moneda del producto o MXN por defecto
    });

    // 👇 AQUÍ ESTÁ LA NUEVA ESTRUCTURA HTML 👇
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
                <span class="rating-count">(${producto.stock * 5 + 12})</span> </div>

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

// No olvides llamar a la función al final de tu script
cargarArticulos();
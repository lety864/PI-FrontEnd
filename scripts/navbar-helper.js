/**
 * NAVBAR HELPER - MUEBLERÍA ESPAÑA
 *
 * Ajusta dinámicamente las rutas del navbar según la ubicación de la página actual.
 * Soluciona el problema de rutas rotas cuando navegas entre index.html y páginas/*.html
 *
 * INCLUIR EN: TODAS LAS PÁGINAS
 */

document.addEventListener('DOMContentLoaded', () => {
    ajustarRutasNavbar();
});

/**
 * Detecta si estamos en la raíz o en subcarpeta /paginas/
 * @returns {boolean} true si estamos en raíz (index.html)
 */
function esRaiz() {
    const path = window.location.pathname;

    // Estamos en raíz si:
    // - La ruta es exactamente '/'
    // - Termina en 'index.html'
    // - No incluye '/paginas/' en la ruta
    return path === '/' ||
           path.endsWith('/index.html') ||
           path.endsWith('/Front-Muebleria/') ||
           (!path.includes('/paginas/') && !path.includes('/admin/'));
}

/**
 * Obtiene el prefijo de ruta según la ubicación actual
 * @returns {string} '' si estamos en raíz, '../' si estamos en subcarpeta
 */
function obtenerPrefijoRuta() {
    return esRaiz() ? '' : '../';
}

/**
 * Ajusta las rutas de todos los links del navbar
 */
function ajustarRutasNavbar() {
    const enRaiz = esRaiz();

    // Ajustar links del carrito
    ajustarLinksCarrito(enRaiz);

    // Ajustar links de navegación principal
    ajustarLinksNavegacion(enRaiz);

    // Ajustar links de categorías
    ajustarLinksCategoria(enRaiz);

    // Ajustar link del logo
    ajustarLinkLogo(enRaiz);

    // Ajustar link de perfil/usuario
    ajustarLinkPerfil(enRaiz);
}

/**
 * Ajusta los links del carrito en navbar
 * @param {boolean} enRaiz - Si estamos en la raíz
 */
function ajustarLinksCarrito(enRaiz) {
    const linksCarrito = document.querySelectorAll('a[href*="carrito.html"]');

    linksCarrito.forEach(link => {
        // No ajustar si el href es solo '#' (página de carrito misma)
        if (link.getAttribute('href') === '#') {
            return;
        }

        if (enRaiz) {
            link.href = 'paginas/carrito.html';
        } else {
            link.href = 'carrito.html';
        }
    });
}

/**
 * Ajusta los links de navegación principal (Inicio, Nosotros, Contacto)
 * @param {boolean} enRaiz - Si estamos en la raíz
 */
function ajustarLinksNavegacion(enRaiz) {
    // Links a páginas principales
    const paginasPrincipales = {
        'nosotros.html': 'nosotros.html',
        'contacto.html': 'contacto.html',
        'catalogo.html': 'catalogo.html',
        'ofertas.html': 'ofertas.html',
        'preguntas.html': 'preguntas.html',
        'politicas.html': 'politicas.html'
    };

    Object.keys(paginasPrincipales).forEach(pagina => {
        const links = document.querySelectorAll(`a[href*="${pagina}"]`);

        links.forEach(link => {
            if (enRaiz) {
                link.href = `paginas/${pagina}`;
            } else {
                link.href = pagina;
            }
        });
    });
}

/**
 * Ajusta los links de categorías (Salas, Dormitorio, etc.)
 * @param {boolean} enRaiz - Si estamos en la raíz
 */
function ajustarLinksCategoria(enRaiz) {
    const categorias = [
        'salas.html',
        'dormitorios.html',
        'comedores.html',
        'roperos.html',
        'colchones.html',
        'lineaBlanca.html'
    ];

    categorias.forEach(categoria => {
        const links = document.querySelectorAll(`a[href*="${categoria}"]`);

        links.forEach(link => {
            if (enRaiz) {
                link.href = `paginas/${categoria}`;
            } else {
                link.href = categoria;
            }
        });
    });
}

/**
 * Ajusta el link del logo para que siempre vuelva a index.html
 * @param {boolean} enRaiz - Si estamos en la raíz
 */
function ajustarLinkLogo(enRaiz) {
    const logos = document.querySelectorAll('.navbar-brand[href*="index.html"]');

    logos.forEach(logo => {
        if (enRaiz) {
            logo.href = 'index.html';
        } else {
            logo.href = '../index.html';
        }
    });
}

/**
 * Ajusta el link de perfil/usuario
 * @param {boolean} enRaiz - Si estamos en la raíz
 */
function ajustarLinkPerfil(enRaiz) {
    const linksPerfil = document.querySelectorAll('a[href*="perfil.html"]');

    linksPerfil.forEach(link => {
        if (enRaiz) {
            link.href = 'paginas/perfil.html';
        } else {
            link.href = 'perfil.html';
        }
    });

    // También ajustar login/registro
    const linksLogin = document.querySelectorAll('a[href*="login.html"]');
    linksLogin.forEach(link => {
        if (enRaiz) {
            link.href = 'paginas/login.html';
        } else {
            link.href = 'login.html';
        }
    });

    const linksRegistro = document.querySelectorAll('a[href*="registo.html"], a[href*="registro.html"]');
    linksRegistro.forEach(link => {
        if (enRaiz) {
            link.href = 'paginas/registo.html';
        } else {
            link.href = 'registo.html';
        }
    });
}

/**
 * Función helper global para obtener ruta correcta
 * @param {string} archivo - Nombre del archivo (ej: 'carrito.html')
 * @returns {string} - Ruta correcta según ubicación
 */
function obtenerRuta(archivo) {
    const enRaiz = esRaiz();

    // Si ya incluye paginas/ o ../, devolver tal cual
    if (archivo.includes('paginas/') || archivo.includes('../')) {
        return archivo;
    }

    // Si es index.html
    if (archivo === 'index.html') {
        return enRaiz ? 'index.html' : '../index.html';
    }

    // Para cualquier otra página
    return enRaiz ? `paginas/${archivo}` : archivo;
}

// Hacer la función disponible globalmente
window.obtenerRuta = obtenerRuta;
window.esRaiz = esRaiz;
window.obtenerPrefijoRuta = obtenerPrefijoRuta;